import type { MetadataRoute } from "next";
import { CLASS_TYPES } from "@/data/studio";
import { PRIVATE_ROUTES, SITE_URL } from "@/lib/config";

/**
 * Public routes only. PRIVATE_ROUTES (the admin demo) is filtered out here and
 * is separately disallowed in robots.ts and served with noindex.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/jadwal", changeFrequency: "daily", priority: 0.9 },
    { path: "/kelas", changeFrequency: "monthly", priority: 0.8 },
    { path: "/paket", changeFrequency: "monthly", priority: 0.7 },
    { path: "/kontak", changeFrequency: "monthly", priority: 0.7 },
    { path: "/kebijakan-privasi", changeFrequency: "yearly", priority: 0.2 },
    { path: "/ketentuan-layanan", changeFrequency: "yearly", priority: 0.2 },
  ];

  const classRoutes = CLASS_TYPES.map((c) => ({
    path: `/kelas/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...classRoutes]
    .filter((r) => !PRIVATE_ROUTES.some((p) => r.path.startsWith(p)))
    .map((r) => ({
      url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    }));
}
