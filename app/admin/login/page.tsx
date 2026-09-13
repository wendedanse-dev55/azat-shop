import Link from "next/link";
import { login } from "@/lib/actions";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-white p-8 shadow-sm"
      >
        <Link href="/" className="flex justify-center">
          <Logo size={40} />
        </Link>
        <h1 className="text-center text-lg font-bold text-ink">Вход в админ-панель</h1>

        {error && (
          <p className="rounded-lg bg-sale-soft px-3 py-2 text-sm text-sale">
            Неверный пароль
          </p>
        )}

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
            Пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Войти
        </button>

        <p className="text-center text-xs text-muted">
          Пароль по умолчанию: <code className="font-mono">admin123</code>
        </p>
      </form>
    </div>
  );
}
