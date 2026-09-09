// Transliterate Cyrillic + build a URL-friendly slug. Pure function (no DB).

const translit: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
  // Kazakh-specific letters
  ә: "a", ғ: "g", қ: "q", ң: "ng", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

export function slugify(input: string): string {
  const lower = (input || "").toLowerCase().trim();
  let out = "";
  for (const ch of lower) {
    if (translit[ch] !== undefined) {
      out += translit[ch];
    } else if (/[a-z0-9]/.test(ch)) {
      out += ch;
    } else if (/[\s_\-.]/.test(ch)) {
      out += "-";
    }
    // everything else is dropped
  }
  out = out.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return out || "item";
}
