"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions";

const links = [
  { href: "/admin", label: "Дашборд", exact: true },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/import", label: "Импорт Excel" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="flex w-56 shrink-0 flex-col bg-gray-900 p-4 text-gray-100">
      <div className="mb-8 px-2 text-lg font-extrabold tracking-tight">
        <span className="text-brand">Azat</span> Admin
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 transition-colors ${
              isActive(l.href, l.exact)
                ? "bg-brand text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-gray-800 pt-4 text-sm">
        <Link
          href="/"
          className="rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          ← В магазин
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-red-300 hover:bg-gray-800 hover:text-red-200"
          >
            Выйти
          </button>
        </form>
      </div>
    </aside>
  );
}
