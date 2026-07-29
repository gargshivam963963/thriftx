import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getProductsForSitemap } from "@/lib/services/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsForSitemap();

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
