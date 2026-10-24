import type { Scene } from "./scenes";

/** Simple flat drawings laid over a scene's background, sized to the window (W × H). Returns SVG markup. */
export function sceneArtSVG(kind: Scene["art"], W: number, H: number): string {
  if (kind === "desk")
    return `
    <g opacity=".95"><rect x="${W * 0.05}" y="-40" width="${Math.min(520, W * 0.4)}" height="240" rx="18" fill="#f7f5ef" transform="rotate(-4 ${W * 0.05} 0)"/>
    <path d="M${W * 0.05 + 190} 70 q30 -30 70 -10 t80 0 q20 20 -10 40 q-40 10 -70 -5 t-60 -10z" fill="#3fa3dc"/>
    <path d="M${W * 0.05 + 330} 150 q20 -10 40 0 t50 -5" stroke="#1e1d1b" stroke-width="2" fill="none"/></g>
    <rect x="${W - 250}" y="40" width="320" height="14" rx="7" fill="#1e1d1b" transform="rotate(28 ${W - 250} 40)"/>
    <rect x="${W - 260}" y="100" width="340" height="16" rx="8" fill="#1e1d1b" transform="rotate(31 ${W - 260} 100)"/>
    <rect x="${W - 260}" y="100" width="44" height="16" rx="8" fill="#e0453a" transform="rotate(31 ${W - 260} 100)"/>
    <rect x="-60" y="${H - 160}" width="240" height="13" rx="6" fill="#2a2a2a" transform="rotate(-62 -60 ${H - 160})"/>`;
  if (kind === "sea")
    return `
    <path d="M0 ${H * 0.38} L${W * 0.07} ${H * 0.42} L${W * 0.14} ${H * 0.52} L${W * 0.18} ${H * 0.66} L${W * 0.23} ${H * 0.8} L${W * 0.23} ${H} L0 ${H}Z" fill="#2f3a2c"/>
    <path d="M0 ${H * 0.8} L${W * 0.1} ${H * 0.78} L${W * 0.18} ${H * 0.85} L${W * 0.27} ${H * 0.95} L${W * 0.27} ${H} L0 ${H}Z" fill="#3b3530"/>
    <path d="M${W * 0.9} ${H * 0.6} L${W * 0.94} ${H * 0.585} L${W} ${H * 0.59} L${W} ${H * 0.63} L${W * 0.88} ${H * 0.63}Z" fill="#3b3530"/>`;
  if (kind === "pastel")
    return `
    <rect x="${W * 0.04}" y="${H - 230}" width="26" height="190" rx="13" fill="#3f7fd0" transform="rotate(-20 ${W * 0.04} ${H - 230})"/>
    <rect x="${W * 0.04}" y="${H - 230}" width="26" height="34" rx="13" fill="#9fd0ec" transform="rotate(-20 ${W * 0.04} ${H - 230})"/>
    <rect x="${W * 0.09}" y="${H - 200}" width="26" height="170" rx="13" fill="#b9d23a" transform="rotate(-8 ${W * 0.09} ${H - 200})"/>`;
  if (kind === "night")
    return `<circle cx="${W * 0.82}" cy="${H * 0.16}" r="34" fill="#f4e7b5" opacity=".9"/>
    ${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 137) % W}" cy="${(i * 71) % (H * 0.5)}" r="1.4" fill="#f4e7b5" opacity=".6"/>`).join("")}`;
  return "";
}
