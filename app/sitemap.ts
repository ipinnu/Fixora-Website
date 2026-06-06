import type { MetadataRoute } from "next";

const BASE = "https://fixora.ng";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${BASE}/features`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/pricing`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/verification`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${BASE}/jobs`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${BASE}/artisans`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${BASE}/post-job`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${BASE}/signup`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${BASE}/login`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${BASE}/terms`, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${BASE}/privacy`, priority: 0.4, changeFrequency: "yearly" as const },
  ];

  return staticRoutes.map(r => ({ ...r, lastModified: new Date() }));
}
