export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "done"
  | "canceled";

export const ORDER_STATUSES: {
  key: OrderStatus;
  label: string;
  badge: string;
}[] = [
  { key: "new", label: "Новый", badge: "bg-brand-soft text-brand" },
  { key: "processing", label: "В обработке", badge: "bg-amber-100 text-amber-700" },
  { key: "shipped", label: "Отправлен", badge: "bg-blue-100 text-blue-700" },
  { key: "done", label: "Выполнен", badge: "bg-green-100 text-green-700" },
  { key: "canceled", label: "Отменён", badge: "bg-sale-soft text-sale" },
];

export function statusInfo(key: string) {
  return (
    ORDER_STATUSES.find((s) => s.key === key) ?? {
      key,
      label: key,
      badge: "bg-gray-100 text-gray-600",
    }
  );
}
