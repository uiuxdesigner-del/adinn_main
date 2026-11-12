import { verticalUrls, type VerticalId } from "@/config/site";
import type { ImageKey } from "@/lib/images";
import { safeHttpUrl } from "@/lib/links";

export type Vertical = {
  id: VerticalId;
  name: string;
  description: string;
  /** Descriptive link label, e.g. "Explore Outdoor". */
  action: string;
  image: ImageKey;
  /** Validated destination, or null when awaiting confirmation. */
  url: string | null;
};

const base: Omit<Vertical, "url">[] = [
  {
    id: "outdoor",
    image: "outdoor",
    name: "Outdoor / OOH",
    description:
      "Hoardings and out-of-home media that put your brand in front of a city.",
    action: "Explore Outdoor",
  },
  {
    id: "roadshows",
    image: "roadshows",
    name: "Roadshows",
    description:
      "Take your product to the neighbourhoods, malls and markets where people are.",
    action: "Explore Roadshows",
  },
  {
    id: "events",
    image: "events",
    name: "Events & Activations",
    description:
      "Launches, brand events and activations that people can walk up to and try.",
    action: "Explore Events",
  },
  {
    id: "signage",
    image: "signage",
    name: "Signage & Retail Branding",
    description:
      "Signage and branding that make a store easy to find and recognise.",
    action: "Explore Signage",
  },
  {
    id: "fixtures",
    image: "fixtures",
    name: "Retail Fixtures",
    description:
      "Display units that show your products well, store after store.",
    action: "Explore Retail Fixtures",
  },
  {
    id: "printing",
    image: "printing",
    name: "Printing & POP",
    description:
      "Printed material and point-of-purchase pieces, produced to match the brief.",
    action: "Explore Printing",
  },
  {
    id: "wall",
    image: "wall",
    name: "Wall Advertising",
    description:
      "Painted and printed walls that reach people close to where they live and shop.",
    action: "Explore Wall Advertising",
  },
  {
    id: "digital",
    image: "digital",
    name: "Digital Marketing",
    description:
      "Online campaigns that carry your message beyond the street.",
    action: "Explore Digital",
  },
];

export const verticals: Vertical[] = base.map((v) => ({
  ...v,
  url: safeHttpUrl(verticalUrls[v.id]),
}));
