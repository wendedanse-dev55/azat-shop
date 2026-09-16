import crypto from "crypto";
import { prisma } from "./prisma";

// Low-level: send one HTML message to one chat. Never throws.
async function sendToChat(
  token: string,
  chatId: string,
  text: string,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      console.error(
        "Telegram send failed:",
        res.status,
        await res.text().catch(() => ""),
      );
    }
  } catch (e) {
    console.error("Telegram send error:", e);
  } finally {
    clearTimeout(timeout);
  }
}

// Send to a single chat (used by the webhook for welcome/goodbye replies).
export async function sendTelegramTo(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await sendToChat(token, chatId, text);
}

// Notify everyone: env TELEGRAM_CHAT_ID(s) + all /start subscribers (deduped).
// No-op (and never throws) when Telegram isn't configured.
export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const envIds = (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let subIds: string[] = [];
  try {
    const subs = await prisma.telegramSubscriber.findMany({
      select: { chatId: true },
    });
    subIds = subs.map((s) => s.chatId);
  } catch (e) {
    console.error("Failed to load telegram subscribers:", e);
  }

  const chatIds = Array.from(new Set([...envIds, ...subIds]));
  if (chatIds.length === 0) return;

  await Promise.all(chatIds.map((id) => sendToChat(token, id, text)));
}

// Secret token for the webhook, derived from the bot token so no extra env var
// is needed. Telegram sends it back in the X-Telegram-Bot-Api-Secret-Token
// header, letting us reject spoofed requests.
export function webhookSecretFromToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Escape user-provided text for Telegram HTML parse_mode.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
