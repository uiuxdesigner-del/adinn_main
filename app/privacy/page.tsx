import type { Metadata } from "next";
import { PageHeader, PendingPanel, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy (draft)" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy notice (draft)"
        note={{
          purpose: "Describe what this prototype does with information, and hold the place of the final notice.",
          needed: [
            "Legal entity name, registered office and contact details; what data the live site and recruitment will collect, why, for how long and who sees it; a named grievance contact; counsel-approved wording.",
          ],
          awaiting: [
            "See LEGAL-CHECKLIST.md. Nothing on this page is a legal statement of Adinn’s data practices.",
          ],
        }}
      >
        <p>
          This is a draft for internal review. The final notice needs approval
          from Adinn before the website is published.
        </p>
      </PageHeader>
      <Section title="How this prototype handles information" compact>
        <ul className="prose-width list-disc space-y-2 pl-5">
          <li>
            The enquiry form on the Contact page is a preview. It does not send
            your details anywhere, and Adinn does not receive them.
          </li>
          <li>
            What you type stays in the open page. It is not saved in your
            browser’s storage or added to the address.
          </li>
          <li>
            This prototype does not use accounts, payments, analytics or
            advertising cookies.
          </li>
        </ul>
      </Section>
      <Section title="The final notice" compact reveal="none">
        <PendingPanel title="To be supplied by Adinn">
          The published notice will explain what personal information the live
          website collects, why, how long it is kept and how to contact Adinn
          about it. It has not been written yet.
        </PendingPanel>
      </Section>
    </>
  );
}
