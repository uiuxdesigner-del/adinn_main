/**
 * Data for the Clients showcase (components/clients/clients-showcase.tsx).
 *
 * LOGOS: official files already used on the site (public/clients, from adinn.com). Dimensions are
 * the trimmed file sizes and are used only to preserve proportions.
 *
 * CAMPAIGNS: a client is paired with a photograph ONLY when that photograph is verified Adinn work
 * for that client. None has been supplied yet, so `campaigns` is empty and the section renders
 * nothing. Add an entry per verified photograph; everything else (caption, logo, index, link,
 * background emphasis) follows automatically.
 */
export type ClientLogo = { id: string; name: string; src: string; w: number; h: number };

export type ClientCampaign = {
  id: string;
  /** Must match a `clientLogos` id. Name and logo are derived from it so they cannot disagree.
   *  Omit for a photograph that is not a specific client's campaign (then only `title` is captioned). */
  clientId?: string;
  /** Optional campaign photograph. Without it the client's logo is shown large in the centre. */
  photo?: { src: string; w: number; h: number };
  /** Describes the photograph (or the logo when there is no photograph). */
  alt: string;
  title?: string;
  /** Case-study destination. Shown only if it is a site path ("/work#x") or an https URL. */
  href?: string;
  /** Crop focus in percent (0-100). Defaults to the centre. */
  focal?: { x: number; y: number };
};

const logo = (id: string, name: string, w: number, h: number): ClientLogo => ({
  id,
  name,
  src: `/clients/${id}.webp`,
  w,
  h,
});

export const clientLogos: ClientLogo[] = [
  logo("havells", "Havells", 186, 127),
  logo("honda", "Honda", 500, 113),
  logo("royal-enfield", "Royal Enfield", 700, 700),
  logo("maruti-suzuki", "Maruti Suzuki", 700, 124),
  logo("daikin", "Daikin", 700, 381),
  logo("hatsun", "Hatsun", 700, 211),
  logo("milky-mist", "Milky Mist", 700, 222),
  logo("kfc", "KFC", 500, 254),
  logo("dalmia", "Dalmia Cement", 700, 357),
  logo("burger-king", "Burger King", 540, 540),
  logo("iob", "Indian Overseas Bank", 700, 279),
  logo("spr-india", "SPR India", 547, 700),
];

/**
 * Centre slides. One per client logo until verified campaign photographs exist: add `photo` (and
 * `title`, `href`) to an entry to show that photograph instead of the logo.
 */
export const campaigns: ClientCampaign[] = clientLogos.map((l) => ({
  id: l.id,
  clientId: l.id,
  alt: `${l.name} logo`,
}));

export function isValidHref(href: string | undefined): href is string {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}
