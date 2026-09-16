import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramTo, webhookSecretFromToken } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Health check (no secrets exposed).
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
}

// Telegram calls this on every update. On /start we subscribe the chat, on
// /stop we unsubscribe. Everyone subscribed gets order notifications.
export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: true });

  // Reject spoofed requests: Telegram echoes our secret in this header.
  const secret = webhookSecretFromToken(token);
  if (req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg =
    (update as { message?: unknown; edited_message?: unknown })?.message ??
    (update as { edited_message?: unknown })?.edited_message;
  const chat = (msg as { chat?: { id?: number | string } })?.chat;

  if (chat?.id != null) {
    const chatId = String(chat.id);
    const c = chat as {
      first_name?: string;
      last_name?: string;
      title?: string;
      username?: string;
    };
    const text = String((msg as { text?: string })?.text ?? "").trim();
    const name =
      [c.first_name, c.last_name].filter(Boolean).join(" ") || c.title || null;
    const username = c.username || null;

    try {
      if (text === "/stop") {
        await prisma.telegramSubscriber.deleteMany({ where: { chatId } });
        await sendTelegramTo(
          chatId,
          "Вы отписались от уведомлений о заказах. Отправьте /start, чтобы снова подписаться.",
        );
      } else {
        await prisma.telegramSubscriber.upsert({
          where: { chatId },
          update: { name, username },
          create: { chatId, name, username },
        });
        if (text === "/start") {
          await sendTelegramTo(
            chatId,
            "✅ Готово! Вы будете получать уведомления о новых заказах Salqyn Store.\n\nОтправьте /stop, чтобы отписаться.",
          );
        }
      }
    } catch (e) {
      console.error("Telegram webhook error:", e);
    }
  }

  // Always 200 so Telegram doesn't retry endlessly.
  return NextResponse.json({ ok: true });
}
