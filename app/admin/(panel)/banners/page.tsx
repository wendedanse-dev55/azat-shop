import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteBanner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Баннеры ({banners.length})</h1>
        <Link
          href="/admin/banners/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          + Новый баннер
        </Link>
      </div>

      <p className="text-sm text-muted">
        Баннеры показываются слайдером на главной. Если ни одного активного
        баннера нет — на главной автоматически показываются промо-слайды по
        товарам.
      </p>

      {banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Баннеров пока нет.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Фото</th>
                <th className="px-4 py-3 font-medium">Заголовок</th>
                <th className="px-4 py-3 font-medium">Тег</th>
                <th className="px-4 py-3 text-right font-medium">Порядок</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="h-10 w-16 overflow-hidden rounded bg-gray-100">
                      {b.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{b.title}</td>
                  <td className="px-4 py-3 text-gray-500">{b.tag ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{b.sortOrder}</td>
                  <td className="px-4 py-3">
                    {b.active ? (
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">
                        Активен
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        Скрыт
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/banners/${b.id}/edit`}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
                      >
                        Изменить
                      </Link>
                      <form action={deleteBanner.bind(null, b.id)}>
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
