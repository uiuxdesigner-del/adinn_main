export const mainNav = [
  { href: "/#solutions", label: "Solutions" },
  { href: "/#services", label: "Services" },
  { href: "/work", label: "Our Work" },
  { href: "/about", label: "About Adinn" },
  { href: "/contact", label: "Contact" },
] as const;

export const utilityNav = [
  { href: "/careers", label: "Careers" },
  { href: "/investors", label: "Investor Information" },
] as const;

export const ENQUIRY_HREF = "/contact#enquiry";

/** Enquiry link that preselects a solution (`solution:<id>`) or service (`service:<id>`) in the form. */
export const enquiryHref = (interest: string) =>
  `/contact?interest=${encodeURIComponent(interest)}#enquiry`;
