import type { Metadata } from "next";
import {
  Cases,
  FinalConversion,
  Hero,
  Services,
  Solutions,
  StoryIntro,
  WhyAdinn,
} from "@/components/home/sections";
import { ClientsShowcase } from "@/components/clients/clients-showcase";
import { campaigns } from "@/lib/client-showcase";
import { OutdoorStory } from "@/components/outdoor/outdoor-story";
import { ShopStory } from "@/components/shop/shop-story";
import { VisualStory } from "@/components/story/visual-story";
import { contact, social } from "@/config/site";
import { ENABLE_OOH_STORY } from "@/config/story";
import { safeHttpUrl } from "@/lib/links";
import { siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "ADINN | Complete Marketing Solutions for Business Growth" },
  description:
    "Adinn brings strategy, creativity, media and on-ground execution together: outdoor, roadshows, events, signage, retail fixtures, printing, wall painting and digital marketing across South India.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ADINN Advertising Services Ltd.",
    url: siteUrl,
    logo: `${siteUrl}/Adinn.png`,
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    address: contact.offices.map((o) => ({
      "@type": "PostalAddress",
      name: o.name,
      streetAddress: o.address,
      addressCountry: "IN",
    })),
    sameAs: social.flatMap((s) => {
      const u = safeHttpUrl(s.url);
      return u ? [u] : [];
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <ClientsShowcase campaigns={campaigns} />
      <Solutions />
      <StoryIntro />
      {ENABLE_OOH_STORY ? (
        <>
          <OutdoorStory />
          <ShopStory />
        </>
      ) : (
        <VisualStory />
      )}
      <Services />
      <Cases />
      <WhyAdinn />
      <FinalConversion />
    </>
  );
}
