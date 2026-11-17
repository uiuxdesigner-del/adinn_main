import Image from "next/image";
import { CaseFilm } from "@/components/home/case-film";
import { ContactOptions } from "@/components/contact-options";
import { CtaLink } from "@/components/cta-link";
import { EnquiryForm } from "@/components/enquiry-form";
import { Container } from "@/components/ui";
import { contact } from "@/config/site";
import { cases } from "@/lib/cases";
import { clients } from "@/lib/clients";
import { networkFigures } from "@/lib/company";
import { ENQUIRY_HREF, enquiryHref } from "@/lib/navigation";
import { serviceDetails } from "@/lib/services";
import { solutions } from "@/lib/solutions";
import { verticals } from "@/lib/verticals";

const name = (id: string) => verticals.find((v) => v.id === id)?.name ?? id;

function Heading({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand" />
      <h2 id={id} className="text-h1">
        {title}
      </h2>
      {children && <p className="mt-3 text-ash">{children}</p>}
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-heading">
      <Container className="grid items-center gap-10 pt-8 pb-12 md:pt-14 md:pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <span aria-hidden="true" className="mb-5 block h-1 w-12 bg-brand" />
          <h1 id="hero-heading" className="text-display">
            Your Business Goals. Our Complete Marketing Solutions.
          </h1>
          <p className="prose-width mt-5 text-ash">
            From brand launches to market expansion, Adinn brings strategy, creativity, media and
            on-ground execution together to help your business grow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={ENQUIRY_HREF} label="hero_discuss_goal" className="btn btn-primary">
              Discuss Your Business Goal
              <span aria-hidden="true" className="btn-arrow">→</span>
            </CtaLink>
            <CtaLink href="/work" label="hero_explore_work" className="btn btn-secondary">
              Explore Our Work
            </CtaLink>
          </div>
        </div>
        <figure>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-line">
            <Image
              src="/story/roadshow-1200.webp"
              alt="An Adinn LED roadshow vehicle on a city street"
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </figure>
      </Container>
    </section>
  );
}

export function ClientTrust() {
  const shown = clients.filter((c) => c.confirmed);
  if (shown.length === 0) return null;
  return (
    <section aria-labelledby="clients-heading" className="border-y border-line">
      <Container className="py-8 md:py-10">
        <h2 id="clients-heading" className="text-h3 text-center">
          Brands that have worked with Adinn
        </h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {shown.map((c) => (
            <li key={c.name} className="flex h-14 items-center">
              <Image
                src={`/clients/${c.file}.webp`}
                alt={c.name}
                width={c.w}
                height={c.h}
                sizes="140px"
                className="h-full max-h-14 w-auto max-w-[9rem] object-contain"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function Solutions() {
  return (
    <section id="solutions" aria-labelledby="solutions-heading" className="bg-line py-12 md:py-16">
      <Container>
        <Heading id="solutions-heading" title="Solutions built around your business needs">
          Start from what you want to achieve. Each solution combines the services that work together
          for that goal.
        </Heading>
        <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <li key={s.id} className="flex flex-col rounded-2xl bg-white p-6">
              <h3 className="text-h2">{s.title}</h3>
              <dl className="mt-4 space-y-3 text-ash">
                <div>
                  <dt className="font-medium text-ink">The challenge</dt>
                  <dd>{s.challenge}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Our approach</dt>
                  <dd>{s.approach}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Services combined</dt>
                  <dd>{s.services.map(name).join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-medium text-ink">Intended outcome</dt>
                  <dd>{s.outcome}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-5">
                <CtaLink
                  href={enquiryHref(`solution:${s.id}`)}
                  label={`solution_${s.id}`}
                  className="link inline-block py-1"
                >
                  {s.cta}
                  <span aria-hidden="true"> →</span>
                  <span className="sr-only">: {s.title}</span>
                </CtaLink>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function StoryIntro() {
  return (
    <Container className="pt-12 pb-6 md:pt-16">
      <Heading id="field-heading" title="See the capabilities in the field">
        Scroll through two of Adinn’s services at work: a roadshow vehicle and an outdoor hoarding.
      </Heading>
    </Container>
  );
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-heading" className="py-12 md:py-16">
      <Container>
        <Heading id="services-heading" title="Eight connected services">
          Each service stands alone and is planned to work with the others, under one brief and one team.
        </Heading>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {serviceDetails.map((d) => {
            const v = verticals.find((x) => x.id === d.id)!;
            return (
              <li key={d.id} className="rounded-2xl border border-line p-6">
                <h3 className="text-h2">{v.name}</h3>
                <p className="mt-2 font-medium">{d.achieves}</p>
                <dl className="mt-3 space-y-2 text-ash">
                  <div>
                    <dt className="sr-only">What Adinn delivers</dt>
                    <dd>{d.delivers}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink">Connects with</dt>
                    <dd>
                      {d.connects.map(name).join(", ")}. {d.connectNote}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4">
                  <CtaLink href={enquiryHref(`service:${d.id}`)} label={`service_${d.id}`} className="link inline-block py-1">
                    {v.action.replace(/^Explore/, "Discuss")}
                    <span aria-hidden="true"> →</span>
                  </CtaLink>
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export function Cases() {
  return (
    <section id="work" aria-labelledby="cases-heading" className="bg-line py-12 md:py-16">
      <Container>
        <Heading id="cases-heading" title="Campaigns Adinn has delivered">
          Films of client work from Adinn. Full case studies, with the challenge, coverage and results,
          are added as each client approves them.
        </Heading>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {cases.map((c) => (
            <li key={c.id} className="flex flex-col rounded-2xl bg-white p-6">
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
              <h3 className="text-h2 mt-2">{c.client}</h3>
              {c.note && <p className="mt-1 text-ash">{c.note}</p>}
              <div className="mt-4">
                <CaseFilm src={c.video} client={c.client} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <CtaLink href="/work" label="cases_view_all" className="link">
            See all work<span aria-hidden="true"> →</span>
          </CtaLink>
        </p>
      </Container>
    </section>
  );
}

export function WhyAdinn() {
  const offices = contact.offices.map((o) => o.name);
  return (
    <section aria-labelledby="why-heading" className="py-12 md:py-16">
      <Container>
        <Heading id="why-heading" title="Why Adinn">
          Facts as published by Adinn.
        </Heading>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h3 className="text-h3">More than 24 years in advertising</h3>
              <p className="mt-1 text-ash">
                Adinn describes itself as having more than 24 years in the business.
              </p>
            </div>
            <div>
              <h3 className="text-h3">Owned infrastructure</h3>
              <p className="mt-1 text-ash">
                Signage, fixtures, printing and event fabrication are made by Adinn, and the company
                lists its own fleet and sites:
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                {networkFigures.map((f) => (
                  <div key={f.label} className="rounded-xl border border-line p-4">
                    <dt className="text-h2">{f.value}</dt>
                    <dd className="mt-1 text-ash">{f.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-note mt-2 text-ash">Figures as stated by Adinn; not independently audited.</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-h3">Reach across South India</h3>
              <p className="mt-1 text-ash">
                Offices in {offices.slice(0, -1).join(", ")} and {offices.at(-1)}, with a strong base in
                Tamil Nadu.
              </p>
            </div>
            <div>
              <h3 className="text-h3">Integrated capabilities</h3>
              <p className="mt-1 text-ash">
                Outdoor, roadshows, events, signage, fixtures, printing, walls and digital are delivered
                by one company, so one brief reaches every channel.
              </p>
            </div>
            <div>
              <h3 className="text-h3">Planning and execution together</h3>
              <p className="mt-1 text-ash">
                Creative, fabrication and on-ground teams work together, and where the service allows,
                roadshows are GPS-enabled and wall work is geo-tagged so delivery is recorded.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function FinalConversion() {
  return (
    <section id="enquiry" aria-labelledby="final-heading" className="bg-line py-12 md:py-16">
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand" />
          <h2 id="final-heading" className="text-h1">
            Let’s Build the Right Marketing Solution for Your Business.
          </h2>
          <p className="prose-width mt-3 text-ash">
            Tell us what you want to achieve. We will help you find the right combination of services
            and the right team.
          </p>
          <h3 className="text-h3 mt-8">Prefer to talk?</h3>
          <ContactOptions className="mt-3" />
        </div>
        <div className="rounded-2xl bg-white p-6 md:p-8">
          <EnquiryForm source="home" />
        </div>
      </Container>
    </section>
  );
}
