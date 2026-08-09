import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alloai.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tools", "/tools/*", "/pricing", "/about"],
        disallow: [
          "/dashboard",
          "/history",
          "/favorites",
          "/documents",
          "/settings",
          "/usage",
          "/admin",
          "/admin/*",
          "/billing/history",
          "/api/*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
