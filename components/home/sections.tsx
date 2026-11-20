import Image from "next/image";
import { CaseFilm } from "@/components/home/case-film";
import { ServicesCarousel, type ServiceSlide } from "@/components/home/services-carousel";
import { ContactOptions } from "@/components/contact-options";
import { CtaLink } from "@/components/cta-link";
import { EnquiryForm } from "@/components/enquiry-form";
import { Container, Photo } from "@/components/ui";
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
            Your business goals. Our integrated marketing solutions.
          </h1>
          <p className="prose-width mt-5 text-ash">
            From outdoor visibility and roadshows to retail branding and digital campaigns, Adinn brings the
            right services together under one brief and one team.
          </p>
          <div className="mt-8">
            <CtaLink href={ENQUIRY_HREF} label="hero_discuss_project" className="btn btn-primary">
              Discuss Your Project
              <span aria-hidden="true" className="btn-arrow">→</span>
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
      <Heading id="field-heading" title="Experience the capabilities">
        Scroll through Adinn’s services at work: a roadshow vehicle, an outdoor hoarding and a retail
        store. You can skip the story at any time.
      </Heading>
    </Container>
  );
}

export function Services() {
  const slides: ServiceSlide[] = serviceDetails.map((d, k) => {
    const v = verticals.find((x) => x.id === d.id)!;
    return {
      id: d.id,
      no: String(k + 1).padStart(2, "0"),
      label: v.name,
      heading: d.achieves,
      body: d.delivers,
      connects: `${d.connects.map(name).join(", ")}. ${d.connectNote}`,
      cta: v.action.replace(/^Explore/, "Discuss"),
      image: `/story/${d.id === "roadshows" ? "roadshow" : d.id}-1200.webp`,
      alt: `${v.name}: an illustrative Adinn campaign scene`,
    };
  });
  return <ServicesCarousel slides={slides} />;
}

export function Cases() {
  return (
    <section id="work" aria-labelledby="cases-heading" className="bg-line py-12 md:py-16">
      <Container>
        <Heading id="cases-heading" title="Proof through actual work">
          Campaign films published by Adinn. Details and results are shown only where they have been
          verified, so some fields stay empty until each client approves them.
        </Heading>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {cases.map((c) => {
            const d = c.details;
            const rows: [string, string][] = [];
            if (d.challenge) rows.push(["Business challenge", d.challenge]);
            if (d.services?.length) rows.push(["Services used", d.services.join(", ")]);
            const execution = [d.strategy, d.coverage].filter(Boolean).join(" ") || c.note;
            if (execution) rows.push(["Execution", execution]);
            if (d.results) rows.push(["Verified results", d.results]);
            const pending = !d.challenge || !d.results;
            return (
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
                <p className="text-note text-ash">Campaign film</p>
                {rows.length > 0 && (
                  <dl className="mt-3 space-y-2 text-ash">
                    {rows.map(([k, v]) => (
                      <div key={k}>
                        <dt className="font-medium text-ink">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {pending && (
                  <p className="text-note mt-3 text-ash">
                    The challenge{d.results ? "" : ", services used and results"} will be published once the
                    client approves them.
                  </p>
                )}
                <div className="mt-4">
                  <CaseFilm src={c.video} client={c.client} />
                </div>
                <p className="mt-auto pt-4">
                  <CtaLink href={`/work#${c.id}`} label={`case_${c.id}`} className="link inline-block py-1">
                    View the {c.client} case study<span aria-hidden="true"> →</span>
                  </CtaLink>
                </p>
              </li>
            );
          })}
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
  const strengths = [
    {
      title: "Experience",
      fact: "More than 24 years in advertising, as stated by Adinn.",
      means: "You are briefing a team with long experience in the business, across outdoor, events, retail and digital.",
    },
    {
      title: "Production infrastructure",
      fact: "Signage, fixtures, printing and event fabrication are made by Adinn, which also lists its own fleet and sites.",
      means: "The people planning your campaign work alongside the people producing it, so a change to the brief reaches production directly.",
      figures: true,
    },
    {
      title: "Geographical reach",
      fact: `Offices in ${offices.slice(0, -1).join(", ")} and ${offices.at(-1)}, with a strong base in Tamil Nadu and hoardings around South India.`,
      means: "A campaign can be planned across several cities and towns through one team.",
    },
    {
      title: "Integrated capabilities",
      fact: "Outdoor, roadshows, events, signage, fixtures, printing, walls and digital are delivered by one company.",
      means: "One brief reaches every channel, so the message you see on the street is the one people find online.",
    },
    {
      title: "On-ground execution",
      fact: "Where the service allows, roadshows are GPS-enabled and wall work is geo-tagged. Events use trained on-ground teams and signage is installed by Adinn.",
      means: "Delivery can be followed and recorded location by location, not only handed over at the end.",
    },
  ];
  return (
    <section aria-labelledby="why-heading" className="py-12 md:py-16">
      <Container>
        <Heading id="why-heading" title="Why trust Adinn">
          Practical reasons to choose Adinn, and what each one means for your project.
        </Heading>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <ol className="space-y-7">
            {strengths.map((x, i) => (
              <li key={x.title} className="grid grid-cols-[2.25rem_1fr] gap-x-4">
                <span aria-hidden="true" className="text-h3 text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-h3">{x.title}</h3>
                  <p className="mt-1 text-ash">{x.fact}</p>
                  {x.figures && (
                    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                      {networkFigures.map((f) => (
                        <div key={f.label} className="rounded-xl border border-line p-4">
                          <dt className="text-h2">{f.value}</dt>
                          <dd className="mt-1 text-ash">{f.label}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="mt-2">
                    <span className="font-medium text-ink">What it means for you: </span>
                    <span className="text-ash">{x.means}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="space-y-5">
            <Photo image="production" aspect="aspect-[4/3]" sizes="(min-width: 1024px) 420px, 100vw" />
            <Photo image="printing" aspect="aspect-[4/3]" sizes="(min-width: 1024px) 420px, 100vw" />
            <p className="text-note text-ash">
              Illustrative photographs of sign painting and printing; they are not Adinn’s own sites or
              staff. Figures are as stated by Adinn and have not been independently audited.
            </p>
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
            Tell us what your business needs to achieve.
          </h2>
          <p className="prose-width mt-3 text-ash">
            We will help you find the right combination of services and the right team.
          </p>
          <h3 className="text-h3 mt-8">Prefer to talk?</h3>
          <ContactOptions className="mt-3" />
        </div>
        <div className="rounded-2xl bg-white p-6 md:p-8">
          <EnquiryForm source="home" submitLabel="Discuss Your Project" />
        </div>
      </Container>
    </section>
  );
}
