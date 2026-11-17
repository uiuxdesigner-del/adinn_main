import type { VerticalId } from "@/config/site";

/**
 * Solutions are written around business goals. Service names must match lib/verticals.ts
 * (the approved taxonomy). Outcomes describe what the work is designed to do, never a result.
 */
export type Solution = {
  id: string;
  title: string;
  challenge: string;
  approach: string;
  services: VerticalId[];
  outcome: string;
  cta: string;
};

export const solutions: Solution[] = [
  {
    id: "brand-launch",
    title: "Brand launches",
    challenge: "A new product or brand has to be noticed quickly, in the places where its buyers already are.",
    approach:
      "Hoardings make the launch visible across a city, roadshow vehicles carry it into neighbourhoods and events let people see the product for themselves, with one creative idea across all three.",
    services: ["outdoor", "roadshows", "events", "digital"],
    outcome: "Designed to give the launch a visible, consistent presence from the first week.",
    cta: "Plan a brand launch",
  },
  {
    id: "market-expansion",
    title: "Market expansion",
    challenge: "Entering new towns means reaching many local audiences with the same message and no gaps in delivery.",
    approach:
      "GPS-enabled roadshow vehicles and geo-tagged wall painting cover towns on a planned route, backed by printed material and local outdoor sites, with each location recorded.",
    services: ["roadshows", "wall", "outdoor", "printing"],
    outcome: "Designed to give every new market the same message, delivered and recorded location by location.",
    cta: "Plan a market entry",
  },
  {
    id: "lead-generation",
    title: "Lead generation",
    challenge: "Interest from the street has to be turned into enquiries you can follow up.",
    approach:
      "Activations and roadshows bring people to a stand or a vehicle, and digital campaigns and a clear online route capture the interest they create.",
    services: ["events", "roadshows", "digital"],
    outcome: "Designed to give interested people a clear next step, on the ground and online.",
    cta: "Plan a lead campaign",
  },
  {
    id: "retail-footfall",
    title: "Retail footfall",
    challenge: "Stores need to be easy to find, and consistent enough that shoppers recognise the brand at every location.",
    approach:
      "Signage is designed, produced and installed, fixtures and shop-in-shop units are made to a common standard and printed point-of-sale material finishes the store.",
    services: ["signage", "fixtures", "printing", "outdoor"],
    outcome: "Designed to make each store recognisable and consistent across locations.",
    cta: "Plan a retail rollout",
  },
  {
    id: "brand-awareness",
    title: "Brand awareness",
    challenge: "A brand needs to stay in view across a region over weeks, not just on launch day.",
    approach:
      "Outdoor sites, walls and roadshows keep the brand present along everyday routes, and digital marketing keeps what people see outside in step with what they find online.",
    services: ["outdoor", "wall", "roadshows", "digital"],
    outcome: "Designed to keep the brand visible along the routes and places your audience uses.",
    cta: "Plan an awareness campaign",
  },
];
