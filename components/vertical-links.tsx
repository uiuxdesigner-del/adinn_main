import Link from "next/link";
import { StaggerList } from "@/components/motion/reveal";
import { ExternalLink, Photo } from "@/components/ui";
import { verticals, type Vertical } from "@/lib/verticals";

/** Link to the vertical's dedicated page (and, once supplied, its own website). */
export function VerticalAction({ vertical }: { vertical: Vertical }) {
  return (
    <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
      <Link href={`/verticals/${vertical.id}`} className="link inline-block py-1">
        {vertical.action}
        <span aria-hidden="true"> →</span>
      </Link>
      {vertical.url && <ExternalLink href={vertical.url}>Visit website</ExternalLink>}
    </span>
  );
}

/** Image-led vertical cards with consistent crops. */
export function VerticalCards({
  headingLevel = 3,
  columns = "lg:grid-cols-4",
  sizes = "(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw",
  priorityFirst = false,
}: {
  headingLevel?: 2 | 3;
  columns?: string;
  sizes?: string;
  /** Preload the first card image when it is on the first screen. */
  priorityFirst?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <StaggerList className={`grid gap-5 sm:grid-cols-2 ${columns}`}>
      {verticals.map((v, i) => (
        <li key={v.id}>
          <div className="card flex h-full flex-col">
          <Photo
            image={v.image}
            aspect="aspect-[3/2]"
            sizes={sizes}
            eager={priorityFirst && i === 0}
            className="[&>div]:rounded-none"
          />
          <div className="flex flex-1 flex-col p-5">
            <Heading className="text-h3">{v.name}</Heading>
            <p className="mt-2 flex-1 text-ash">{v.description}</p>
            <div className="mt-4">
              <VerticalAction vertical={v} />
            </div>
          </div>
          </div>
        </li>
      ))}
    </StaggerList>
  );
}

/** Compact directory used on the Contact page. */
export function VerticalDirectory() {
  return (
    <ul>
      {verticals.map((v) => (
        <li
          key={v.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line py-3 first:border-t"
        >
          <span className="font-medium">{v.name}</span>
          <VerticalAction vertical={v} />
        </li>
      ))}
    </ul>
  );
}

/** Concise, secondary list of the verticals with links. No photographs. */
export function VerticalCompact() {
  return (
    <StaggerList className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      {verticals.map((v) => (
        <li key={v.id} className="border-t border-ink pt-4">
          <h3 className="font-medium">{v.name}</h3>
          <p className="mt-1 text-ash">{v.description}</p>
          <div className="mt-3">
            <VerticalAction vertical={v} />
          </div>
        </li>
      ))}
    </StaggerList>
  );
}
