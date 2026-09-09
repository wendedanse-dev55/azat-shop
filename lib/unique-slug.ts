import { prisma } from "./prisma";
import { slugify } from "./slug";

// Generate a slug that is unique in the product table.
export async function uniqueProductSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let i = 1;
  // Loop until we find a free slug (or the same row we are editing).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
}

// Generate a slug that is unique in the category table.
export async function uniqueCategorySlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
}
