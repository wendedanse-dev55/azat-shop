import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { uniqueProductSlug, uniqueCategorySlug } from "@/lib/unique-slug";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

// Map normalized (lowercased) header names -> internal field names.
const HEADER_MAP: Record<string, string> = {
  название: "name",
  наименование: "name",
  товар: "name",
  name: "name",
  title: "name",

  цена: "price",
  стоимость: "price",
  price: "price",

  "старая цена": "oldPrice",
  "цена до скидки": "oldPrice",
  "цена до": "oldPrice",
  oldprice: "oldPrice",
  "old price": "oldPrice",

  рейтинг: "rating",
  оценка: "rating",
  rating: "rating",

  отзывы: "reviewsCount",
  "кол-во отзывов": "reviewsCount",
  reviews: "reviewsCount",

  категория: "category",
  раздел: "category",
  category: "category",

  описание: "description",
  description: "description",

  остаток: "stock",
  количество: "stock",
  "кол-во": "stock",
  stock: "stock",
  qty: "stock",

  артикул: "sku",
  код: "sku",
  sku: "sku",

  изображение: "imageUrl",
  картинка: "imageUrl",
  фото: "imageUrl",
  image: "imageUrl",
  imageurl: "imageUrl",
  "image url": "imageUrl",
};

function normalizeHeader(h: string): string {
  return String(h ?? "").trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать форму" },
      { status: 400 },
    );
  }

  if (!file || !file.size) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const wb = new ExcelJS.Workbook();
  try {
    // Cast to the exact declared parameter type: exceljs's Buffer typings lag
    // behind the generic Buffer<ArrayBuffer> in recent @types/node.
    await wb.xlsx.load(buffer as unknown as Parameters<typeof wb.xlsx.load>[0]);
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать файл. Нужен формат .xlsx" },
      { status: 400 },
    );
  }

  const ws = wb.worksheets[0];
  if (!ws || ws.rowCount < 2) {
    return NextResponse.json(
      { error: "Файл пустой или нет строк с данными" },
      { status: 400 },
    );
  }

  // Build column index -> field map from the header row.
  const colToField: Record<number, string> = {};
  ws.getRow(1).eachCell((cell, col) => {
    const field = HEADER_MAP[normalizeHeader(cell.text)];
    if (field) colToField[col] = field;
  });

  if (!Object.values(colToField).includes("name")) {
    return NextResponse.json(
      { error: 'Не найдена колонка "Название"' },
      { status: 400 },
    );
  }

  const categoryCache = new Map<string, string>();
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const data: Record<string, string> = {};
    for (const [colStr, field] of Object.entries(colToField)) {
      const cell = row.getCell(Number(colStr));
      data[field] = cell?.text != null ? String(cell.text).trim() : "";
    }

    const name = data.name?.trim();
    if (!name) continue; // skip blank rows

    try {
      const price = parseFloat((data.price || "0").replace(",", ".")) || 0;
      const oldPriceNum =
        parseFloat((data.oldPrice || "0").replace(",", ".")) || 0;
      const oldPrice = oldPriceNum > 0 ? oldPriceNum : null;
      const stock = parseInt(data.stock || "0", 10) || 0;
      const description = data.description?.trim() || null;
      const sku = data.sku?.trim() || null;
      const imageUrl = data.imageUrl?.trim() || null;
      const rating = Math.min(
        5,
        Math.max(0, parseFloat((data.rating || "0").replace(",", ".")) || 0),
      );
      const reviewsCount = parseInt(data.reviewsCount || "0", 10) || 0;

      // Resolve / create the category.
      let categoryId: string | null = null;
      const catName = data.category?.trim();
      if (catName) {
        const key = catName.toLowerCase();
        if (categoryCache.has(key)) {
          categoryId = categoryCache.get(key)!;
        } else {
          const cat = await prisma.category.upsert({
            where: { name: catName },
            update: {},
            create: { name: catName, slug: await uniqueCategorySlug(catName) },
          });
          categoryCache.set(key, cat.id);
          categoryId = cat.id;
        }
      }

      // Upsert by SKU when provided, otherwise always create.
      const existing = sku
        ? await prisma.product.findUnique({ where: { sku } })
        : null;

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name,
            price,
            oldPrice,
            stock,
            description,
            imageUrl,
            rating,
            reviewsCount,
            categoryId,
          },
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            name,
            slug: await uniqueProductSlug(name),
            price,
            oldPrice,
            stock,
            description,
            sku,
            imageUrl,
            rating,
            reviewsCount,
            categoryId,
          },
        });
        created++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "неизвестная ошибка";
      errors.push(`Строка ${r}: ${msg}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/products");

  return NextResponse.json({
    created,
    updated,
    skippedErrors: errors.length,
    errors: errors.slice(0, 20),
  });
}
