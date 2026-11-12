import type { Metadata } from "next";
import { HeroIntro } from "@/components/motion/reveal";
import { ReviewNote } from "@/components/review-notes";
import { Container, ExternalLink, PendingPanel, Photo, Section } from "@/components/ui";
import { cultureValues } from "@/lib/company";
import { externalDestinations } from "@/config/site";
import { safeHttpUrl } from "@/lib/links";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  const url = safeHttpUrl(externalDestinations.recruitmentUrl);
  return (
    <>
    <Container className="pt-6 pb-10 md:pt-10 md:pb-14">
      <ReviewNote
        purpose="Point candidates to the existing recruitment destination."
        needed={["Recruitment URL in config/site.ts and approved company-level wording."]}
        awaiting={[
          "adinn.com currently lists seven Madurai roles (business development, relationship management, operations, administration, Flutter and Next.js development). They are not reproduced here because they change. No application system is built.",
        ]}
      />
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <HeroIntro>
          <h1 className="text-h1">Work with the people behind the campaigns.</h1>
          <p className="prose-width mt-5 text-ash">
            Adinn’s teams plan, make and deliver campaigns for brands across
            South India. People work in business development, client
            relationships, operations and digital, from offices in Madurai,
            Chennai, Bangalore and Coimbatore. Open roles and applications are
            handled on our recruitment site, not on this website.
          </p>
          <div className="mt-8">
            {url ? (
              <ExternalLink href={url} button>
                View recruitment site
              </ExternalLink>
            ) : (
              <PendingPanel title="Recruitment link awaiting confirmation.">
                The link to our recruitment site will be added here once it is
                confirmed.
              </PendingPanel>
            )}
          </div>
        </HeroIntro>
        <Photo
          image="digital"
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 600px, 100vw"
          eager
        />
      </div>
    </Container>
      <Section
        tone="ash"
        title="What working at Adinn is meant to feel like"
        note={{
          purpose: "Describe the culture the company states for its people.",
          awaiting: [
            "Values are as stated on the adinn.com Careers page, lightly reworded. Workplace initiatives (food, farm produce, milk, yoga) are NOT published: nothing was found on adinn.com and the owner's wording is ambiguous. Clarify what is provided, to whom and how often before adding a People section.",
          ],
        }}
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cultureValues.map((v) => (
            <li key={v.title} className="rounded-xl bg-white p-5">
              <h3 className="text-h3">{v.title}</h3>
              <p className="mt-2 text-ash">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
