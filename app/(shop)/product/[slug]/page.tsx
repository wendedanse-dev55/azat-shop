import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Stars from "@/components/Stars";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductGallery from "@/components/ProductGallery";
import { formatCount } from "@/lib/format";
import { productImages } from "@/lib/images";
import { themeFor } from "@/components/intro/theme";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="space-y-5">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand">Главная</Link> /{" "}
        {product.category && (
          <>
            <Link href={`/category/${product.category.slug}`} className="hover:text-brand">
              {product.category.name}
            </Link>{" "}
            /{" "}
          </>
        )}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px]">
        {/* Gallery */}
        <ProductGallery
          images={productImages(product)}
          name={product.name}
          theme={themeFor(product)}
        />

        {/* Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold leading-tight text-ink">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Stars rating={product.rating} reviewsCount={product.reviewsCount} size="md" />
            {product.reviewsCount > 0 && (
              <span className="text-sm text-muted">
                {formatCount(product.reviewsCount)} отзывов
              </span>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="mb-1 text-sm font-semibold text-ink">Описание</h2>
              <p className="whitespace-pre-line leading-relaxed text-body">
                {product.description}
              </p>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-ink">Характеристики</h2>
            <dl className="overflow-hidden rounded-xl border border-line text-sm">
              <SpecRow label="Категория" value={product.category?.name ?? "—"} />
              <SpecRow label="Артикул" value={product.sku ?? "—"} />
              <SpecRow
                label="Наличие"
                value={product.stock > 0 ? `${product.stock} шт.` : "Нет в наличии"}
              />
            </dl>
          </div>
        </div>

        {/* Buy box */}
        <ProductBuyBox
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            oldPrice: product.oldPrice,
            imageUrl: product.imageUrl,
            stock: product.stock,
          }}
        />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line px-4 py-2.5 last:border-0 odd:bg-gray-50/50">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
