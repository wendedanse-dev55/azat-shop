// Salqyn Store logo. "Salqyn" (салқын) means "cool / cold" in Kazakh.
// The mark is an ice-crystal hexagon (snow crystals are hexagonal) holding a
// snowflake — the universal cooling symbol on fridges and ACs. Colors are
// self-contained so the mark reads correctly on any background.

const SPOKES = [0, 60, 120, 180, 240, 300];
const HEX_OUTER = "42,24 33,39.59 15,39.59 6,24 15,8.41 33,8.41";
const HEX_INNER = "37,24 30.5,35.26 17.5,35.26 11,24 17.5,12.74 30.5,12.74";

export function LogoMark({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Salqyn Store"
    >
      <defs>
        <linearGradient
          id="salqynIce"
          x1="6"
          y1="8"
          x2="42"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#38BDF8" />
          <stop offset="0.5" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
      </defs>

      {/* Ice-crystal hexagon (thick round-joined stroke = soft corners) */}
      <polygon
        points={HEX_OUTER}
        fill="url(#salqynIce)"
        stroke="url(#salqynIce)"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      {/* Inner facet highlight */}
      <polygon
        points={HEX_INNER}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Snowflake */}
      <g
        transform="translate(24 24)"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        {SPOKES.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <line x1="0" y1="0" x2="0" y2="-14" />
            <line x1="0" y1="-6.5" x2="3.98" y2="-8.8" />
            <line x1="0" y1="-6.5" x2="-3.98" y2="-8.8" />
            <line x1="0" y1="-10" x2="2.94" y2="-11.7" />
            <line x1="0" y1="-10" x2="-2.94" y2="-11.7" />
          </g>
        ))}
      </g>
      <circle cx="24" cy="24" r="2.2" fill="#fff" />
    </svg>
  );
}

export default function Logo({
  size = 38,
  withText = true,
  tagline = false,
  className = "",
}: {
  size?: number;
  withText?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-[#0b1b2b]">Salqyn</span>
            <span className="ml-1 text-[#0284c7]">Store</span>
          </span>
          {tagline && (
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">
              холодильники · кондиционеры
            </span>
          )}
        </span>
      )}
    </span>
  );
}
