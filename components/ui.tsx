import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroIntro, Reveal } from "@/components/motion/reveal";
import { ReviewNote, type ReviewNoteProps } from "@/components/review-notes";
import { photos, type ImageKey } from "@/lib/images";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1360px] px-4 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

/** Simple page opening for text-led pages (one H1 plus short intro). */
export function PageHeader({
  title,
  children,
  note,
}: {
  title: string;
  children?: ReactNode;
  note?: ReviewNoteProps;
}) {
  return (
    <Container className="pt-8 pb-6 md:pt-12 md:pb-8">
      {note && <ReviewNote {...note} />}
      <HeroIntro>
        <h1 className="text-h1 max-w-3xl">{title}</h1>
        {children && <div className="prose-width mt-4 text-ash">{children}</div>}
      </HeroIntro>
    </Container>
  );
}

/** Standard section: consistent spacing, optional light-ash band, review note. */
export function Section({
  id,
  title,
  intro,
  children,
  note,
  tone = "white",
  compact = false,
  reveal = "all",
}: {
  id?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  note?: ReviewNoteProps;
  tone?: "white" | "ash";
  compact?: boolean;
  /**
   * "all": heading and content animate as one group.
   * "intro": only heading and intro animate (children animate themselves).
   * "none": no animation.
   */
  reveal?: "all" | "intro" | "none";
}) {
  const headingId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;
  const head = (
    <>
      <h2 id={headingId} className="text-h2 max-w-3xl">
        {title}
      </h2>
      {intro && <div className="prose-width mt-3 text-ash">{intro}</div>}
    </>
  );
  const content = <div className="mt-6">{children}</div>;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={tone === "ash" ? "bg-line" : ""}
    >
      <Container
        className={compact ? "py-6 md:py-10" : "py-10 md:py-14"}
      >
        {note && <ReviewNote {...note} />}
        {reveal === "all" && (
          <Reveal images>
            {head}
            {content}
          </Reveal>
        )}
        {reveal === "intro" && (
          <>
            <Reveal>{head}</Reveal>
            {content}
          </>
        )}
        {reveal === "none" && (
          <>
            {head}
            {content}
          </>
        )}
      </Container>
    </section>
  );
}

/** Cropped photograph with accessible alt text. Credits live in the footer and IMAGE-SOURCES.md. */
export function Photo({
  image,
  aspect = "aspect-[4/3]",
  sizes,
  priority = false,
  eager = false,
  item = false,
  className = "",
}: {
  image: ImageKey;
  aspect?: string;
  sizes: string;
  priority?: boolean;
  /** Load immediately without a preload hint (first-screen images on inner pages). */
  eager?: boolean;
  /** Mark as an item of the enclosing Reveal group. */
  item?: boolean;
  className?: string;
}) {
  const p = photos[image];
  return (
    <figure className={className} data-reveal-item={item ? "" : undefined}>
      <div
        data-photo=""
        className={`relative ${aspect} w-full overflow-hidden rounded-xl bg-line`}
      >
        <Image
          src={p.src}
          alt={p.alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={eager && !priority ? "eager" : undefined}
          className="object-cover"
          style={{ objectPosition: p.position }}
        />
      </div>
    </figure>
  );
}

type ButtonVariant = "primary" | "secondary" | "inverse" | "outline-inverse";
const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  inverse: "btn-inverse",
  "outline-inverse": "btn-outline-inverse",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
}) {
  return (
    <Link href={href} className={`btn ${variantClass[variant]}`}>
      {children}
      <span aria-hidden="true" className="btn-arrow">
        →
      </span>
    </Link>
  );
}

/** Link to an existing ADINN website; normal same-tab navigation. */
export function ExternalLink({
  href,
  children,
  button = false,
}: {
  href: string;
  children: ReactNode;
  button?: boolean;
}) {
  return (
    <a href={href} className={button ? "btn btn-secondary" : "link font-medium"}>
      {children}
      <span aria-hidden="true">&nbsp;↗</span>
      <span className="sr-only"> (external website)</span>
    </a>
  );
}

/** Quiet inline status shown instead of a link when a value is missing. */
export function PendingStatus({ children }: { children: ReactNode }) {
  return (
    <p className="text-note inline-flex items-center gap-2 text-ash">
      <span
        aria-hidden="true"
        className="inline-block size-2 shrink-0 rounded-full border border-ash"
      />
      {children}
    </p>
  );
}

/** One concise panel for a group of facts that are still to be supplied. */
export function PendingPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-line p-6">
      <p className="text-h3">{title}</p>
      <p className="mt-1 text-ash">{children}</p>
    </div>
  );
}

/** Shared dark call-to-action panel. */
export function CtaBanner({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section aria-labelledby="cta-heading" className="pb-10 md:pb-14">
      <Container>
        <Reveal items="[data-reveal-item]">
        <div className="on-dark rounded-2xl bg-ink px-6 py-8 text-white md:px-12 md:py-12">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-12">
            <div>
              <h2 id="cta-heading" data-reveal-item className="text-h2 max-w-xl">
                {title}
              </h2>
              {text && (
                <p data-reveal-item className="mt-3 max-w-xl text-line">
                  {text}
                </p>
              )}
            </div>
            <div data-reveal-item className="flex flex-wrap gap-3">
              <ButtonLink href={primary.href} variant="inverse">
                {primary.label}
              </ButtonLink>
              {secondary && (
                <ButtonLink href={secondary.href} variant="outline-inverse">
                  {secondary.label}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}
