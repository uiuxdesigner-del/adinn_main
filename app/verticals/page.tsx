import type { Metadata } from "next";
import { VerticalCards } from "@/components/vertical-links";
import { Container, CtaBanner, PageHeader } from "@/components/ui";
import { ENQUIRY_HREF } from "@/lib/navigation";

export const metadata: Metadata = { title: "Our Verticals" };

export default function VerticalsPage() {
  return (
    <>
      <PageHeader
        title="Find the right team for your next move."
        note={{
          purpose: "Directory that sends visitors to each existing vertical website.",
          needed: ["Website URL for each vertical in config/site.ts."],
          awaiting: [
            "Descriptions are draft. Photographs are illustrative stock; missing URLs show a pending status.",
          ],
        }}
      >
        <p>
          Adinn’s work is organised into eight teams, and each has its own
          website. Pick the one closest to your brief. If your brief spans
          several, tell us once and we’ll bring the right teams together.
        </p>
      </PageHeader>

      <Container className="pb-10 md:pb-14">
        <VerticalCards
          headingLevel={2}
          priorityFirst
          columns="lg:grid-cols-3 xl:grid-cols-4"
        />
      </Container>

      <CtaBanner
        title="Not sure which team to contact?"
        text="Describe your brief and we’ll help you find the right vertical."
        primary={{ href: ENQUIRY_HREF, label: "Discuss Your Project" }}
      />
    </>
  );
}
