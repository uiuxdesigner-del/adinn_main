import Link from "next/link";
import { Container } from "@/components/ui";
import { ReviewNotesToggle } from "@/components/review-notes";
import { contact, social } from "@/config/site";
import { photos } from "@/lib/images";
import { safeHttpUrl, safeMailto, safeTel } from "@/lib/links";
import { mainNav, utilityNav } from "@/lib/navigation";
import { verticals } from "@/lib/verticals";

const linkClass = "transition-colors hover:text-ink";

export function Footer() {
  const email = safeMailto(contact.email);
  const phone = safeTel(contact.phone);
  const socials = social.flatMap((s) => {
    const url = safeHttpUrl(s.url);
    return url ? [{ label: s.label, url }] : [];
  });
  const anyPending = verticals.some((v) => !v.url);

  return (
    <footer className="mt-auto bg-line px-3 py-3 md:px-5 md:py-5">
      <Container className="rounded-2xl bg-white !px-6 py-8 md:!px-10 md:py-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.4fr_1fr]">
          <div>
            <p className="text-2xl font-semibold tracking-[0.04em]">ADINN</p>
            <p className="mt-3 max-w-sm text-ash">
              Advertising across outdoor, roadshows, events, retail branding,
              printing, wall painting and digital, from offices in Madurai,
              Chennai, Bangalore and Coimbatore.
            </p>
            {(email || phone) && (
              <ul className="mt-4 space-y-1">
                {email && (
                  <li>
                    <a href={email} className="link">
                      {contact.email}
                    </a>
                  </li>
                )}
                {phone && (
                  <li>
                    <a href={phone} className="link">
                      {contact.phone}
                    </a>
                  </li>
                )}
              </ul>
            )}
            {socials.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-note">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.url} className="link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label="Footer: main">
            <p className="font-semibold">Navigate</p>
            <ul className="mt-3 space-y-2 text-ash">
              <li>
                <Link href="/" className={linkClass}>
                  Home
                </Link>
              </li>
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: verticals">
            <p className="font-semibold">Our verticals</p>
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-ash sm:grid-cols-2 lg:grid-cols-1">
              {verticals.map((v) => (
                <li key={v.id}>
                  {v.url ? (
                    <a href={v.url} className={linkClass}>
                      {v.name}
                      <span className="sr-only"> (external website)</span>
                      <span aria-hidden="true">&nbsp;↗</span>
                    </a>
                  ) : (
                    <span>
                      {v.name}
                      <span className="sr-only">: website link awaiting confirmation</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {anyPending && (
              <p className="text-note mt-3 text-ash">
                Website links are awaiting confirmation.
              </p>
            )}
          </nav>

          <nav aria-label="Footer: company">
            <p className="font-semibold">Company</p>
            <ul className="mt-3 space-y-2 text-ash">
              {utilityNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-note text-ash md:flex-row md:items-start md:justify-between">
          <div>
            <p>Internal review prototype. Content is draft until approved.</p>
            <details className="mt-2">
              <summary className="cursor-pointer">Photo credits</summary>
              <p className="mt-2 max-w-xl">
                Photographs are illustrative and are not Adinn projects. Via
                Wikimedia Commons:
              </p>
              <ul className="mt-1 max-w-xl space-y-1">
                {Object.entries(photos).map(([key, p]) => (
                  <li key={key}>
                    <a href={p.credit.page} className="link">
                      {p.subject}
                    </a>
                    , {p.credit.author}, {p.credit.license}
                  </li>
                ))}
              </ul>
            </details>
          </div>
          <ReviewNotesToggle />
        </div>
      </Container>
    </footer>
  );
}
