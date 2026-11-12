import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { HeroIntro } from "@/components/motion/reveal";
import { ReviewNote } from "@/components/review-notes";
import { VerticalDirectory } from "@/components/vertical-links";
import { Container, PendingPanel } from "@/components/ui";
import { contact } from "@/config/site";
import { safeHttpUrl, safeMailto, safeTel } from "@/lib/links";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  const email = safeMailto(contact.email);
  const phone = safeTel(contact.phone);
  const directions = safeHttpUrl(contact.directionsUrl);
  const hasOffices = contact.offices.length > 0;
  const anyDetail = hasOffices || email || phone || directions;

  return (
    <Container className="pt-6 pb-10 md:pt-10 md:pb-14">
      <ReviewNote
        purpose="Two routes: go straight to a vertical, or send a general enquiry."
        needed={[
          "Office addresses, phone, email and directions. A decision on where enquiries are delivered.",
        ]}
        awaiting={["Privacy wording. The form is a simulation and sends nothing."]}
      />
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_1.1fr]">
        <HeroIntro className="lg:col-start-1 lg:row-start-1">
          <h1 className="text-h1">Have a brief? Let’s talk it through.</h1>
          <p className="prose-width mt-4 text-ash">
            If you know which service you need, go straight to that
            vertical’s website. If you are not sure, tell us what you have in
            mind and we’ll help you find the right team.
          </p>
          <div className="mt-6 rounded-xl bg-line p-5">
            <h2 className="text-h3">Useful to include</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ash">
              <li>What you want the campaign to achieve.</li>
              <li>Where and when it needs to happen.</li>
              <li>Whether you already have artwork or brand guidelines.</li>
              <li>Anything the team should know, such as budget or deadlines.</li>
            </ul>
            <p className="text-note mt-3 text-ash">
              None of this is required. A short description is enough to start.
            </p>
          </div>
        </HeroIntro>

        <section
          aria-labelledby="vertical-route-heading"
          className="lg:col-start-1 lg:row-start-2"
        >
          <h2 id="vertical-route-heading" className="text-h2">
            I know the vertical I need
          </h2>
          <div className="mt-5">
            <VerticalDirectory />
          </div>
        </section>

        <section
          id="enquiry"
          aria-labelledby="enquiry-heading"
          className="rounded-2xl border border-line p-6 md:p-8 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-start"
        >
          <h2 id="enquiry-heading" className="text-h2">
            I need guidance
          </h2>
          <div className="mt-5">
            <EnquiryForm />
          </div>
        </section>

        <section
          aria-labelledby="details-heading"
          className="lg:col-start-1 lg:row-start-3"
        >
          <h2 id="details-heading" className="text-h2">
            Contact details
          </h2>
          <div className="mt-5">
            {anyDetail ? (
              <dl className="space-y-4">
                {hasOffices && (
                  <div>
                    <dt className="font-medium">Offices</dt>
                    <dd className="mt-1 space-y-2 text-ash">
                      {contact.offices.map((o) => (
                        <p key={o.name}>
                          <span className="font-medium text-ink">{o.name}</span>
                          <br />
                          {o.address}
                        </p>
                      ))}
                    </dd>
                  </div>
                )}
                {phone && (
                  <div>
                    <dt className="font-medium">Phone</dt>
                    <dd>
                      <a href={phone} className="link">
                        {contact.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {email && (
                  <div>
                    <dt className="font-medium">Email</dt>
                    <dd>
                      <a href={email} className="link">
                        {contact.email}
                      </a>
                    </dd>
                  </div>
                )}
                {directions && (
                  <div>
                    <dt className="font-medium">Directions</dt>
                    <dd>
                      <a href={directions} className="link">
                        Get directions
                        <span className="sr-only"> (external website)</span>
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <PendingPanel title="To be added">
                Office addresses, phone number, email and directions will
                appear here once they have been verified.
              </PendingPanel>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
}
