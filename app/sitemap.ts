import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://erkanoglu.com.tr";
  const routes = ["/", "/evimi-hesapla", "/proje-talebi", "/canakkale-mimarlik", "/canakkale-ruhsat-projesi", "/canakkale-villa-projesi"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/proje-talebi" ? 0.9 : 0.8,
  }));
}
