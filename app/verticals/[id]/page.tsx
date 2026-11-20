import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseFilm } from "@/components/home/case-film";
import { CtaLink } from "@/components/cta-link";
import { Container, CtaBanner } from "@/components/ui";
import { cases } from "@/lib/cases";
import { enquiryHref } from "@/lib/navigation";
import { serviceDetails } from "@/lib/services";
import { verticalPages } from "@/lib/vertical-pages";
import { verticals } from "@/lib/verticals";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return verticals.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const v = verticals.find((x) => x.id === id);
  if (!v) return {};
  const d = serviceDetails.find((x) => x.id === id);
  return {
    title: v.name,
    description: d ? `${d.achieves} ${d.delivers}` : v.description,
    alternates: { canonical: `/verticals/${id}` },
  };
}

const nameOf = (id: string) => verticals.find((v) => v.id === id)?.name ?? id;

export default async function VerticalPage({ params }: Props) {
  const { id } = await params;
  const v = verticals.find((x) => x.id === id);
  const d = serviceDetails.find((x) => x.id === id);
  const page = verticalPages[id as keyof typeof verticalPages];
  if (!v || !d || !page) notFound();
  const work = cases.filter((c) => page.caseIds.includes(c.id));
  const image = `/story/${id === "roadshows" ? "roadshow" : id}-1200.webp`;
  const enquiry = enquiryHref(`service:${id}`);

  return (
    <>
      {/* 1. What we do */}
      <Container className="grid items-center gap-10 pt-8 pb-12 md:pt-12 md:pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <p className="text-note text-ash">
            <Link href="/#services" className="link">
              Adinn services
            </Link>
            <span aria-hidden="true"> / </span>
            {v.name}
          </p>
          <span aria-hidden="true" className="mt-4 mb-5 block h-1 w-12 bg-brand" />
          <h1 className="text-display">{v.name}</h1>
          <p className="text-h3 mt-4 max-w-2xl">{d.achieves}</p>
          <p className="prose-width mt-4 text-ash">{page.what}</p>
          <div className="mt-7">
            <CtaLink href={enquiry} label={`vertical_${id}_hero`} className="btn btn-primary">
              Discuss {v.name}
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </CtaLink>
          </div>
        </div>
        {/* 4. Visual storytelling: an illustrative scene, labelled as such */}
        <figure>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-line">
            <Image
              src={image}
              alt={`${v.name}: an illustrative Adinn campaign scene`}
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="text-note mt-2 text-ash">Illustrative campaign scene, not completed client work.</figcaption>
        </figure>
      </Container>

      {/* 2. What the client receives */}
      <section aria-labelledby="receive-heading" className="bg-line py-12 md:py-16">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand" />
            <h2 id="receive-heading" className="text-h1">
              What you receive
            </h2>
            <p className="prose-width mt-3 text-ash">{d.delivers}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-h3">Scope</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ash">
                {page.scope.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6">
              <h3 className="text-h3">Execution support</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-ash">
                {page.support.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Why trust Adinn for this service */}
      <section aria-labelledby="trust-heading" className="py-12 md:py-16">
        <Container>
          <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand" />
          <h2 id="trust-heading" className="text-h1 max-w-3xl">
            Why trust Adinn for {v.name}
          </h2>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.evidence.map((e) => (
              <div key={e.text} className="rounded-2xl border border-line p-6">
                {e.value && <dt className="text-h2">{e.value}</dt>}
                <dd className={e.value ? "mt-1 text-ash" : "text-ash"}>{e.text}</dd>
              </div>
            ))}
          </dl>
          <p className="text-note mt-3 text-ash">Figures are as stated by Adinn and have not been independently audited.</p>
          <h3 className="text-h3 mt-10">Works with</h3>
          <ul className="mt-3 flex flex-wrap gap-3">
            {d.connects.map((c) => (
              <li key={c}>
                <Link href={`/verticals/${c}`} className="btn btn-secondary">
                  {nameOf(c)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="prose-width mt-3 text-ash">{d.connectNote}</p>
        </Container>
      </section>

      {/* 5. Real related work */}
      <section aria-labelledby="work-heading" className="bg-line py-12 md:py-16">
        <Container>
          <span aria-hidden="true" className="mb-4 block h-1 w-10 bg-brand" />
          <h2 id="work-heading" className="text-h1 max-w-3xl">
            Related work
          </h2>
          {work.length > 0 ? (
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {work.map((c) => (
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
          ) : (
            <p className="prose-width mt-3 text-ash">
              No verified case study for this service has been approved for publication yet. See the campaign films Adinn has published.
            </p>
          )}
          <p className="mt-6">
            <CtaLink href="/work" label={`vertical_${id}_work`} className="link">
              See all work<span aria-hidden="true"> →</span>
            </CtaLink>
          </p>
        </Container>
      </section>

      {/* 6. Focused enquiry */}
      <CtaBanner
        title={`Planning ${v.name}?`}
        text="Tell us what you want to achieve and we’ll bring the right team together."
        primary={{ href: enquiry, label: `Discuss ${v.name}` }}
      />
    </>
  );
}
