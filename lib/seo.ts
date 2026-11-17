/**
 * Canonical site origin. Set SITE_URL (e.g. https://www.adinn.com) in the environment for production;
 * it feeds canonical URLs, the sitemap, robots and structured data.
 */
export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const sitePaths = ["/", "/about", "/work", "/verticals", "/contact", "/careers", "/investors", "/privacy"];
