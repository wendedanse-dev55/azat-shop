"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  const items = [
    {
      href: "/",
      label: "Главная",
      active: pathname === "/",
      icon: (
        <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
      ),
    },
    {
      href: "/catalog",
      label: "Каталог",
      active: pathname.startsWith("/catalog") || pathname.startsWith("/category"),
      icon: (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ),
    },
    {
      href: "/cart",
      label: "Корзина",
      active: pathname.startsWith("/cart"),
      badge: count,
      icon: (
        <>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2.5 3h2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
        </>
      ),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white md:hidden">
      <div className="grid grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${
              it.active ? "text-brand" : "text-muted"
            }`}
          >
            <span className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {it.icon}
              </svg>
              {typeof it.badge === "number" && it.badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-white">
                  {it.badge}
                </span>
              )}
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
