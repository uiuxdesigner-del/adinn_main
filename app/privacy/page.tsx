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
      <Section title="How this website handles enquiries (draft)" compact>
        <ul className="prose-width list-disc space-y-2 pl-5">
          <li>
            When you send the enquiry form, your name, company (if given), email, phone,
            requirement and the topic you chose are sent to Adinn’s enquiry system.
          </li>
          <li>
            We also record the page you sent it from, the page that referred you and any campaign
            (UTM) parameters in the address, so Adinn knows which activity led to the enquiry.
          </li>
          <li>
            The form is checked for spam. The details you type are not stored in your browser.
          </li>
          <li>
            This site does not set advertising cookies. If analytics or a tag manager is added, this
            notice must be updated first.
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
