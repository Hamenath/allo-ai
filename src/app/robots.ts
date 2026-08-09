import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
