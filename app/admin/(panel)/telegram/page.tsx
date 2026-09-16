import { prisma } from "@/lib/prisma";
import { deleteTelegramSubscriber } from "@/lib/actions";

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

export default async function AdminTelegramPage() {
  const subs = await prisma.telegramSubscriber.findMany({
    orderBy: { createdAt: "asc" },
  });
  const configured = Boolean(process.env.TELEGRAM_BOT_TOKEN);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Уведомления в Telegram ({subs.length})</h1>

      <div
        className={`rounded-xl border p-4 text-sm ${
          configured
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {configured
          ? "Бот подключён. Все, кто напишет боту /start, автоматически получают уведомления о новых заказах."
          : "Бот не настроен: задайте переменную окружения TELEGRAM_BOT_TOKEN (токен от @BotFather)."}
      </div>

      <p className="text-sm text-gray-600">
        Чтобы добавить получателя — попросите его открыть вашего бота в Telegram и
        отправить <b>/start</b>. Отписаться можно командой <b>/stop</b>. Здесь
        подписчиков можно удалить вручную.
      </p>

      {subs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          Пока никто не подписан. Отправьте боту <b>/start</b>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Chat ID</th>
                <th className="px-4 py-3 font-medium">Подписан</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{s.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.username ? `@${s.username}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {s.chatId}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <form action={deleteTelegramSubscriber.bind(null, s.id)}>
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
