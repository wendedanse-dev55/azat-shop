import { prisma } from "@/lib/prisma";
import { createCategory, deleteCategory } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Категории ({categories.length})</h1>

      <form
        action={createCategory}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Новая категория
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Например: Электроника"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Добавить
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Категорий пока нет.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Ссылка</th>
                <th className="px-4 py-3 text-right font-medium">Товаров</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    /category/{c.slug}
                  </td>
                  <td className="px-4 py-3 text-right">{c._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <form
                      action={deleteCategory.bind(null, c.id)}
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-gray-500">
        При удалении категории товары не удаляются — они остаются без категории.
      </p>
    </div>
  );
}
