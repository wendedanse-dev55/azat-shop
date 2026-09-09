import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-extrabold tracking-tight text-ink">
              <span className="text-brand">Azat</span>Shop
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Демо интернет-магазина на Next.js: каталог с категориями, поиск,
              корзина и импорт товаров из Excel.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Покупателям</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/catalog" className="hover:text-brand">Каталог</Link></li>
              <li><Link href="/search" className="hover:text-brand">Поиск</Link></li>
              <li><Link href="/cart" className="hover:text-brand">Корзина</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Магазин</p>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/admin" className="hover:text-brand">Админ-панель</Link></li>
              <li><Link href="/admin/import" className="hover:text-brand">Импорт из Excel</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-ink">Контакты</p>
            <ul className="space-y-2 text-sm text-muted">
              <li>Пн–Вс, 9:00–21:00</li>
              <li>support@azatshop.demo</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} Azat Shop. Демо-проект.
        </div>
      </div>
    </footer>
  );
}
