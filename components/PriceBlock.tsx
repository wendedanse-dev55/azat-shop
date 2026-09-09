import { formatPrice, discountPercent } from "@/lib/format";

interface Props {
  price: number;
  oldPrice?: number | null;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

export default function PriceBlock({ price, oldPrice, size = "md" }: Props) {
  const disc = discountPercent(price, oldPrice);
  const hasOld = oldPrice != null && oldPrice > price;

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className={`font-extrabold leading-none text-ink ${sizeMap[size]}`}>
          {formatPrice(price)}
        </span>
        {disc && (
          <span className="rounded-md bg-sale-soft px-1.5 py-0.5 text-xs font-bold text-sale">
            −{disc}%
          </span>
        )}
      </div>
      {hasOld && (
        <span className="text-sm text-muted line-through">
          {formatPrice(oldPrice!)}
        </span>
      )}
    </div>
  );
}
