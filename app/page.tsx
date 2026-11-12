import Link from "next/link";
import { HeroIntro } from "@/components/motion/reveal";
import { ProjectRow } from "@/components/project-card";
import { ReviewNote } from "@/components/review-notes";
import {
  ButtonLink,
  Container,
  CtaBanner,
  Photo,
  Section,
} from "@/components/ui";
import { VerticalCompact } from "@/components/vertical-links";
import { contact } from "@/config/site";
import { brandNames, networkFigures, situations, stages } from "@/lib/company";
import { ENQUIRY_HREF } from "@/lib/navigation";
import { projects } from "@/lib/projects";
import { verticals } from "@/lib/verticals";

export default function HomePage() {
  const selected = projects.slice(0, 3).map((p) => ({
    ...p,
    verticalName: verticals.find((v) => v.id === p.verticalId)?.name ?? "",
  }));

  return (
    <>
      <Container className="pt-6 pb-10 md:pt-10 md:pb-14">
        <ReviewNote
          purpose="Say what Adinn is and where it works, then send visitors to an enquiry or the teams."
          needed={["A final hero photograph, ideally commissioned."]}
          awaiting={[
            "All photographs are illustrative stock, not Adinn projects or staff (see IMAGE-SOURCES.md). Headline is draft positioning. “Across South India” follows the company’s own description of its work.",
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <HeroIntro>
            <h1 className="text-display">
              Campaigns that reach people across South India, from one company.
            </h1>
            <p className="prose-width mt-5 text-ash">
              Adinn plans, makes and delivers advertising on the street, in
              stores and online, with offices in Madurai, Chennai, Bangalore and
              Coimbatore.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={ENQUIRY_HREF}>Discuss Your Requirement</ButtonLink>
              <ButtonLink href="/about" variant="secondary">
                About Us
              </ButtonLink>
            </div>
          </HeroIntro>
          <Photo
            image="hero"
            aspect="aspect-[4/3] lg:aspect-[5/4]"
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
          />
        </div>
      </Container>

      <Section
        title="One team for the places your customers meet your brand"
        note={{
          purpose: "Explain what Adinn is and why the capabilities sit together.",
          needed: ["Founding year and company history, if the company wants them shown."],
          awaiting: [
            "“More than 24 years” is the company’s own statement on adinn.com; no founding year is published.",
          ],
        }}
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <Photo
            image="printing"
            aspect="aspect-[16/10]"
            sizes="(min-width: 1024px) 560px, 100vw"
          />
          <div className="space-y-4">
            <p>
              Adinn is an advertising company with more than 24 years in the
              business. It handles outdoor media, roadshows, events, store
              branding, printing, wall painting and digital marketing.
            </p>
            <p className="text-ash">
              Most brands need more than one of these at a time. Working with
              one company means one brief, one conversation and teams that
              already know each other.
            </p>
            <div className="pt-2">
              <ButtonLink href="/about" variant="secondary">
                More about Adinn
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="ash"
        title="What are you planning?"
        intro="Pick the situation closest to yours. Each one starts with a conversation about your brief."
        note={{
          purpose: "Make the offer concrete by starting from the client’s situation.",
          needed: ["Real examples to replace or support these situations."],
          awaiting: [
            "Situations are draft groupings. Each statement follows the service descriptions on adinn.com; not every project uses every capability.",
          ],
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Photo
            image="production"
            aspect="aspect-[4/3]"
            sizes="(min-width: 1024px) 460px, 100vw"
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <ul>
            {situations.map((s) => (
              <li
                key={s.title}
                className="border-t border-ink py-5 first:border-t-0 first:pt-0"
              >
                <h3 className="text-h3">{s.title}</h3>
                <p className="mt-2 text-ash">{s.text}</p>
                <p className="text-note mt-2 font-medium">{s.teams}</p>
                <Link href={ENQUIRY_HREF} className="link mt-3 inline-block py-1">
                  Discuss this
                  <span className="sr-only">: {s.title}</span>
                  <span aria-hidden="true"> →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        title="From brief to street"
        intro="Not every project needs every stage or every team. This is how the work generally moves."
        note={{
          purpose: "Show what happens between receiving a brief and delivering the work.",
          needed: ["The company’s own process description and answers to its FAQ."],
          awaiting: [
            "Stages are drawn from the service descriptions on adinn.com. The site’s FAQ answers were not published in the page text.",
          ],
        }}
      >
        <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((s) => (
            <li key={s.title} className="border-t border-ink pt-4">
              <h3 className="text-h3">{s.title}</h3>
              <p className="mt-2 text-ash">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink href={ENQUIRY_HREF}>Start with your brief</ButtonLink>
        </div>
      </Section>

      <Section
        tone="ash"
        title="A network built for reach"
        note={{
          purpose: "Give evidence of scale and show where Adinn is based.",
          needed: ["Confirmation that the figures are current."],
          awaiting: [
            "Figures are company-stated on adinn.com (undated). Check “largest fleet” before using it; no count is given.",
          ],
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <p className="prose-width">
              Many campaigns depend on media and vehicles. This is how Adinn
              describes its network. It works from four cities.
            </p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              {networkFigures.map((f) => (
                <div key={f.label} className="rounded-xl bg-white p-5">
                  <dt className="text-h2">{f.value}</dt>
                  <dd className="mt-1 text-ash">{f.label}</dd>
                </div>
              ))}
            </dl>
            <p className="text-note mt-3 text-ash">
              Figures as published by Adinn.
            </p>
          </div>
          <div>
            <h3 className="text-h3">Offices</h3>
            <ul className="mt-3">
              {contact.offices.map((o) => (
                <li key={o.name} className="border-t border-ink py-2 font-medium">
                  {o.name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-ash">
              Campaigns run across South India, with a strong base in Tamil
              Nadu.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Work in different settings"
        intro="Concepts that show how Adinn work will be presented here."
        reveal="intro"
        note={{
          purpose: "Show breadth of work across verticals.",
          needed: [
            "Approved projects with descriptions, photographs, locations and permission. adinn.com features SPR India, Dalmia Cement, Hatsun and Havells as videos without text.",
          ],
          awaiting: [
            "These are illustrative concepts with stock photographs, not real Adinn projects.",
          ],
        }}
      >
        <div className="space-y-12 md:space-y-16">
          {selected.map((p, i) => (
            <ProjectRow key={p.id} project={p} reverse={i % 2 === 1} />
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/work" variant="secondary">
            View Our Work
          </ButtonLink>
        </div>
      </Section>

      <Section
        compact
        tone="ash"
        title="Brands featured on Adinn’s website"
        note={{
          purpose: "Show who Adinn has worked with, as evidence.",
          needed: ["Written permission and current status for each name; approved logos."],
          awaiting: [
            "Names are those shown as logos on adinn.com. Abbreviated logos were left out. Do not publish until approved.",
          ],
        }}
      >
        <ul className="flex flex-wrap gap-3">
          {brandNames.map((b) => (
            <li
              key={b}
              className="rounded-full border border-ash bg-white px-5 py-2 font-medium"
            >
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Visit the individual teams"
        intro="Each team has its own website with more detail."
        reveal="intro"
        note={{
          purpose: "Route visitors to the existing vertical websites. Kept short on purpose.",
          needed: ["Website URL for each vertical in config/site.ts."],
        }}
      >
        <VerticalCompact />
      </Section>

      <CtaBanner
        title="Have a brief? Let’s talk it through."
        text="Tell us what you have in mind. We’ll help you find the relevant Adinn team."
        primary={{ href: ENQUIRY_HREF, label: "Discuss Your Requirement" }}
      />
    </>
  );
}
