import { Reveal } from "@/components/motion/reveal";
import { ExternalLink, Photo } from "@/components/ui";
import type { ImageKey } from "@/lib/images";

export type ProjectView = {
  id: string;
  name: string;
  verticalName: string;
  image: ImageKey;
  location: string | null;
  description: string;
  illustrative: boolean;
  url: string | null;
};

function Details({
  project,
  Heading,
}: {
  project: ProjectView;
  Heading: "h2" | "h3";
}) {
  return (
    <>
      <Heading className="text-h3">{project.name}</Heading>
      <p className="text-note mt-1 text-ash">
        {project.verticalName}
        {project.location ? ` · ${project.location}` : ""}
      </p>
      <p className="mt-3 text-ash">{project.description}</p>
      {project.illustrative && (
        <p className="text-note mt-3 font-medium text-ash">Illustrative example</p>
      )}
      {project.url && (
        <div className="mt-4">
          <ExternalLink href={project.url}>
            View Project<span className="sr-only">: {project.name}</span>
          </ExternalLink>
        </div>
      )}
    </>
  );
}

/** Grid card used on the Work page. */
export function ProjectCard({
  project,
  headingLevel = 2,
}: {
  project: ProjectView;
  headingLevel?: 2 | 3;
}) {
  return (
    <article className="card h-full">
      <Photo
        image={project.image}
        aspect="aspect-[3/2]"
        sizes="(min-width: 1024px) 580px, (min-width: 640px) 45vw, 100vw"
        className="[&>div]:rounded-none"
      />
      <div className="p-6">
        <Details
          project={project}
          Heading={headingLevel === 2 ? "h2" : "h3"}
        />
      </div>
    </article>
  );
}

/** Editorial row used on the Home page; image alternates sides on desktop. */
export function ProjectRow({
  project,
  reverse = false,
}: {
  project: ProjectView;
  reverse?: boolean;
}) {
  return (
    <Reveal items="[data-reveal-item]" images>
    <article className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
      <Photo
        image={project.image}
        aspect="aspect-[16/10]"
        sizes="(min-width: 1024px) 700px, 100vw"
        item
        className={`lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}
      />
      <div
        data-reveal-item
        className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}
      >
        <Details project={project} Heading="h3" />
      </div>
    </article>
    </Reveal>
  );
}
