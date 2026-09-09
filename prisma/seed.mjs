import { PrismaClient } from "@prisma/client";
import { pathToFileURL } from "url";

const categories = [
  { name: "Электроника", slug: "electronics" },
  { name: "Одежда", slug: "clothing" },
  { name: "Дом и сад", slug: "home-garden" },
  { name: "Спорт", slug: "sport" },
];

const products = [
  {
    name: "Беспроводные наушники",
    slug: "besprovodnye-naushniki",
    price: 24990,
    oldPrice: 34990,
    stock: 15,
    sku: "EL-001",
    rating: 4.8,
    reviewsCount: 1243,
    category: "Электроника",
    description: "Наушники с активным шумоподавлением и временем работы до 30 часов.",
    imageUrl: "https://picsum.photos/seed/headphones/600/600",
  },
  {
    name: "Смарт-часы Series 8",
    slug: "smart-chasy-series-8",
    price: 89990,
    oldPrice: 109990,
    stock: 8,
    sku: "EL-002",
    rating: 4.9,
    reviewsCount: 875,
    category: "Электроника",
    description: "Фитнес-трекинг, пульсометр, GPS и защита от воды.",
    imageUrl: "https://picsum.photos/seed/watch/600/600",
  },
  {
    name: "Механическая клавиатура",
    slug: "mehanicheskaya-klaviatura",
    price: 34990,
    oldPrice: null,
    stock: 22,
    sku: "EL-003",
    rating: 4.6,
    reviewsCount: 412,
    category: "Электроника",
    description: "RGB-подсветка, hot-swap переключатели, USB-C.",
    imageUrl: "https://picsum.photos/seed/keyboard/600/600",
  },
  {
    name: "Хлопковая футболка",
    slug: "hlopkovaya-futbolka",
    price: 5990,
    oldPrice: 8990,
    stock: 120,
    sku: "CL-001",
    rating: 4.5,
    reviewsCount: 2310,
    category: "Одежда",
    description: "100% хлопок, унисекс, доступна в 5 цветах.",
    imageUrl: "https://picsum.photos/seed/tshirt/600/600",
  },
  {
    name: "Джинсы классические",
    slug: "dzhinsy-klassicheskie",
    price: 18990,
    oldPrice: 23990,
    stock: 40,
    sku: "CL-002",
    rating: 4.4,
    reviewsCount: 654,
    category: "Одежда",
    description: "Прямой крой, плотный деним, размеры 28–38.",
    imageUrl: "https://picsum.photos/seed/jeans/600/600",
  },
  {
    name: "Настольная лампа LED",
    slug: "nastolnaya-lampa-led",
    price: 12990,
    oldPrice: 15990,
    stock: 30,
    sku: "HG-001",
    rating: 4.7,
    reviewsCount: 389,
    category: "Дом и сад",
    description: "Регулируемая яркость и температура света, сенсорное управление.",
    imageUrl: "https://picsum.photos/seed/lamp/600/600",
  },
  {
    name: "Набор кастрюль",
    slug: "nabor-kastryul",
    price: 45990,
    oldPrice: 59990,
    stock: 12,
    sku: "HG-002",
    rating: 4.8,
    reviewsCount: 156,
    category: "Дом и сад",
    description: "Нержавеющая сталь, 6 предметов, подходит для индукции.",
    imageUrl: "https://picsum.photos/seed/pots/600/600",
  },
  {
    name: "Коврик для йоги",
    slug: "kovrik-dlya-jogi",
    price: 8990,
    oldPrice: 11990,
    stock: 55,
    sku: "SP-001",
    rating: 4.6,
    reviewsCount: 921,
    category: "Спорт",
    description: "Нескользящее покрытие, толщина 6 мм, с ремешком для переноски.",
    imageUrl: "https://picsum.photos/seed/yoga/600/600",
  },
  {
    name: "Гантели разборные 20 кг",
    slug: "ganteli-razbornye-20kg",
    price: 39990,
    oldPrice: 49990,
    stock: 18,
    sku: "SP-002",
    rating: 4.9,
    reviewsCount: 233,
    category: "Спорт",
    description: "Комплект из двух гантелей с регулируемым весом.",
    imageUrl: "https://picsum.photos/seed/dumbbells/600/600",
  },
];

export async function seed() {
  const prisma = new PrismaClient();
  console.log("Seeding categories...");
  for (const c of categories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  const cats = await prisma.category.findMany();
  const catByName = Object.fromEntries(cats.map((c) => [c.name, c.id]));

  console.log("Seeding products...");
  for (const p of products) {
    const { category, ...rest } = p;
    const data = { ...rest, categoryId: catByName[category] ?? null };
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: data,
    });
  }

  console.log("Seed complete.");
  await prisma.$disconnect();
}

// Run automatically only when invoked directly (e.g. `node prisma/seed.mjs`).
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
