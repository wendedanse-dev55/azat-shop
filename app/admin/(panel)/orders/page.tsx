import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { statusInfo } from "@/lib/order-status";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Заказы ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-muted">
          Заказов пока нет. Они появятся здесь после оформления в магазине.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-gray-50 text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 text-right font-medium">Товаров</th>
                <th className="px-4 py-3 text-right font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = statusInfo(o.status);
                return (
                  <tr
                    key={o.id}
                    className="border-b border-line last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink">
                      #{o.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {o.customerName}
                    </td>
                    <td className="px-4 py-3 text-ink">{o.phone}</td>
                    <td className="px-4 py-3 text-right">{o._count.items}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.badge}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="rounded-md border border-line px-3 py-1 text-xs text-ink hover:border-brand hover:text-brand"
                      >
                        Открыть
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
