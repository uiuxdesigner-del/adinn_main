"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { verticals } from "@/lib/verticals";

type Values = {
  name: string;
  company: string;
  email: string;
  phone: string;
  requirement: string;
  vertical: string;
};
type Errors = Partial<Record<"name" | "email" | "phone" | "contact" | "requirement", string>>;

const empty: Values = {
  name: "",
  company: "",
  email: "",
  phone: "",
  requirement: "",
  vertical: "guidance",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts international formats: +, digits, spaces, dots, dashes, brackets; 7–15 digits.
const PHONE_CHARS = /^\+?[\d\s().-]+$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.requirement.trim()) e.requirement = "Describe your requirement.";
  const email = v.email.trim();
  const phone = v.phone.trim();
  if (!email && !phone) e.contact = "Enter an email address or a phone number.";
  if (email && !EMAIL.test(email))
    e.email = "Enter an email address in the format name@example.com.";
  if (phone) {
    const digits = phone.replace(/\D/g, "").length;
    if (!PHONE_CHARS.test(phone) || digits < 7 || digits > 15)
      e.phone = "Enter a phone number with 7 to 15 digits. You can include + and spaces.";
  }
  return e;
}

const fieldIds = {
  name: "enquiry-name",
  email: "enquiry-email",
  phone: "enquiry-phone",
  contact: "enquiry-email",
  requirement: "enquiry-requirement",
} as const;

export function EnquiryForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const [attempt, setAttempt] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt > 0) summaryRef.current?.focus();
  }, [attempt]);
  useEffect(() => {
    if (submitted) confirmRef.current?.focus();
  }, [submitted]);

  const set = (key: keyof Values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((prev) => ({ ...prev, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempt((n) => n + 1);
      return;
    }
    setSubmitted({ ...values });
  }

  const verticalName =
    verticals.find((v) => v.id === submitted?.vertical)?.name ?? "I need guidance";
  const errorList = (Object.keys(errors) as (keyof Errors)[]).map((k) => ({
    key: k,
    message: errors[k]!,
  }));

  if (submitted) {
    const rows: [string, string][] = [
      ["Name", submitted.name],
      ["Company", submitted.company || "Not provided"],
      ["Email", submitted.email || "Not provided"],
      ["Phone", submitted.phone || "Not provided"],
      ["Vertical", verticalName],
      ["Requirement", submitted.requirement],
    ];
    return (
      <div
        ref={confirmRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-ink p-6 outline-none"
      >
        <h3 className="text-h3">Preview complete: nothing was sent</h3>
        <p className="mt-2">
          This submission was simulated. No information was sent or stored, and
          Adinn has not received this enquiry.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-[8rem_1fr]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-medium">{k}</dt>
              <dd className="whitespace-pre-wrap break-words text-ash">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSubmitted(null)}
          >
            Edit enquiry
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setValues(empty);
              setErrors({});
              setSubmitted(null);
            }}
          >
            Start a new preview
          </button>
        </div>
      </div>
    );
  }

  const describe = (...ids: (string | false | undefined)[]) =>
    ids.filter(Boolean).join(" ") || undefined;

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="mb-6 rounded-lg bg-line px-4 py-3 text-note text-ash">
        Prototype only: this form does not send information. Fields marked
        required must be completed to preview an enquiry.
      </p>

      {errorList.length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 rounded-lg border-2 border-ink p-4 outline-none"
        >
          <h3 className="text-h3">Please fix the following</h3>
          <ul className="mt-2 list-disc pl-5">
            {errorList.map(({ key, message }) => (
              <li key={key}>
                <a
                  href={`#${fieldIds[key]}`}
                  className="link"
                  onClick={(ev) => {
                    ev.preventDefault();
                    document.getElementById(fieldIds[key])?.focus();
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
            value={values.company}
            onChange={set("company")}
            className="field mt-1"
          />
        </div>

        <fieldset className="md:col-span-2">
          <legend className="font-medium">
            How can we reach you? Provide an email, a phone number, or both.
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
          <label htmlFor="enquiry-vertical" className="block font-medium">
            Vertical (optional)
          </label>
          <select
            id="enquiry-vertical"
            name="vertical"
            value={values.vertical}
            onChange={set("vertical")}
            className="field mt-1"
          >
            <option value="guidance">I need guidance</option>
            {verticals.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
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
            required
            aria-required="true"
            aria-invalid={errors.requirement ? true : undefined}
            aria-describedby={describe(
              errors.requirement && "enquiry-requirement-error",
            )}
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
      </div>

      <p className="text-note mt-5 text-ash">
        Read the{" "}
        <Link href="/privacy" className="link">
          draft privacy notice
        </Link>{" "}
        for how this prototype handles information.
      </p>
      <button type="submit" className="btn btn-primary mt-5">
        Preview Enquiry
      </button>
    </form>
  );
}
