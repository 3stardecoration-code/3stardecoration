import type { MetadataRoute } from "next";
import { getDataService } from "@/lib/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const db = getDataService();
  const [projectSlugs, services] = await Promise.all([
    db.projects.listPublishedSlugs(),
    db.services.listPublished(),
  ]);

  const staticRoutes = ["", "/portfolio", "/services", "/about", "/contact", "/quote", "/privacy", "/terms"].map(
    (path) => ({ url: `${base}${path}`, lastModified: new Date() }),
  );

  const projectRoutes = projectSlugs.map((slug) => ({
    url: `${base}/portfolio/${slug}`,
    lastModified: new Date(),
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...projectRoutes, ...serviceRoutes];
}
