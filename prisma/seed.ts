import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const categories = [
  "Pantofi bărbați",
  "Pantofi femei",
  "Ghete",
  "Cizme",
  "Sandale",
  "Curele",
  "Portofele",
  "Genți",
  "Chipiuri",
  "Îngrijire încălțăminte",
  "Accesorii",
];

const products = [
  ["Pantofi bărbați Oxford Classic", "Pantofi bărbați", "bărbați", 149900, null, true, "/products/pantofi-barbati.jpg"],
  ["Pantofi femei Elegance Nude", "Pantofi femei", "femei", 129900, 109900, true, "/products/pantofi-femei.jpg"],
  ["Ghete bărbați Urban Leather", "Ghete", "bărbați", 179900, null, true, "/products/ghete.jpg"],
  ["Curea din piele Premium Brown", "Curele", "unisex", 39900, null, false, "/products/curea.jpg"],
  ["Portofel din piele Classic", "Portofele", "unisex", 49900, 42900, true, "/products/portofel.jpg"],
  ["Set îngrijire piele Leather Care", "Îngrijire încălțăminte", "unisex", 24900, null, false, "/products/ingrijire.jpg"],
  ["Geantă din piele Elegant", "Genți", "femei", 159900, null, true, "/products/geanta.jpg"],
  ["Chipiu casual premium", "Chipiuri", "unisex", 29900, null, false, "/products/chipiu.jpg"],
] as const;

async function main() {
  await prisma.storeSetting.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  await Promise.all(
    [
      ["storeName", "Tiras"],
      ["address", "Leova MD, Strada Independenţei 11, MD-6301"],
      ["phone", "0788 78 414"],
      ["email", "contact@tiras.local"],
      ["workingHours", "Luni-Sâmbătă: 09:00-18:00"],
      ["socialLinks", "Facebook / Instagram - configurabil"],
      ["mapEmbed", ""],
      ["homepageIntro", "Produse din piele cu aspect curat, calitate verificată și consiliere directă în magazin."],
      ["seoTitle", "Tiras - încălțăminte și accesorii din piele în Leova"],
      ["seoDescription", "Catalog local Tiras. Comandă cu confirmare telefonică, fără plată online."],
    ].map(([key, value]) => prisma.storeSetting.create({ data: { key, value } })),
  );

  const categoryRows = new Map<string, string>();
  for (const [index, name] of categories.entries()) {
    const row = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: `Categoria ${name} pentru magazinul Tiras.`,
        sortOrder: index,
      },
    });
    categoryRows.set(name, row.id);
  }

  for (const [index, [name, categoryName, gender, price, discount, recommended, imageUrl]] of products.entries()) {
    const product = await prisma.product.create({
      data: {
        name,
        slug: slugify(name),
        sku: `TIR-${String(index + 1).padStart(4, "0")}`,
        categoryId: categoryRows.get(categoryName),
        shortDescription: "Produs din piele, potrivit pentru purtare zilnică și ocazii simple.",
        longDescription:
          "Disponibilitatea finală se confirmă telefonic de operatorul Tiras. Produsul poate fi ridicat din magazin sau livrat prin înțelegere.",
        material: index <= 6 ? "Piele naturală" : "Textil premium",
        manufacturer: "Tiras",
        gender,
        basePriceCents: price,
        discountPriceCents: discount,
        isRecommended: recommended,
        isFeatured: index < 3,
        status: "active",
        images: {
          create: [
            { url: imageUrl, alt: name, sortOrder: 0, isMain: true },
          ],
        },
      },
    });

    const sizes = categoryName.includes("Pantofi") || categoryName === "Ghete" ? ["39", "40", "41", "42", "43"] : [null];
    const colors = categoryName === "Pantofi femei" ? ["Nude", "Negru"] : ["Maro", "Negru"];
    for (const size of sizes) {
      for (const color of colors) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color,
            sku: `${product.sku}-${size ?? "UNI"}-${color.toUpperCase().slice(0, 3)}`,
            stockQuantity: Math.max(1, 6 - index),
          },
        });
      }
    }
  }

  await prisma.user.upsert({
    where: { email: "seller@tiras.local" },
    update: {},
    create: {
      email: "seller@tiras.local",
      passwordHash: await bcrypt.hash("seller12345", 10),
      firstName: "Operator",
      lastName: "Tiras",
      phone: "0788 78 414",
      role: "SELLER",
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
