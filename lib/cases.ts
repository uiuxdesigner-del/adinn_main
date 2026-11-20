/**
 * Verified Adinn work. Only what is documented is stated. adinn.com features these four client
 * films without text; no challenge, objective, coverage or results are published, so none are written
 * here. Add them to `details` when Adinn supplies them and they appear automatically.
 */
export type CaseStudy = {
  id: string;
  client: string;
  logo: { file: string; w: number; h: number } | null;
  /** Official film, hosted by Adinn. Loaded only when the visitor presses play. */
  video: string;
  note: string | null;
  details: {
    challenge?: string;
    objective?: string;
    strategy?: string;
    services?: string[];
    coverage?: string;
    results?: string;
  };
};

const film = (name: string) => `https://www.adinn.com/projects/${name}.mp4`;

export const cases: CaseStudy[] = [
  {
    id: "spr-india",
    client: "SPR India",
    logo: { file: "spr-india", w: 547, h: 700 },
    video: film("spr"),
    note: "The film describes this as out-of-home work strategized and executed by Adinn.",
    details: { services: ["Outdoor / OOH"] },
  },
  { id: "dalmia-cement", client: "Dalmia Cement", logo: { file: "dalmia", w: 700, h: 357 }, video: film("dalmia"), note: null, details: {} },
  { id: "hatsun", client: "Hatsun", logo: { file: "hatsun", w: 700, h: 211 }, video: film("hatsun"), note: null, details: {} },
  { id: "havells", client: "Havells", logo: { file: "havells", w: 186, h: 127 }, video: film("havells"), note: null, details: {} },
];
