// A line icon chosen from the category name (keyword match). Falls back to a
// neutral grid icon. Inherits color and size from the parent (uses currentColor
// and a className for width/height).

export default function CategoryIcon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
  const n = name.toLowerCase();
  const svg = (children: React.ReactNode) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );

  // Air conditioner
  if (/(кондиц|сплит|климат|air.?condit)/.test(n)) {
    return svg(
      <>
        <rect x="3" y="5" width="18" height="7" rx="2" />
        <line x1="6" y1="8.7" x2="18" y2="8.7" />
        <path d="M7 15c0 1.6 1 2.2 2.2 2.2" />
        <path d="M11 15.5c0 1.6 1 2.2 2.2 2.2" />
        <path d="M15 15c0 1.6 1 2.2 2.2 2.2" />
      </>,
    );
  }
  // Refrigerator
  if (/(холодильн|морозил|fridge|refriger|freezer)/.test(n)) {
    return svg(
      <>
        <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <line x1="9" y1="5.5" x2="9" y2="7.5" />
        <line x1="9" y1="12.5" x2="9" y2="15" />
      </>,
    );
  }
  // Router / Wi-Fi
  if (/(роутер|модем|wi.?fi|router|сет|интернет|network)/.test(n)) {
    return svg(
      <>
        <path d="M4.5 11a10.5 10.5 0 0 1 15 0" />
        <path d="M7.5 14a6.3 6.3 0 0 1 9 0" />
        <path d="M10.3 16.8a2.4 2.4 0 0 1 3.4 0" />
        <circle cx="12" cy="19.3" r="0.5" fill="currentColor" />
      </>,
    );
  }
  // Washer / dishwasher
  if (/(стираль|посудомо|washer|washing|dishwash)/.test(n)) {
    return svg(
      <>
        <rect x="4.5" y="3" width="15" height="18" rx="2" />
        <circle cx="12" cy="13" r="4.3" />
        <circle cx="8" cy="6.5" r="0.6" fill="currentColor" />
        <line x1="11" y1="6.5" x2="16" y2="6.5" />
      </>,
    );
  }
  // TV / monitor
  if (/(телевизор|\btv\b|монитор|экран|display)/.test(n)) {
    return svg(
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <line x1="8.5" y1="20" x2="15.5" y2="20" />
        <line x1="12" y1="16" x2="12" y2="20" />
      </>,
    );
  }
  // Electronics / gadgets
  if (
    /(электрон|гаджет|смартфон|телефон|phone|ноутбук|laptop|компьютер|техник)/.test(
      n,
    )
  ) {
    return svg(
      <>
        <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
        <line x1="10" y1="3.5" x2="10" y2="6.5" />
        <line x1="14" y1="3.5" x2="14" y2="6.5" />
        <line x1="10" y1="17.5" x2="10" y2="20.5" />
        <line x1="14" y1="17.5" x2="14" y2="20.5" />
        <line x1="3.5" y1="10" x2="6.5" y2="10" />
        <line x1="3.5" y1="14" x2="6.5" y2="14" />
        <line x1="17.5" y1="10" x2="20.5" y2="10" />
        <line x1="17.5" y1="14" x2="20.5" y2="14" />
      </>,
    );
  }
  // Cold / snowflake
  if (/(мороз|снеж|cold|cool|freeze|лёд|лед)/.test(n)) {
    return svg(
      <>
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="3.77" y1="7.25" x2="20.23" y2="16.75" />
        <line x1="20.23" y1="7.25" x2="3.77" y2="16.75" />
        <path d="M9.5 4.5 12 6.5l2.5-2" />
        <path d="M9.5 19.5 12 17.5l2.5 2" />
      </>,
    );
  }

  // Default — grid of tiles
  return svg(
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>,
  );
}

// Cool, on-brand accent palette assigned to category tiles by index.
export const CATEGORY_COLORS = [
  { bg: "bg-sky-100", fg: "text-sky-600" },
  { bg: "bg-cyan-100", fg: "text-cyan-600" },
  { bg: "bg-teal-100", fg: "text-teal-600" },
  { bg: "bg-indigo-100", fg: "text-indigo-600" },
  { bg: "bg-blue-100", fg: "text-blue-600" },
  { bg: "bg-violet-100", fg: "text-violet-600" },
];
