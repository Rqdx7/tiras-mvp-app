import { prisma } from "@/lib/prisma";
import { STORE_DEFAULTS } from "@/lib/constants";

type CatalogProductForDiscount = {
  basePriceCents: number;
  discountPriceCents: number | null;
  isRecommended: boolean;
  variants: {
    priceOverrideCents: number | null;
    discountOverrideCents: number | null;
  }[];
};

export async function getSettings() {
  const rows = await prisma.storeSetting.findMany();
  const settings = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    storeName: settings.storeName ?? STORE_DEFAULTS.name,
    address: settings.address ?? STORE_DEFAULTS.address,
    phone: settings.phone ?? STORE_DEFAULTS.phone,
    email: settings.email ?? STORE_DEFAULTS.email,
    workingHours: settings.workingHours ?? "Luni-Sâmbătă: 09:00-18:00",
    socialLinks: settings.socialLinks ?? "",
    mapEmbed: settings.mapEmbed ?? "",
    homepageIntro:
      settings.homepageIntro ??
      "Încălțăminte și accesorii din piele pentru fiecare zi, alese cu grijă în Leova.",
    seoTitle: settings.seoTitle ?? "Tiras - încălțăminte și accesorii din piele în Leova",
    seoDescription:
      settings.seoDescription ??
      "Catalog local Tiras cu pantofi, ghete, genți, curele și accesorii din piele. Comanda se confirmă telefonic.",
  };
}

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { active: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCatalogProducts(searchParams: Record<string, string | string[] | undefined>) {
  const page = Math.max(Number(searchParams.page ?? 1), 1);
  const take = 12;
  const skip = (page - 1) * take;
  const query = String(searchParams.q ?? "").trim();
  const category = String(searchParams.category ?? "");
  const size = String(searchParams.size ?? "");
  const color = String(searchParams.color ?? "");
  const material = String(searchParams.material ?? "");
  const gender = String(searchParams.gender ?? "");
  const discountParam = String(searchParams.discount ?? "");
  const discount = ["true", "1", "yes", "on"].includes(discountParam);
  const inStock = String(searchParams.inStock ?? "true") !== "false";
  const sort = String(searchParams.sort ?? "discount-desc");
  const min = Number(searchParams.min ?? "");
  const max = Number(searchParams.max ?? "");

  const andFilters = [
    ...(query
      ? [
          {
            OR: [
              { name: { contains: query } },
              { shortDescription: { contains: query } },
              { sku: { contains: query } },
            ],
          },
        ]
      : []),
    ...(discount
      ? [
          {
            OR: [
              { discountPriceCents: { not: null } },
              { variants: { some: { deletedAt: null, discountOverrideCents: { not: null } } } },
            ],
          },
        ]
      : []),
  ];

  const where = {
    status: "active",
    deletedAt: null,
    ...(andFilters.length ? { AND: andFilters } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(material ? { material: { contains: material } } : {}),
    ...(gender ? { gender } : {}),
    ...(Number.isFinite(min) && min > 0 ? { basePriceCents: { gte: Math.round(min * 100) } } : {}),
    ...(Number.isFinite(max) && max > 0 ? { basePriceCents: { lte: Math.round(max * 100) } } : {}),
    variants: {
      some: {
        deletedAt: null,
        ...(inStock ? { stockQuantity: { gt: 0 } } : {}),
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
      },
    },
  };

  const sortByDiscount = sort === "discount-desc" || sort === "discounted";
  const orderBy =
    sort === "price-asc"
      ? [{ basePriceCents: "asc" as const }]
      : sort === "price-desc"
        ? [{ basePriceCents: "desc" as const }]
        : sort === "newest"
          ? [{ createdAt: "desc" as const }]
          : [{ isRecommended: "desc" as const }, { createdAt: "desc" as const }];

  const discountScore = (product: CatalogProductForDiscount) => {
    const productScore = product.discountPriceCents
      ? (product.basePriceCents - product.discountPriceCents) / product.basePriceCents
      : 0;
    const variantScore = product.variants.reduce((best, variant) => {
      const base = variant.priceOverrideCents ?? product.basePriceCents;
      const discounted = variant.discountOverrideCents ?? product.discountPriceCents;
      if (!discounted || base <= 0) return best;
      return Math.max(best, (base - discounted) / base);
    }, 0);
    return Math.max(productScore, variantScore);
  };

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: [{ isMain: "desc" }, { sortOrder: "asc" }] },
        variants: { where: { deletedAt: null }, orderBy: [{ size: "asc" }, { color: "asc" }] },
      },
      orderBy,
      ...(sortByDiscount ? {} : { skip, take }),
    }),
    prisma.product.count({ where }),
  ]);
  const products = sortByDiscount
    ? rawProducts
        .sort((first, second) => {
          const byDiscount = discountScore(second) - discountScore(first);
          if (byDiscount !== 0) return byDiscount;
          return Number(second.isRecommended) - Number(first.isRecommended);
        })
        .slice(skip, skip + take)
    : rawProducts;

  return { products, total, page, pages: Math.max(Math.ceil(total / take), 1) };
}
