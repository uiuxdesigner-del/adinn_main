import type { Metadata } from "next";
import { WorkExplorer } from "@/components/work-explorer";
import { Container, CtaBanner, PageHeader } from "@/components/ui";
import { ENQUIRY_HREF } from "@/lib/navigation";
import { projects } from "@/lib/projects";
import { verticals } from "@/lib/verticals";

export const metadata: Metadata = { title: "Our Work" };

export default function WorkPage() {
  const items = projects.map((p) => ({
    ...p,
    verticalName: verticals.find((v) => v.id === p.verticalId)?.name ?? "",
  }));
  const options = verticals.map((v) => ({ id: v.id, name: v.name }));

  return (
    <>
      <PageHeader
        title="Different briefs. A shared focus on execution."
        note={{
          purpose: "Show work across verticals and test the filter.",
          needed: ["Approved projects, images, locations and project URLs. adinn.com features SPR India, Dalmia Cement, Hatsun and Havells as videos without text; these are candidates once descriptions and permission exist."],
          awaiting: [
            "All four records are illustrative concepts with stock photographs. Four verticals have none, so the empty state can be tested.",
          ],
        }}
      >
        <p>
          The records below are illustrative concepts that show how Adinn work
          will be presented. They are not real projects or client work.
        </p>
      </PageHeader>

      <Container className="pb-10 md:pb-14">
        <WorkExplorer projects={items} verticals={options} />
      </Container>

      <CtaBanner
        title="Have a requirement to discuss?"
        text="Tell us about your brief and we’ll help you find the right team."
        primary={{ href: ENQUIRY_HREF, label: "Get in Touch" }}
      />
    </>
  );
}
