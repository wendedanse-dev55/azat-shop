import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, statusInfo } from "@/lib/order-status";
import { updateOrderStatus, deleteOrder } from "@/lib/actions";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const s = statusInfo(order.status);

  return (
    <div className="max-w-4xl space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/admin/orders" className="hover:text-brand">
          Заказы
        </Link>{" "}
        / <span className="text-ink">#{order.id.slice(-6).toUpperCase()}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">
          Заказ #{order.id.slice(-6).toUpperCase()}
        </h1>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${s.badge}`}>
          {s.label}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        {/* Items */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-gray-50 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium" colSpan={2}>Товар</th>
                  <th className="px-4 py-3 text-right font-medium">Цена</th>
                  <th className="px-4 py-3 text-right font-medium">Кол-во</th>
                  <th className="px-4 py-3 text-right font-medium">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b border-line last:border-0">
                    <td className="w-14 py-3 pl-4">
                      <div className="h-10 w-10 overflow-hidden rounded bg-gray-100">
                        {it.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {it.slug ? (
                        <Link
                          href={`/product/${it.slug}`}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {it.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{it.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {formatPrice(it.price)}
                    </td>
                    <td className="px-4 py-3 text-right">{it.qty}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatPrice(it.price * it.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-ink">
                    Итого
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-extrabold text-ink">
                    {formatPrice(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Customer + status */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-ink">Покупатель</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted">Имя</dt>
                <dd className="font-medium text-ink">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-muted">Телефон</dt>
                <dd className="font-medium text-ink">
                  <a href={`tel:${order.phone}`} className="hover:text-brand">
                    {order.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Дата</dt>
                <dd className="text-ink">{formatDate(order.createdAt)}</dd>
              </div>
              {order.comment && (
                <div>
                  <dt className="text-muted">Комментарий</dt>
                  <dd className="whitespace-pre-line text-ink">{order.comment}</dd>
                </div>
              )}
            </dl>
          </div>

          <form
            action={updateOrderStatus.bind(null, order.id)}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <h2 className="mb-3 text-sm font-bold text-ink">Статус заказа</h2>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="mt-3 h-10 w-full rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Обновить статус
            </button>
          </form>

          <form action={deleteOrder.bind(null, order.id)}>
            <button
              type="submit"
              className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-medium text-sale transition-colors hover:bg-sale-soft"
            >
              Удалить заказ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
