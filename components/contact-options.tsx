import { TrackedAnchor } from "@/components/cta-link";
import { contact } from "@/config/site";
import { safeMailto, safeTel } from "@/lib/links";

/** Phone, WhatsApp and email actions. Each renders only when its detail is configured. */
export function ContactOptions({ className = "" }: { className?: string }) {
  const tel = safeTel(contact.phone);
  const mail = safeMailto(contact.email);
  const wa =
    contact.whatsapp && /^\d{8,15}$/.test(contact.whatsapp)
      ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent("Hello Adinn, I would like to discuss a marketing requirement.")}`
      : null;
  if (!tel && !mail && !wa) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {wa && (
        <li>
          <TrackedAnchor event="whatsapp_click" label="whatsapp" href={wa} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            WhatsApp us
            <span className="sr-only"> (opens in a new tab)</span>
          </TrackedAnchor>
        </li>
      )}
      {tel && (
        <li>
          <TrackedAnchor event="phone_click" label="phone" href={tel} className="btn btn-secondary">
            Call {contact.phone}
          </TrackedAnchor>
        </li>
      )}
      {mail && (
        <li>
          <TrackedAnchor event="email_click" label="email" href={mail} className="btn btn-secondary">
            Email {contact.email}
          </TrackedAnchor>
        </li>
      )}
    </ul>
  );
}
