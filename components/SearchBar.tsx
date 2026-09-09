"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={`flex h-11 items-stretch overflow-hidden rounded-xl bg-white ring-1 ring-line transition-shadow focus-within:ring-2 focus-within:ring-brand ${className}`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Искать товары"
        aria-label="Поиск товаров"
        className="min-w-0 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-muted"
      />
      <button
        type="submit"
        className="m-1 flex items-center gap-1.5 rounded-lg bg-brand px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:px-4"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="hidden sm:inline">Найти</span>
      </button>
    </form>
  );
}
