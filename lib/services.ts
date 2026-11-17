import type { VerticalId } from "@/config/site";

/**
 * Service detail for the eight verticals. Names, order and ids come from lib/verticals.ts, the
 * approved taxonomy. Facts follow the adinn.com service descriptions (CONTENT-SOURCES.md).
 * "Media Planning and Buying" and "Exhibition Solutions" are not in that taxonomy and are not shown.
 */
export type ServiceDetail = {
  id: VerticalId;
  achieves: string;
  delivers: string;
  connects: VerticalId[];
  connectNote: string;
};

export const serviceDetails: ServiceDetail[] = [
  {
    id: "outdoor",
    achieves: "Put your brand in front of a whole city.",
    delivers: "Hoardings and out-of-home media: site selection, creative production and installation.",
    connects: ["roadshows", "wall", "digital"],
    connectNote: "Pairs with roadshows and walls to reach people between the main sites.",
  },
  {
    id: "roadshows",
    achieves: "Take your product to the neighbourhoods, malls and markets where people are.",
    delivers: "GPS-enabled, RTO-approved roadshow vehicles, including LED display vehicles.",
    connects: ["events", "outdoor", "wall"],
    connectNote: "Works with events at the destination and outdoor media along the route.",
  },
  {
    id: "events",
    achieves: "Let people try the brand, not just see it.",
    delivers: "Launches, brand events and activations with creative, fabrication and trained on-ground teams in-house.",
    connects: ["roadshows", "printing", "digital"],
    connectNote: "Uses printed material and roadshow vehicles, and feeds digital campaigns.",
  },
  {
    id: "signage",
    achieves: "Make a store easy to find and recognise.",
    delivers: "Signage design, production and installation.",
    connects: ["fixtures", "printing"],
    connectNote: "Completes the store with fixtures and printed point-of-sale material.",
  },
  {
    id: "fixtures",
    achieves: "Show your products well, store after store.",
    delivers: "Display units, including modular shop-in-shop fixtures, made on advanced machinery.",
    connects: ["signage", "printing"],
    connectNote: "Matches store signage and printed display material.",
  },
  {
    id: "printing",
    achieves: "Finish a campaign with material that matches the brief.",
    delivers: "Posters, leaflets and point-of-purchase pieces.",
    connects: ["fixtures", "events", "signage"],
    connectNote: "Supports stores, events and signage with matching print.",
  },
  {
    id: "wall",
    achieves: "Reach people close to where they live and shop.",
    delivers: "Painted and printed wall advertising with geo-tagged recording of each location.",
    connects: ["roadshows", "outdoor"],
    connectNote: "Extends roadshow and outdoor coverage into smaller towns.",
  },
  {
    id: "digital",
    achieves: "Carry your message beyond the street.",
    delivers: "Search, performance marketing, content and websites.",
    connects: ["events", "outdoor", "roadshows"],
    connectNote: "Keeps online messages in step with outdoor, roadshow and event campaigns.",
  },
];
