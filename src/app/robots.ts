import type { MetadataRoute } from "next";
import { PRIVATE_ROUTES, SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin demo is excluded here as well as being noindex and absent
        // from the sitemap.
        disallow: PRIVATE_ROUTES.map((p) => `${p}/`).concat(PRIVATE_ROUTES),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
