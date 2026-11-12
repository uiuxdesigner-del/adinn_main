import { projectUrls, type VerticalId } from "@/config/site";
import type { ImageKey } from "@/lib/images";
import { safeHttpUrl } from "@/lib/links";

export type Project = {
  id: string;
  name: string;
  verticalId: VerticalId;
  image: ImageKey;
  location: string | null;
  description: string;
  /** True for sample concepts that are not real ADINN projects. */
  illustrative: boolean;
  /** Validated project destination, or null. */
  url: string | null;
};

const base: Omit<Project, "url">[] = [
  {
    id: "sample-outdoor",
    name: "A city-wide launch on hoardings",
    verticalId: "outdoor",
    image: "outdoor",
    location: null,
    description:
      "A concept for a product launch that needs to be seen across a busy city: site selection, creative production and installation planned together.",
    illustrative: true,
  },
  {
    id: "sample-events",
    name: "A launch people can step into",
    verticalId: "events",
    image: "events",
    location: null,
    description:
      "A concept for a brand display at a high-footfall venue, with staffing, set-up and the schedule coordinated as one plan.",
    illustrative: true,
  },
  {
    id: "sample-signage",
    name: "One look across every store",
    verticalId: "signage",
    image: "signage",
    location: null,
    description:
      "A concept for consistent signage and branding across several retail locations, produced and fitted to the same standard.",
    illustrative: true,
  },
  {
    id: "sample-digital",
    name: "Online follow-through for a street campaign",
    verticalId: "digital",
    image: "digital",
    location: null,
    description:
      "A concept for carrying an on-ground campaign online, so the message people see outside is the one they find on their phones.",
    illustrative: true,
  },
];

export const projects: Project[] = base.map((p) => ({
  ...p,
  url: safeHttpUrl(projectUrls[p.id]),
}));
