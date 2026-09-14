import { SITE_PHONE, SITE_WHATSAPP } from "@/lib/site";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
  "aria-hidden": true,
};

const SERVICES = [
  {
    title: "Установка кондиционеров",
    desc: "Монтаж и заправка сплит-систем с гарантией.",
    bg: "bg-sky-100",
    fg: "text-sky-600",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="5" width="18" height="7" rx="2" />
        <line x1="6" y1="8.7" x2="18" y2="8.7" />
        <path d="M7 15c0 1.6 1 2.2 2.2 2.2" />
        <path d="M11 15.5c0 1.6 1 2.2 2.2 2.2" />
        <path d="M15 15c0 1.6 1 2.2 2.2 2.2" />
      </svg>
    ),
  },
  {
    title: "Установка и настройка роутеров",
    desc: "Интернет, Wi-Fi и стабильное покрытие в помещении.",
    bg: "bg-cyan-100",
    fg: "text-cyan-600",
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 11a10.5 10.5 0 0 1 15 0" />
        <path d="M7.5 14a6.3 6.3 0 0 1 9 0" />
        <path d="M10.3 16.8a2.4 2.4 0 0 1 3.4 0" />
        <circle cx="12" cy="19.3" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Видеонаблюдение",
    desc: "Подбор, монтаж и настройка камер.",
    bg: "bg-indigo-100",
    fg: "text-indigo-600",
    icon: (
      <svg {...iconProps}>
        <path d="M3 8.5 15.5 5l1 3.6L4 12z" />
        <path d="m14.8 6.8 4.2-1.6 1.4 3.7-4.2 1.6" />
        <line x1="6" y1="11.3" x2="7.6" y2="17" />
        <line x1="10" y1="10.2" x2="11.6" y2="16" />
        <circle cx="9" cy="20" r="1.4" />
      </svg>
    ),
  },
  {
    title: "Расчёт и смета",
    desc: "Обсудим задачу и составим смету — бесплатно.",
    bg: "bg-teal-100",
    fg: "text-teal-600",
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="2.5" width="14" height="19" rx="2" />
        <line x1="8" y1="6.5" x2="16" y2="6.5" />
        <line x1="8" y1="10.5" x2="10" y2="10.5" />
        <line x1="13" y1="10.5" x2="16" y2="10.5" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="13" y1="14" x2="16" y2="14" />
        <line x1="8" y1="17.5" x2="10" y2="17.5" />
        <line x1="13" y1="17.5" x2="16" y2="17.5" />
      </svg>
    ),
  },
];

export default function ServicesSection() {
  const wa = `https://wa.me/${SITE_WHATSAPP}?text=${encodeURIComponent(
    "Здравствуйте! Хочу обсудить проект и смету.",
  )}`;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Услуги</h2>
        <span className="text-sm text-muted">Не только продаём — устанавливаем</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <div
            key={s.title}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-lg hover:shadow-black/5"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg} ${s.fg} transition-transform duration-200 group-hover:scale-110`}
            >
              {s.icon}
            </span>
            <div>
              <div className="font-semibold text-ink">{s.title}</div>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 flex flex-col items-start gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="text-lg font-bold">Не знаете, что подойдёт?</div>
          <p className="mt-1 text-sm text-white/85">
            Обсудим проект, подберём оборудование и составим смету.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            Написать в WhatsApp
          </a>
          <a
            href={`tel:${SITE_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Позвонить
          </a>
        </div>
      </div>
    </section>
  );
}
