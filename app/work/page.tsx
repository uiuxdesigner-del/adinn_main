import type { Metadata } from "next";
import Image from "next/image";
import { CaseFilm } from "@/components/home/case-film";
import { CtaLink } from "@/components/cta-link";
import { Container, CtaBanner, PageHeader } from "@/components/ui";
import { cases } from "@/lib/cases";
import { ENQUIRY_HREF } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Campaign films from Adinn clients including SPR India, Dalmia Cement, Hatsun and Havells.",
};

export default function WorkPage() {
  return (
    <>
      <PageHeader title="Work Adinn has delivered">
        <p>
          Films of client campaigns, published by Adinn. Full case studies, with each challenge,
          the services used, coverage and results, appear here once the client and Adinn have
          approved the details. No figures are shown until they can be verified.
        </p>
      </PageHeader>
      <Container className="pb-10 md:pb-14">
        <ul className="grid gap-6 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.id} className="flex flex-col rounded-2xl border border-line p-6">
              <div className="flex h-16 items-center">
                {c.logo && (
                  <Image
                    src={`/clients/${c.logo.file}.webp`}
                    alt=""
                    width={c.logo.w}
                    height={c.logo.h}
                    sizes="160px"
                    className="h-full max-h-16 w-auto max-w-[10rem] object-contain"
                  />
                )}
              </div>
              <h2 className="text-h2 mt-2">{c.client}</h2>
              {c.note && <p className="mt-1 text-ash">{c.note}</p>}
              <div className="mt-4">
                <CaseFilm src={c.video} client={c.client} />
              </div>
              <p className="mt-4">
                <CtaLink href={ENQUIRY_HREF} label={`work_${c.id}`} className="link inline-block py-1">
                  Discuss a similar project<span aria-hidden="true"> →</span>
                </CtaLink>
              </p>
            </li>
          ))}
        </ul>
      </Container>
      <CtaBanner
        title="Have a business goal to discuss?"
        text="Tell us what you want to achieve and we’ll help you find the right combination of services."
        primary={{ href: ENQUIRY_HREF, label: "Discuss Your Project" }}
      />
    </>
  );
}
