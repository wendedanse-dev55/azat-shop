"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "./prisma";
import { uniqueProductSlug, uniqueCategorySlug } from "./unique-slug";
import { SESSION_COOKIE, expectedToken, isAuthenticated } from "./auth";
import { uploadsDir, uploadUrl } from "./uploads";
import { parseImageList } from "./images";

// ---------- helpers ----------

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(fd: FormData, key: string): number {
  const raw = str(fd, key).replace(",", ".");
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function int(fd: FormData, key: string): number {
  const n = parseInt(str(fd, key), 10);
  return Number.isFinite(n) ? n : 0;
}

// Guard mutating actions. Server actions can be invoked directly, so each one
// must verify the session itself (middleware only protects page routes).
async function assertAuth() {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}

async function saveImage(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || typeof file === "string") return null;
  const f = file as File;
  if (!f.size) return null;
  const bytes = Buffer.from(await f.arrayBuffer());
  const safeExt = (path.extname(f.name) || ".jpg").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;

  // Production (Vercel): serverless has no persistent disk, so store the file
  // in Blob object storage and keep its public URL. The token is present only
  // when a Blob store is linked to the project.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`products/${filename}`, bytes, {
      access: "public",
      contentType: f.type || undefined,
    });
    return blob.url;
  }

  // Local development: write to disk, served back by /api/uploads/[file].
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return uploadUrl(filename);
}

// ---------- auth ----------

export async function login(formData: FormData) {
  const password = str(formData, "password");
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expected) {
    redirect("/admin/login?error=1");
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- products ----------

export async function createProduct(formData: FormData) {
  await assertAuth();
  const name = str(formData, "name");
  if (!name) throw new Error("Название обязательно");

  const uploaded = await saveImage(formData.get("image"));
  // The image field accepts several links (comma/newline separated). An
  // uploaded file, if any, becomes the primary image.
  const urlList = parseImageList(str(formData, "imageUrl"));
  const images = uploaded ? [uploaded, ...urlList] : urlList;
  const imageUrl = images[0] ?? null;
  const categoryId = str(formData, "categoryId") || null;
  const sku = str(formData, "sku") || null;
  const oldPriceVal = num(formData, "oldPrice");
  const supplier = str(formData, "supplier") || null;
  const supplierPhone = str(formData, "supplierPhone") || null;

  await prisma.product.create({
    data: {
      name,
      slug: await uniqueProductSlug(name),
      description: str(formData, "description") || null,
      price: num(formData, "price"),
      oldPrice: oldPriceVal > 0 ? oldPriceVal : null,
      stock: int(formData, "stock"),
      sku,
      imageUrl,
      images,
      supplier,
      supplierPhone,
      rating: Math.min(5, Math.max(0, num(formData, "rating"))),
      reviewsCount: int(formData, "reviewsCount"),
      categoryId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  await assertAuth();
  const name = str(formData, "name");
  if (!name) throw new Error("Название обязательно");

  const uploaded = await saveImage(formData.get("image"));
  // The links textarea holds the full gallery; an uploaded file is prepended
  // as the new primary image.
  const urlList = parseImageList(str(formData, "imageUrl"));
  const images = uploaded ? [uploaded, ...urlList] : urlList;
  const imageUrl = images[0] ?? null;
  const categoryId = str(formData, "categoryId") || null;
  const sku = str(formData, "sku") || null;
  const oldPriceVal = num(formData, "oldPrice");
  const supplier = str(formData, "supplier") || null;
  const supplierPhone = str(formData, "supplierPhone") || null;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug: await uniqueProductSlug(name, id),
      description: str(formData, "description") || null,
      price: num(formData, "price"),
      oldPrice: oldPriceVal > 0 ? oldPriceVal : null,
      stock: int(formData, "stock"),
      sku,
      imageUrl,
      images,
      supplier,
      supplierPhone,
      rating: Math.min(5, Math.max(0, num(formData, "rating"))),
      reviewsCount: int(formData, "reviewsCount"),
      categoryId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await assertAuth();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
}

// ---------- banners ----------

async function bannerDataFromForm(formData: FormData) {
  const title = str(formData, "title");
  if (!title) throw new Error("Заголовок обязателен");
  const uploaded = await saveImage(formData.get("image"));
  const imageUrl = uploaded || str(formData, "imageUrl") || null;
  return {
    title,
    description: str(formData, "description") || null,
    tag: str(formData, "tag") || null,
    imageUrl,
    ctaLabel: str(formData, "ctaLabel") || null,
    ctaHref: str(formData, "ctaHref") || null,
    sortOrder: int(formData, "sortOrder"),
    active: formData.get("active") != null,
  };
}

export async function createBanner(formData: FormData) {
  await assertAuth();
  await prisma.banner.create({ data: await bannerDataFromForm(formData) });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function updateBanner(id: string, formData: FormData) {
  await assertAuth();
  await prisma.banner.update({
    where: { id },
    data: await bannerDataFromForm(formData),
  });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  redirect("/admin/banners");
}

export async function deleteBanner(id: string) {
  await assertAuth();
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

// ---------- categories ----------

export async function createCategory(formData: FormData) {
  await assertAuth();
  const name = str(formData, "name");
  if (!name) throw new Error("Название обязательно");

  const existing = await prisma.category.findUnique({ where: { name } });
  if (!existing) {
    await prisma.category.create({
      data: { name, slug: await uniqueCategorySlug(name) },
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await assertAuth();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// ---------- orders ----------

interface CreateOrderInput {
  name: string;
  phone: string;
  comment?: string;
  items: { id: string; qty: number }[];
}

type CreateOrderResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

// Public action — customers place orders. Prices are re-read from the DB so
// the client cannot tamper with them.
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const name = (input?.name ?? "").trim();
  const phone = (input?.phone ?? "").trim();
  const comment = (input?.comment ?? "").trim();

  if (name.length < 2) return { ok: false, error: "Укажите имя" };
  if (phone.replace(/\D/g, "").length < 10)
    return { ok: false, error: "Укажите корректный номер телефона" };

  const items = (input?.items ?? []).filter(
    (i) => i && typeof i.id === "string" && i.qty > 0,
  );
  if (items.length === 0) return { ok: false, error: "Корзина пуста" };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.id) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems: {
    productId: string;
    slug: string;
    name: string;
    price: number;
    qty: number;
    imageUrl: string | null;
    supplier: string | null;
    supplierPhone: string | null;
  }[] = [];
  let total = 0;

  for (const it of items) {
    const p = byId.get(it.id);
    if (!p) continue;
    const qty = Math.min(99, Math.max(1, Math.floor(it.qty)));
    total += p.price * qty;
    orderItems.push({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      qty,
      imageUrl: p.imageUrl,
      supplier: p.supplier,
      supplierPhone: p.supplierPhone,
    });
  }

  if (orderItems.length === 0)
    return { ok: false, error: "Товары недоступны" };

  const order = await prisma.order.create({
    data: {
      customerName: name,
      phone,
      comment: comment || null,
      total,
      status: "new",
      items: { create: orderItems },
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true, id: order.id };
}

export async function updateOrderStatus(id: string, formData: FormData) {
  await assertAuth();
  const status = str(formData, "status") || "new";
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function deleteOrder(id: string) {
  await assertAuth();
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}
