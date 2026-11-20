import type { VerticalId } from "@/config/site";

/**
 * Content for the dedicated service pages (app/verticals/[id]). Everything here is taken from what Adinn
 * publishes on adinn.com (CONTENT-SOURCES.md) and the approved service copy in lib/services.ts. Nothing is invented:
 * formats, sizes, site lists, process steps, results and prices are NOT published, so they are not shown.
 * Add them here when Adinn supplies them and they appear on the page.
 */
export type VerticalPage = {
  id: VerticalId;
  /** Short statement of what the service is (section 1). */
  what: string;
  /** What the client receives (section 2): the published scope, in the order Adinn lists it. */
  scope: string[];
  /** Execution support Adinn states for this service (section 2). */
  support: string[];
  /** Evidence for trust (section 3): company-stated facts relevant to this service. */
  evidence: { value?: string; text: string }[];
  /** Ids of real work in lib/cases.ts that relates to this service (section 5). */
  caseIds: string[];
};

const offices = "Offices in Madurai, Chennai, Bangalore and Coimbatore, with a strong base in Tamil Nadu.";
const years = { value: "24+", text: "years in advertising (company-stated)." };

export const verticalPages: Record<VerticalId, VerticalPage> = {
  outdoor: {
    id: "outdoor",
    what: "Outdoor and out-of-home media: hoardings that put your brand in front of a whole city, planned, produced and installed by one team.",
    scope: ["Site selection", "Creative production", "Installation"],
    support: [
      "Pairs with roadshows and walls to reach people between the main sites.",
      "Can be planned together with a digital campaign so the message online matches the one on the street.",
    ],
    evidence: [
      { value: "550+", text: "hoardings around South India (company-stated)." },
      years,
      { text: offices },
    ],
    caseIds: ["spr-india"],
  },
  roadshows: {
    id: "roadshows",
    what: "Roadshow vehicles that take your product to the neighbourhoods, malls and markets where people are.",
    scope: ["GPS-enabled, RTO-approved roadshow vehicles", "LED display vehicles"],
    support: ["Works with events at the destination and outdoor media along the route.", "Vehicles are GPS-enabled, so the route can be followed."],
    evidence: [
      { value: "250+", text: "mobile vans (company-stated)." },
      { value: "150+", text: "LED display vehicles (company-stated)." },
      years,
    ],
    caseIds: [],
  },
  events: {
    id: "events",
    what: "Launches, brand events and activations that let people try the brand, not just see it.",
    scope: ["Launches", "Brand events", "Activations"],
    support: ["Creative, fabrication and trained on-ground teams are in-house.", "Uses printed material and roadshow vehicles, and feeds digital campaigns."],
    evidence: [{ text: "Creative, fabrication and on-ground teams work inside Adinn." }, years, { text: offices }],
    caseIds: [],
  },
  signage: {
    id: "signage",
    what: "Signage and retail branding that make a store easy to find and recognise.",
    scope: ["Signage design", "Production", "Installation"],
    support: ["Completes the store with fixtures and printed point-of-sale material."],
    evidence: [{ text: "Signage, fixtures, printing and event fabrication are made by Adinn, as the company describes it." }, years, { text: offices }],
    caseIds: [],
  },
  fixtures: {
    id: "fixtures",
    what: "Display units that show your products well, store after store.",
    scope: ["Display units", "Modular shop-in-shop fixtures"],
    support: ["Made on advanced machinery.", "Matches store signage and printed display material."],
    evidence: [{ text: "Signage, fixtures, printing and event fabrication are made by Adinn, as the company describes it." }, years, { text: offices }],
    caseIds: [],
  },
  printing: {
    id: "printing",
    what: "Printed material and point-of-purchase pieces, produced to match the brief.",
    scope: ["Posters", "Leaflets", "Point-of-purchase pieces"],
    support: ["Supports stores, events and signage with matching print."],
    evidence: [{ text: "Signage, fixtures, printing and event fabrication are made by Adinn, as the company describes it." }, years, { text: offices }],
    caseIds: [],
  },
  wall: {
    id: "wall",
    what: "Painted and printed walls that reach people close to where they live and shop.",
    scope: ["Painted wall advertising", "Printed wall advertising", "Geo-tagged recording of each location"],
    support: ["Extends roadshow and outdoor coverage into smaller towns.", "Each wall location is geo-tagged, so delivery is recorded."],
    evidence: [{ text: "Wall work is geo-tagged, so each location is recorded." }, years, { text: offices }],
    caseIds: [],
  },
  digital: {
    id: "digital",
    what: "Online campaigns that carry your message beyond the street.",
    scope: ["Search", "Performance marketing", "Content", "Websites"],
    support: ["Keeps online messages in step with outdoor, roadshow and event campaigns."],
    evidence: [years, { text: "Offered alongside Adinn’s outdoor, roadshow and event services, under one brief." }, { text: offices }],
    caseIds: [],
  },
};
