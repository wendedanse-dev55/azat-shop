import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { statusInfo } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const [productCount, categoryCount, orderCount, revenueAgg, recentOrders] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "canceled" } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { _count: { select: { items: true } } },
      }),
    ]);

  const cards = [
    { label: "Заказов", value: orderCount, href: "/admin/orders" },
    {
      label: "Сумма заказов",
      value: formatPrice(revenueAgg._sum.total ?? 0),
      href: "/admin/orders",
    },
    { label: "Товаров", value: productCount, href: "/admin/products" },
    { label: "Категорий", value: categoryCount, href: "/admin/categories" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Дашборд</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            + Новый товар
          </Link>
          <Link
            href="/admin/import"
            className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-body hover:bg-gray-50"
          >
            Импорт Excel
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="text-sm text-muted">{c.label}</div>
            <div className="mt-2 text-2xl font-extrabold text-ink">{c.value}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-muted">Заказов пока нет.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recentOrders.map((o) => {
                  const s = statusInfo(o.status);
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-line last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-xs font-semibold text-ink hover:text-brand"
                        >
                          #{o.id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 font-medium text-ink">{o.customerName}</td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">{o.phone}</td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.badge}`}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
