import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { getProductsForSitemap } from "@/lib/services/products";
import { blogPosts } from "@/lib/content/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProductsForSitemap();
  const staticRoutes = [
    { path: "/about", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/faqs", priority: 0.6 },
    { path: "/shipping", priority: 0.5 },
    { path: "/returns", priority: 0.5 },
    { path: "/privacy", priority: 0.3 },
    { path: "/terms", priority: 0.3 },
    { path: "/careers", priority: 0.3 },
    { path: "/blog", priority: 0.7 },
  ];

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const publicPageUrls: MetadataRoute.Sitemap = staticRoutes.map(
    ({ path, priority }) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority,
    }),
  );
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(`${post.publishedAt}T00:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.6,
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
    ...publicPageUrls,
    ...blogUrls,
    ...productUrls,
  ];
}
