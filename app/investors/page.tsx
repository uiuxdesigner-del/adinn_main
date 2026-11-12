import type { Metadata } from "next";
import { ReviewNote } from "@/components/review-notes";
import { Container, ExternalLink, PageHeader, PendingPanel } from "@/components/ui";
import { externalDestinations } from "@/config/site";
import { safeHttpUrl } from "@/lib/links";

export const metadata: Metadata = { title: "Investor Information" };

const areas = [
  {
    title: "Company information",
    text: "Approved statements about the company, once supplied.",
  },
  {
    title: "Corporate documents",
    text: "Documents the company has approved for publication.",
  },
  {
    title: "Responsible contact",
    text: "The person or team to contact about investor queries.",
  },
];

export default function InvestorsPage() {
  const url = safeHttpUrl(externalDestinations.investorUrl);
  return (
    <>
      <PageHeader title="Investor information">
        <p>
          This page will hold corporate information for investors and other
          stakeholders once it has been approved for publication.
        </p>
      </PageHeader>
      <Container className="pb-10 md:pb-14">
        <ReviewNote
          purpose="Single place for approved corporate information."
          needed={["Approved company information, documents, responsible contact and investor URL."]}
          awaiting={[
            "No disclosures, financial or legal content is included. No listing was found, and adinn.com has an Investor Relations menu item with no page behind it. Whether this page applies depends on the company's status: see LEGAL-CHECKLIST.md.",
          ]}
        />
        <ul className="grid gap-8 md:grid-cols-3">
          {areas.map((a) => (
            <li key={a.title} className="border-t border-ink pt-4">
              <h2 className="text-h3">{a.title}</h2>
              <p className="mt-2 text-ash">{a.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          {url ? (
            <ExternalLink href={url} button>
              Visit investor website
            </ExternalLink>
          ) : (
            <PendingPanel title="Investor link awaiting confirmation.">
              Information for these areas is not yet available. It will be
              added once approved, along with a link to the investor website.
            </PendingPanel>
          )}
        </div>
      </Container>
    </>
  );
}
