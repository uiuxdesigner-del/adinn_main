import { createHash } from "node:crypto";
import { interestValues, LIMITS, validateEnquiry, type EnquiryInput } from "@/lib/enquiry";

/**
 * Server-side enquiry intake.
 *
 * Success is returned ONLY when the CRM webhook has accepted the lead (2xx). If the webhook is not
 * configured, or the CRM rejects or times out, the visitor is told the enquiry was NOT received.
 *
 * Environment (see docs/LEAD-SETUP.md):
 *   CRM_WEBHOOK_URL    required to accept enquiries (HTTPS endpoint of the CRM / automation tool)
 *   CRM_WEBHOOK_TOKEN  optional bearer token sent to the webhook
 *   ENQUIRY_DEV_ACCEPT set to "true" ONLY in local development to log leads instead of forwarding
 *
 * Spam protection: honeypot field, minimum fill time, per-IP rate limit, field limits.
 * Duplicates: per-form idempotency key and a content hash, remembered for 10 minutes.
 * The in-memory rate limit and duplicate cache are per server instance; use the CRM's own
 * de-duplication (or a shared store) when running several instances.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
const seen = new Map<string, number>();

function sweep(now: number) {
  for (const [k, t] of seen) if (now - t > WINDOW_MS) seen.delete(k);
  for (const [k, list] of hits) {
    const kept = list.filter((t) => now - t < WINDOW_MS);
    if (kept.length) hits.set(k, kept);
    else hits.delete(k);
  }
}

const json = (body: Record<string, unknown>, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(request: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  const src = (raw.source ?? {}) as Record<string, unknown>;
  const utmIn = (src.utm ?? {}) as Record<string, unknown>;
  const utm: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
    const v = str(utmIn[k], 200);
    if (v) utm[k] = v;
  }
  const input: EnquiryInput = {
    name: str(raw.name, LIMITS.name).trim(),
    company: str(raw.company, LIMITS.company).trim(),
    email: str(raw.email, LIMITS.email).trim(),
    phone: str(raw.phone, LIMITS.phone).trim(),
    requirement: str(raw.requirement, LIMITS.requirement).trim(),
    interest: str(raw.interest, 80),
    website: str(raw.website, 200),
    elapsed: typeof raw.elapsed === "number" ? raw.elapsed : 0,
    key: str(raw.key, 80),
    source: { page: str(src.page, 300), referrer: str(src.referrer, 300), utm },
  };

  // Spam traps answer like a success to bots but are never forwarded.
  if (input.website || input.elapsed < 2500) return json({ ok: true, status: "accepted" }, 200);

  const errors = validateEnquiry(input);
  if (Object.keys(errors).length) return json({ ok: false, error: "validation", fields: errors }, 422);
  if (!interestValues.has(input.interest)) input.interest = "guidance";

  const now = Date.now();
  sweep(now);
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const list = hits.get(ip) ?? [];
  if (list.length >= MAX_PER_WINDOW) return json({ ok: false, error: "rate_limited" }, 429);

  const fingerprint = createHash("sha256")
    .update([input.email.toLowerCase(), input.phone.replace(/\D/g, ""), input.requirement].join("|"))
    .digest("hex");
  if (seen.has(`k:${input.key}`) || seen.has(`h:${fingerprint}`)) {
    return json({ ok: true, status: "duplicate" }, 200);
  }

  const lead = {
    receivedAt: new Date(now).toISOString(),
    name: input.name,
    company: input.company || null,
    email: input.email || null,
    phone: input.phone || null,
    requirement: input.requirement,
    interest: input.interest,
    source: { site: "adinn-website", landingPage: input.source.page, referrer: input.source.referrer || null, ...input.source.utm },
  };

  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    if (process.env.ENQUIRY_DEV_ACCEPT === "true" && process.env.NODE_ENV !== "production") {
      console.log("[enquiry:dev] not forwarded", lead);
      list.push(now);
      hits.set(ip, list);
      seen.set(`k:${input.key}`, now);
      seen.set(`h:${fingerprint}`, now);
      return json({ ok: true, status: "accepted-dev" }, 200);
    }
    return json({ ok: false, error: "not_configured" }, 503);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CRM_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.CRM_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return json({ ok: false, error: "upstream" }, 502);
  } catch {
    return json({ ok: false, error: "upstream" }, 502);
  }

  list.push(now);
  hits.set(ip, list);
  seen.set(`k:${input.key}`, now);
  seen.set(`h:${fingerprint}`, now);
  return json({ ok: true, status: "accepted" }, 200);
}
