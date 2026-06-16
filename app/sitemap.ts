import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "http://localhost:3000";
  const products = await prisma.product.findMany({ where: { status: "active", deletedAt: null }, select: { slug: true, updatedAt: true } });
  return [
    "", "/catalog", "/cart", "/contact", "/terms", "/privacy", "/returns", "/cookies",
    ...products.map((product) => `/catalog/${product.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: path.startsWith("/catalog/") ? products.find((p) => `/catalog/${p.slug}` === path)?.updatedAt : new Date(),
  }));
}
