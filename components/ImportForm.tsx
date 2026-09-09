"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

interface ImportResult {
  created: number;
  updated: number;
  skippedErrors: number;
  errors: string[];
}

export default function ImportForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File | null;
    if (!file || !file.size) {
      setError("Выберите файл Excel");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Ошибка импорта");
      } else {
        setResult(json);
        form.reset();
        router.refresh();
      }
    } catch {
      setError("Ошибка сети при загрузке файла");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
      >
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          className="block w-full text-sm text-body file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:text-white hover:file:bg-brand-hover"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {loading ? "Загрузка…" : "Импортировать"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <p className="font-medium">Импорт завершён</p>
          <ul className="mt-1 list-inside list-disc">
            <li>Создано товаров: {result.created}</li>
            <li>Обновлено товаров: {result.updated}</li>
            {result.skippedErrors > 0 && (
              <li className="text-amber-700">
                Ошибок в строках: {result.skippedErrors}
              </li>
            )}
          </ul>
          {result.errors?.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-amber-700">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
