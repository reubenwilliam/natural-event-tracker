import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

const absoluteUrl = (path: string) => {
  return `https://eonet.reubenwilliam.xyz${path}`;
};
