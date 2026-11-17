import { verticals } from "@/lib/verticals";
import { solutions } from "@/lib/solutions";

/** Shared by the form (client) and the API route (server), so both validate identically. */
export type EnquiryInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirement: string;
  /** "guidance", a solution id or a vertical id. */
  interest: string;
  /** Honeypot: real visitors never fill this. */
  website: string;
  /** Milliseconds between the form opening and submit. */
  elapsed: number;
  /** Per-form idempotency key. */
  key: string;
  source: {
    page: string;
    referrer: string;
    utm: Record<string, string>;
  };
};

export type EnquiryErrors = Partial<
  Record<"name" | "email" | "phone" | "contact" | "requirement", string>
>;

export const interestOptions = [
  { value: "guidance", label: "I am not sure yet" },
  ...solutions.map((s) => ({ value: `solution:${s.id}`, label: `Solution: ${s.title}` })),
  ...verticals.map((v) => ({ value: `service:${v.id}`, label: `Service: ${v.name}` })),
];

export const interestValues = new Set(interestOptions.map((o) => o.value));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;

export function validateEnquiry(
  v: Pick<EnquiryInput, "name" | "email" | "phone" | "requirement">,
): EnquiryErrors {
  const e: EnquiryErrors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.requirement.trim()) e.requirement = "Describe your requirement.";
  const email = v.email.trim();
  const phone = v.phone.trim();
  if (!email && !phone) e.contact = "Enter an email address or a phone number.";
  if (email && !EMAIL.test(email)) e.email = "Enter an email address in the format name@example.com.";
  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (!PHONE_CHARS.test(phone) || digits < 7 || digits > 15)
      e.phone = "Enter a phone number with 7 to 15 digits. You can include + and spaces.";
  }
  return e;
}

export const LIMITS = { name: 120, company: 160, email: 200, phone: 40, requirement: 4000 } as const;
