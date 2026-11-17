import type { MetadataRoute } from "next";
import { siteUrl, sitePaths } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitePaths.map((p) => ({
    url: `${siteUrl}${p === "/" ? "" : p}`,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.6,
  }));
}
