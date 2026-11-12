import type { Metadata } from "next";
import { HeroIntro } from "@/components/motion/reveal";
import { ReviewNote } from "@/components/review-notes";
import {
  ButtonLink,
  Container,
  CtaBanner,
  PendingPanel,
  Photo,
  Section,
} from "@/components/ui";
import { contact } from "@/config/site";
import { coreValues, networkFigures } from "@/lib/company";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <Container className="pt-6 pb-10 md:pt-10 md:pb-14">
        <ReviewNote
          purpose="Say who Adinn is in plain terms."
          needed={["A final lead photograph."]}
          awaiting={[
            "Introduction is draft. “More than 24 years” and the list of services come from adinn.com.",
          ]}
        />
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <HeroIntro>
            <h1 className="text-h1">
              An advertising company working across South India.
            </h1>
            <p className="prose-width mt-5 text-ash">
              Adinn plans, makes and delivers advertising: outdoor media,
              roadshows, events, store branding, printing, wall painting and
              digital marketing. It has been in the business for more than 24
              years and works from offices in four cities.
            </p>
            <p className="prose-width mt-4 text-ash">
              Clients come to Adinn when a campaign has to appear in many
              places at once and look like one idea.
            </p>
          </HeroIntro>
          <Photo
            image="outdoor"
            aspect="aspect-[4/3]"
            sizes="(min-width: 1024px) 600px, 100vw"
            eager
          />
        </div>
      </Container>

      <Section
        tone="ash"
        title="How the teams work together"
        note={{
          purpose: "Explain why several capabilities in one company help a client.",
          awaiting: [
            "The example is illustrative and shows what the services make possible. Confirm how teams actually coordinate.",
          ],
        }}
      >
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <Photo
            image="wall"
            aspect="aspect-[16/10]"
            sizes="(min-width: 1024px) 560px, 100vw"
          />
          <div className="space-y-4">
            <p>
              Think of a product launch in a city. Hoardings make people notice
              it. Roadshow vans and LED vehicles take it to neighbourhoods.
              Stores need matching signage and fixtures. Posters and leaflets
              back it up, and digital carries the message online.
            </p>
            <p className="text-ash">
              Each of these is a separate skill, and Adinn has all of them.
              That means one brief can be shared with every team, instead of
              being explained again to each supplier. Not every project needs
              everything, and clients can use one team or several.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="What the company has in place"
        note={{
          purpose: "Give evidence behind the claims, with figures kept clearly attributed.",
          needed: ["Confirmation that the figures are current and may be published."],
          awaiting: [
            "All figures and capability statements are as published on adinn.com (undated). “Largest fleet” is not used because no count is given.",
          ],
        }}
      >
        <dl className="grid gap-4 sm:grid-cols-3">
          {networkFigures.map((f) => (
            <div key={f.label} className="rounded-xl bg-line p-5">
              <dt className="text-h2">{f.value}</dt>
              <dd className="mt-1 text-ash">{f.label}</dd>
            </div>
          ))}
        </dl>
        <p className="text-note mt-3 text-ash">Figures as published by Adinn.</p>
        <ul className="mt-8 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {[
            [
              "Roadshows",
              "Vehicles are GPS-enabled and RTO-approved, so deployment can be followed.",
            ],
            [
              "Events and activations",
              "Creative, fabrication and trained on-ground teams are in-house.",
            ],
            [
              "Retail fixtures",
              "Fixtures and modular shop-in-shop units are made on advanced machinery, for a consistent look across locations.",
            ],
            [
              "Wall painting",
              "Work is geo-tagged and follows defined workflows, so quality stays consistent between sites.",
            ],
          ].map(([title, text]) => (
            <li key={title} className="border-t border-ink pt-4">
              <h3 className="text-h3">{title}</h3>
              <p className="mt-2 text-ash">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="ash"
        title="How we say we work"
        intro="Six values the company states for how it works with clients, partners and each other."
        note={{
          purpose: "Show the character of the company through its stated values.",
          needed: ["Vision and mission, if the company has them. None are published."],
          awaiting: ["Values are as stated on adinn.com, lightly reworded."],
        }}
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((v) => (
            <li key={v.title} className="rounded-xl bg-white p-5">
              <h3 className="text-h3">{v.title}</h3>
              <p className="mt-2 text-ash">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Where to find us"
        note={{
          purpose: "Show presence and give a route to the offices.",
          needed: ["Directions links; confirmation of which office handles which enquiries."],
          awaiting: ["Cities as listed on adinn.com."],
        }}
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="prose-width">
              Adinn has offices in {contact.offices.map((o) => o.name).join(", ")}.
              Campaigns run across South India, with a strong base in Tamil
              Nadu.
            </p>
            <div className="mt-6">
              <ButtonLink href="/contact" variant="secondary">
                Office addresses
              </ButtonLink>
            </div>
          </div>
          <PendingPanel title="History and leadership">
            Adinn has not published a founding year, milestones or leadership
            profiles yet. They will be added once confirmed.
          </PendingPanel>
        </div>
      </Section>

      <CtaBanner
        title="Find the right Adinn team for your next project."
        text="Browse the teams, or tell us about your brief and we’ll point you to the right one."
        primary={{ href: "/verticals", label: "Explore Our Verticals" }}
        secondary={{ href: "/contact", label: "Contact Us" }}
      />
    </>
  );
}
