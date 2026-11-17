"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  interestOptions,
  interestValues,
  LIMITS,
  validateEnquiry,
  type EnquiryErrors,
} from "@/lib/enquiry";
import { track } from "@/lib/track";

type Values = {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirement: string;
  interest: string;
  website: string; // honeypot
};
type Status = "idle" | "sending" | "sent" | "failed";

const empty: Values = {
  name: "",
  company: "",
  email: "",
  phone: "",
  requirement: "",
  interest: "", // "" = not chosen by the visitor yet
  website: "",
};

const fieldIds = {
  name: "enquiry-name",
  email: "enquiry-email",
  phone: "enquiry-phone",
  contact: "enquiry-email",
  requirement: "enquiry-requirement",
} as const;

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Enquiry form. Submits to /api/enquiry; the confirmation appears only after the server reports that
 * the enquiry was accepted. Entered values are kept after any error. Browser-only data (landing
 * page, UTM parameters, preselected interest) is read after mount, so server and first client
 * render match.
 */
export function EnquiryForm({ source = "contact" }: { source?: string }) {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);
  const key = useRef("");
  const sending = useRef(false);
  // The address query is browser-only: "" on the server and during hydration, the real value after.
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const wanted = new URLSearchParams(search).get("interest");
  const preselected = wanted && interestValues.has(wanted) ? wanted : null;
  const interest = values.interest || preselected || "guidance";

  useEffect(() => {
    startedAt.current = Date.now();
    key.current = newKey();
  }, []);

  useEffect(() => {
    if (attempt > 0) summaryRef.current?.focus();
  }, [attempt]);
  useEffect(() => {
    if (status === "sent" || status === "failed") resultRef.current?.focus();
  }, [status]);

  const set =
    (k: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((prev) => ({ ...prev, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending.current) return; // duplicate-submission guard (double click, Enter twice)
    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    sending.current = true;
    setStatus("sending");
    setFailure(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          interest,
          elapsed: Date.now() - startedAt.current,
          key: key.current,
          source: {
            page: `${window.location.pathname}${window.location.search}`,
            referrer: document.referrer,
            utm: Object.fromEntries(
              ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].flatMap((k) => {
                const v = new URLSearchParams(window.location.search).get(k);
                return v ? [[k, v]] : [];
              }),
            ),
          },
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: EnquiryErrors;
      };
      if (res.ok && body.ok) {
        track("enquiry_submitted", { form: source, interest });
        setStatus("sent");
        return;
      }
      if (body.fields) {
        setErrors(body.fields);
        setAttempt((n) => n + 1);
        setStatus("idle");
        return;
      }
      setFailure(
        body.error === "rate_limited"
          ? "Too many enquiries were sent from this connection. Please wait a few minutes or contact us directly."
          : body.error === "not_configured"
            ? "Online enquiries are not available right now, so your enquiry has not been sent. Please call, WhatsApp or email us instead."
            : "We could not send your enquiry, so it has not been received. Your details are still here: please try again or contact us directly.",
      );
      track("enquiry_failed", { form: source, reason: body.error ?? "network" });
      setStatus("failed");
    } catch {
      setFailure(
        "We could not reach the server, so your enquiry has not been sent. Your details are still here: please try again or contact us directly.",
      );
      track("enquiry_failed", { form: source, reason: "network" });
      setStatus("failed");
    } finally {
      sending.current = false;
    }
  }

  const errorList = (Object.keys(errors) as (keyof EnquiryErrors)[]).map((k) => ({
    key: k,
    message: errors[k]!,
  }));
  const describe = (...ids: (string | false | undefined)[]) =>
    ids.filter(Boolean).join(" ") || undefined;

  if (status === "sent") {
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-ink p-6 outline-none"
      >
        <h3 className="text-h3">Thank you. We have received your enquiry.</h3>
        <p className="mt-2 text-ash">
          A member of the Adinn team will read it and get back to you using the details you gave.
        </p>
        <button
          type="button"
          className="btn btn-secondary mt-5"
          onClick={() => {
            setValues(empty);
            setErrors({});
            setStatus("idle");
            key.current = newKey();
            startedAt.current = Date.now();
          }}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={status === "sending"}>
      {status === "failed" && failure && (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-lg border-2 border-ink p-4 outline-none"
        >
          <h3 className="text-h3">Your enquiry has not been sent</h3>
          <p className="mt-1">{failure}</p>
        </div>
      )}

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-lg border-2 border-ink p-4 outline-none"
        >
          <h3 className="text-h3">Please fix the following</h3>
          <ul className="mt-2 list-disc pl-5">
            {errorList.map(({ key: k, message }) => (
              <li key={k}>
                <a
                  href={`#${fieldIds[k]}`}
                  className="link"
                  onClick={(ev) => {
                    ev.preventDefault();
                    document.getElementById(fieldIds[k])?.focus();
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="enquiry-name" className="block font-medium">
            Name (required)
          </label>
          <input
            id="enquiry-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            required
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describe(errors.name && "enquiry-name-error")}
            value={values.name}
            onChange={set("name")}
            className="field mt-1"
          />
          {errors.name && (
            <p id="enquiry-name-error" className="mt-1 font-medium">
              Error: {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="enquiry-company" className="block font-medium">
            Company (optional)
          </label>
          <input
            id="enquiry-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={LIMITS.company}
            value={values.company}
            onChange={set("company")}
            className="field mt-1"
          />
        </div>

        <fieldset className="md:col-span-2">
          <legend className="font-medium">
            How can we reach you? Provide an email, a phone number, or both (at least one is required).
          </legend>
          {errors.contact && (
            <p id="enquiry-contact-error" className="mt-1 font-medium">
              Error: {errors.contact}
            </p>
          )}
          <div className="mt-2 grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="enquiry-email" className="block">
                Email
              </label>
              <input
                id="enquiry-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={LIMITS.email}
                aria-invalid={errors.email || errors.contact ? true : undefined}
                aria-describedby={describe(
                  errors.contact && "enquiry-contact-error",
                  errors.email && "enquiry-email-error",
                )}
                value={values.email}
                onChange={set("email")}
                className="field mt-1"
              />
              {errors.email && (
                <p id="enquiry-email-error" className="mt-1 font-medium">
                  Error: {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="enquiry-phone" className="block">
                Phone
              </label>
              <input
                id="enquiry-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={LIMITS.phone}
                aria-invalid={errors.phone || errors.contact ? true : undefined}
                aria-describedby={describe(
                  errors.contact && "enquiry-contact-error",
                  errors.phone && "enquiry-phone-error",
                )}
                value={values.phone}
                onChange={set("phone")}
                className="field mt-1"
              />
              {errors.phone && (
                <p id="enquiry-phone-error" className="mt-1 font-medium">
                  Error: {errors.phone}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <div className="md:col-span-2">
          <label htmlFor="enquiry-interest" className="block font-medium">
            What is this about? (optional)
          </label>
          <select
            id="enquiry-interest"
            name="interest"
            value={interest}
            onChange={set("interest")}
            className="field mt-1"
          >
            {interestOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="enquiry-requirement" className="block font-medium">
            Requirement (required)
          </label>
          <textarea
            id="enquiry-requirement"
            name="requirement"
            rows={5}
            maxLength={LIMITS.requirement}
            required
            aria-required="true"
            aria-invalid={errors.requirement ? true : undefined}
            aria-describedby={describe(errors.requirement && "enquiry-requirement-error")}
            value={values.requirement}
            onChange={set("requirement")}
            className="field mt-1"
          />
          {errors.requirement && (
            <p id="enquiry-requirement-error" className="mt-1 font-medium">
              Error: {errors.requirement}
            </p>
          )}
        </div>

        {/* Honeypot: hidden from people and assistive technology, tempting to bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="enquiry-website">Leave this field empty</label>
          <input
            id="enquiry-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set("website")}
          />
        </div>
      </div>

      <p className="text-note mt-5 text-ash">
        We use these details only to reply to your enquiry. Read the{" "}
        <Link href="/privacy" className="link">
          privacy notice
        </Link>
        .
      </p>
      <button type="submit" className="btn btn-primary mt-5" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}
