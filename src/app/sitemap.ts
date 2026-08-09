import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://alloai.in";

const toolSlugs = [
  "resume-analyzer",
  "interview-generator",
  "cover-letter",
  "cold-email",
  "linkedin",
  "study-planner",
  "invoice",
  "job-description",
  "crm",
  "proposal",
  "social-calendar",
  "startup-validator",
  "github-readme",
  "bug-report",
  "meeting-summarizer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  toolSlugs.forEach((slug) => {
    routes.push({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return routes;
}
