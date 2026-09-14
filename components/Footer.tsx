import Link from "next/link";
import Logo from "./Logo";
import { SITE_PHONE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo size={34} />
            <p className="mt-3 max-w-xs text-sm text-muted">
              Холодильники, кондиционеры и бытовая техника — с быстрой доставкой
              и гарантией качества.
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
              <li>
                <a href={`tel:${SITE_PHONE.replace(/\s/g, "")}`} className="hover:text-brand">
                  {SITE_PHONE}
                </a>
              </li>
              <li>Пн–Вс, 9:00–21:00</li>
              <li>support@salqyn.store</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-6 text-sm text-muted">
          © {new Date().getFullYear()} Salqyn Store. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
