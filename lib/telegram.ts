// Sends a message to the configured Telegram chat(s) via the Bot API.
//
// Configured through env vars:
//   TELEGRAM_BOT_TOKEN  — token from @BotFather
//   TELEGRAM_CHAT_ID    — one or more chat ids (comma-separated)
//
// It never throws and no-ops when Telegram isn't configured, so order creation
// is never blocked or broken by notifications.
export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) return;

  await Promise.all(
    chatIds.map(async (chatId) => {
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
            "Telegram sendMessage failed:",
            res.status,
            await res.text().catch(() => ""),
          );
        }
      } catch (e) {
        console.error("Telegram sendMessage error:", e);
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
}

// Escape user-provided text for Telegram HTML parse_mode.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
