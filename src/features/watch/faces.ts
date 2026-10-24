import type { WatchStyle } from "$stores/settings.svelte";

/**
 * Watch faces as SVG markup, all drawn in a 110 × 200 box. Analog hands turn about (55, 100).
 * The live face marks its moving parts with data-part="…" so Watch.svelte can update them each frame;
 * the small previews in the picker (`mini`) leave them out.
 *
 * Parts: hH hM hS (hands), dT dS dD (digital), sT sD sR sRing (smart).
 */
export const WATCHES: readonly { id: WatchStyle; name: string }[] = [
  { id: "classic", name: "Wrist" },
  { id: "pocket", name: "Pocket" },
  { id: "digital", name: "Digital" },
  { id: "smart", name: "Smart" },
];

/** Circumference of the smart watch's progress ring. */
export const RING = 2 * Math.PI * 27;

export function watchSVG(style: WatchStyle, mini = false): string {
  const part = (n: string) => (mini ? "" : ` data-part="${n}"`);
  const u = mini ? "m" : "w"; // keeps gradient ids unique between the live face and previews
  const ticks = (r1: number, r2: number, w: number, col: string) =>
    Array.from(
      { length: 12 },
      (_, i) =>
        `<line x1="55" y1="${100 - r1}" x2="55" y2="${100 - r2 - (i % 3 ? 0 : 3)}" stroke="${col}" stroke-width="${i % 3 ? w : w * 1.6}" stroke-linecap="round" transform="rotate(${i * 30} 55 100)"/>`,
    ).join("");
  const hands = (col: string, sec: string, len = 1) => `
    <line${part("hH")} x1="55" y1="104" x2="55" y2="${100 - 17 * len}" stroke="${col}" stroke-width="3.6" stroke-linecap="round"/>
    <line${part("hM")} x1="55" y1="105" x2="55" y2="${100 - 25 * len}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>
    <line${part("hS")} x1="55" y1="108" x2="55" y2="${100 - 27 * len}" stroke="${sec}" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="55" cy="100" r="2.8" fill="${col}"/><circle cx="55" cy="100" r="1.1" fill="${sec}"/>`;

  if (style === "pocket")
    return `<svg viewBox="0 0 110 200" aria-hidden="true"><defs>
      <radialGradient id="${u}pg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f7dc95"/><stop offset=".55" stop-color="#d1a24a"/><stop offset="1" stop-color="#8a6420"/></radialGradient>
      <radialGradient id="${u}pd" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efe2c4"/></radialGradient></defs>
    <path d="M55 46 C 40 30 18 30 8 52 S 4 120 -6 150" fill="none" stroke="#c99a45" stroke-width="3" stroke-dasharray="5 3" stroke-linecap="round"/>
    <circle cx="55" cy="44" r="8" fill="none" stroke="url(#${u}pg)" stroke-width="4"/>
    <rect x="49" y="50" width="12" height="10" rx="3" fill="url(#${u}pg)"/>
    <circle cx="55" cy="100" r="42" fill="url(#${u}pg)"/>
    <circle cx="55" cy="100" r="37" fill="none" stroke="#a87b2c" stroke-width="1" stroke-dasharray="1.5 2.2"/>
    <circle cx="55" cy="100" r="33" fill="url(#${u}pd)"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const a = ((i * 30 - 90) * Math.PI) / 180,
        R = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"][i];
      return `<text x="${(55 + Math.cos(a) * 26).toFixed(1)}" y="${(100 + Math.sin(a) * 26 + 2.4).toFixed(1)}" font-size="${i % 3 ? 5.4 : 7}" font-family="Georgia,serif" font-weight="700" text-anchor="middle" fill="#3b2a12">${R}</text>`;
    }).join("")}
    <circle cx="55" cy="114" r="6" fill="none" stroke="#c9b48a" stroke-width=".8"/>
    ${hands("#2a1d0c", "#b0342a", 0.85)}</svg>`;

  if (style === "digital")
    return `<svg viewBox="0 0 110 200" aria-hidden="true"><defs>
      <linearGradient id="${u}dc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset=".5" stop-color="#aab2ba"/><stop offset="1" stop-color="#6d757d"/></linearGradient></defs>
    <rect x="33" y="0" width="44" height="200" rx="8" fill="#232323"/>
    ${[18, 30, 42, 158, 170, 182].map((y) => `<rect x="44" y="${y}" width="22" height="3" rx="1.5" fill="#111"/>`).join("")}
    <rect x="17" y="62" width="76" height="76" rx="14" fill="#1b1b1b"/>
    <rect x="21" y="66" width="68" height="68" rx="11" fill="url(#${u}dc)"/>
    <text x="55" y="77" font-size="6" font-family="Outfit,Arial,sans-serif" font-weight="800" text-anchor="middle" fill="#2c3238" letter-spacing=".8">PAPER · BOOK</text>
    <rect x="27" y="82" width="56" height="38" rx="5" fill="#b8c3a2" stroke="#59604f" stroke-width="1.2"/>
    <text x="55" y="107" font-size="17" font-family="'Courier New',monospace" font-weight="700" text-anchor="middle" fill="#2a3022" opacity=".1">88:88</text>
    <text${part("dT")} x="55" y="107" font-size="17" font-family="'Courier New',monospace" font-weight="700" text-anchor="middle" fill="#2a3022">12:00</text>
    <text${part("dD")} x="32" y="92" font-size="6" font-family="'Courier New',monospace" font-weight="700" fill="#2a3022">FR 24</text>
    <text${part("dS")} x="78" y="116" font-size="7" font-family="'Courier New',monospace" font-weight="700" text-anchor="end" fill="#2a3022">00</text>
    <text x="55" y="130" font-size="4.6" font-family="Outfit,Arial,sans-serif" font-weight="700" text-anchor="middle" fill="#30363c" letter-spacing=".6">LIGHT  ·  ALARM</text>
    <rect x="13" y="78" width="5" height="9" rx="2" fill="#7c848c"/><rect x="92" y="78" width="5" height="9" rx="2" fill="#7c848c"/><rect x="92" y="112" width="5" height="9" rx="2" fill="#7c848c"/></svg>`;

  if (style === "smart")
    return `<svg viewBox="0 0 110 200" aria-hidden="true">
    <rect x="31" y="0" width="48" height="200" rx="12" style="fill:var(--action)"/>
    <rect x="31" y="0" width="48" height="200" rx="12" fill="rgba(0,0,0,.12)"/>
    ${[20, 34, 166, 180].map((y) => `<circle cx="55" cy="${y}" r="3" fill="rgba(0,0,0,.25)"/>`).join("")}
    <rect x="19" y="56" width="72" height="88" rx="22" fill="#2b2b2e"/>
    <rect x="23" y="60" width="64" height="80" rx="18" fill="#050505"/>
    <rect x="89" y="78" width="5" height="14" rx="2.5" fill="#3a3a3e"/><rect x="89" y="98" width="4" height="22" rx="2" fill="#2f2f33"/>
    <circle cx="55" cy="100" r="27" fill="none" stroke="rgba(255,201,40,.18)" stroke-width="4"/>
    <circle${part("sRing")} cx="55" cy="100" r="27" fill="none" style="stroke:var(--accent)" stroke-width="4" stroke-linecap="round" stroke-dasharray="0 170" transform="rotate(-90 55 100)"/>
    <text${part("sD")} x="55" y="88" font-size="6.5" font-family="Outfit,Arial,sans-serif" font-weight="700" text-anchor="middle" fill="#9a9aa0">FRI 24</text>
    <text${part("sT")} x="55" y="107" font-size="17" font-family="Outfit,Arial,sans-serif" font-weight="800" text-anchor="middle" fill="#fff">12:00</text>
    <text${part("sR")} x="55" y="118" font-size="6" font-family="Outfit,Arial,sans-serif" font-weight="700" text-anchor="middle" style="fill:var(--accent)">0 min read</text></svg>`;

  // classic wristwatch: leather strap with stitching, steel case, cream dial
  return `<svg viewBox="0 0 110 200" aria-hidden="true"><defs>
      <linearGradient id="${u}cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f2ee"/><stop offset=".5" stop-color="#b9b4aa"/><stop offset="1" stop-color="#7d786e"/></linearGradient>
      <radialGradient id="${u}cd" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#efe5cf"/></radialGradient></defs>
    <rect x="35" y="0" width="40" height="200" rx="9" fill="#5a3a22"/>
    <rect x="39" y="0" width="32" height="200" rx="7" fill="none" stroke="#d8b48a" stroke-width=".9" stroke-dasharray="3 2.4" opacity=".7"/>
    ${[160, 172, 184].map((y) => `<circle cx="55" cy="${y}" r="2.2" fill="#2e1d10"/>`).join("")}
    <rect x="87" y="95" width="7" height="10" rx="2" fill="url(#${u}cs)"/>
    <circle cx="55" cy="100" r="38" fill="url(#${u}cs)"/>
    <circle cx="55" cy="100" r="32" fill="url(#${u}cd)"/>
    ${ticks(31, 27, 1.2, "#2b2a28")}
    ${hands("#1e1d1b", "#e0453a")}</svg>`;
}

/** Hand angles in degrees for a time. */
export function handAngles(d: Date): { h: number; m: number; s: number } {
  const h = d.getHours(),
    m = d.getMinutes(),
    s = d.getSeconds() + d.getMilliseconds() / 1000;
  return { h: (h % 12) * 30 + m * 0.5, m: m * 6 + s * 0.1, s: s * 6 };
}
