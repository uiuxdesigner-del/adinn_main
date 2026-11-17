/**
 * ADINN central configuration — the single place to edit destinations and
 * contact details.
 *
 * Rules
 * - `null` means "not supplied yet". The site then shows a readable pending
 *   status ("… awaiting confirmation") and never renders a link.
 * - Only paste URLs supplied and approved by ADINN. Do not guess domains.
 * - URLs must be absolute http(s) URLs. Anything else is treated as missing.
 * - After editing, restart `npm run dev` (or rebuild) to see the change.
 */

export type VerticalId =
  | "outdoor"
  | "roadshows"
  | "events"
  | "signage"
  | "fixtures"
  | "printing"
  | "wall"
  | "digital";

/** Existing website of each business vertical. */
export const verticalUrls: Record<VerticalId, string | null> = {
  outdoor: null,
  roadshows: null,
  events: null,
  signage: null,
  fixtures: null,
  printing: null,
  wall: null,
  digital: null,
};

/** Destinations for the Careers and Investor Information pages. */
export const externalDestinations: {
  recruitmentUrl: string | null;
  investorUrl: string | null;
} = {
  recruitmentUrl: null,
  investorUrl: null,
};

/**
 * Real project destinations, keyed by project id (see lib/projects.ts).
 * Illustrative sample records have no destination.
 */
export const projectUrls: Record<string, string | null> = {
  "sample-outdoor": null,
  "sample-events": null,
  "sample-signage": null,
  "sample-digital": null,
};

/**
 * Company contact details. Copied from the public Contact page at adinn.com on
 * 2026-11-12 (see CONTENT-SOURCES.md). Confirm they are current and approved.
 */
export const contact: {
  phone: string | null;
  /** Digits only with country code, for wa.me links. Confirm this number is on WhatsApp. */
  whatsapp: string | null;
  email: string | null;
  /** Link to directions for the main office (e.g. a map URL). */
  directionsUrl: string | null;
  offices: { name: string; address: string }[];
} = {
  phone: "+91 80158 06062",
  whatsapp: "918015806062",
  email: "info@adinn.co.in",
  directionsUrl: null,
  offices: [
    {
      name: "Madurai",
      address:
        "29, 1st Cross Street, Vanamamalai Nagar, Bypass Road, Madurai 625010",
    },
    {
      name: "Chennai",
      address:
        "No. 19/43, MG Chakrapani Street, Sathya Garden, Saligramam, Chennai 600092",
    },
    {
      name: "Bangalore",
      address:
        "No. 24, 2nd Floor, 9th A Cross Road, Park Area, Wilson Garden, Bangalore 560027",
    },
    {
      name: "Coimbatore",
      address:
        "No. 13, Sivasakthi Colony (near Coimbatore Roller Flour Mill), Ganapathy, Coimbatore 641006",
    },
  ],
};

/** Social accounts linked from adinn.com. Only non-null entries are shown. */
export const social: { label: string; url: string | null }[] = [
  { label: "LinkedIn", url: "https://www.linkedin.com/company/adinn-advertising-service-pvt-ltd-/" },
  { label: "Instagram", url: "https://www.instagram.com/adinnadvertising/" },
  { label: "Facebook", url: "https://www.facebook.com/AdinnAdvertisingServicesLtd" },
  { label: "YouTube", url: "https://www.youtube.com/channel/UCAnRMAjYwSv_g90SYa5vdXw" },
];
