import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import PriceBlock from "./PriceBlock";
import Stars from "./Stars";
import ProductCardMedia from "./ProductCardMedia";
import { discountPercent } from "@/lib/format";
import { productImages } from "@/lib/images";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  images?: string[] | null;
  stock: number;
  rating: number;
  reviewsCount: number;
  category?: { name: string; slug: string } | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const disc = discountPercent(product.price, product.oldPrice);

  return (
    <div className="group flex flex-col rounded-2xl border border-line bg-white p-2.5 transition-shadow hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-gray-50"
      >
        {disc && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-sale px-1.5 py-0.5 text-xs font-bold text-white">
            −{disc}%
          </span>
        )}
        <ProductCardMedia images={productImages(product)} name={product.name} />
      </Link>

      <div className="flex flex-1 flex-col gap-2 pt-3">
        <PriceBlock price={product.price} oldPrice={product.oldPrice} size="sm" />

        <Stars rating={product.rating} reviewsCount={product.reviewsCount} />

        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm leading-snug text-body transition-colors hover:text-brand"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-1">
          {product.stock > 0 ? (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                slug: product.slug,
              }}
            />
          ) : (
            <div className="flex h-10 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-medium text-muted">
              Нет в наличии
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
