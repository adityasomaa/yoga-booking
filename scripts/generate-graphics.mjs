/**
 * Deterministic generative placeholder graphics.
 *
 * Every file is produced from a seeded PRNG keyed on its own name, so running
 * this script again always reproduces byte-identical output. Nothing here is a
 * photograph and nothing depicts a person or a real class -- these are abstract
 * stand-ins to be swapped for the studio's own imagery later.
 *
 * Visual language: curved planes, arcs and negative space, one accent hue.
 * Deliberately NO grain / noise / speckle filters anywhere.
 *
 * Run: npm run graphics
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("public/graphics");

const INK = "#15181A";
const ACCENT = "#1C5344";
const PAPER = "#F4F1EA";
const SAND = "#EBE7DC";

/* ---- deterministic PRNG -------------------------------------------------- */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n = (v) => Math.round(v * 100) / 100;

/* ---- shape language ------------------------------------------------------ */

// A wide, soft plane that bleeds off both edges -- the "horizon" motif.
function plane(rnd, w, h, y, amp, fill, opacity) {
  const c1 = n(w * (0.18 + rnd() * 0.16));
  const c2 = n(w * (0.62 + rnd() * 0.2));
  const lift = n(amp * (0.6 + rnd() * 0.8));
  return `<path d="M -40 ${n(y)} C ${c1} ${n(y - lift)}, ${c2} ${n(y + lift * 0.7)}, ${w + 40} ${n(y - lift * 0.3)} L ${w + 40} ${h + 40} L -40 ${h + 40} Z" fill="${fill}" opacity="${opacity}"/>`;
}

// Concentric open arcs -- breath / expansion, drawn as hairlines.
function arcs(rnd, cx, cy, count, step, stroke, opacity) {
  let out = "";
  const start = -Math.PI * (0.06 + rnd() * 0.12);
  const end = Math.PI * (0.55 + rnd() * 0.35);
  for (let i = 0; i < count; i++) {
    const r = step * (i + 1);
    const x1 = n(cx + r * Math.cos(start));
    const y1 = n(cy + r * Math.sin(start));
    const x2 = n(cx + r * Math.cos(end));
    const y2 = n(cy + r * Math.sin(end));
    const large = end - start > Math.PI ? 1 : 0;
    out += `<path d="M ${x1} ${y1} A ${n(r)} ${n(r)} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${n(0.8 + rnd() * 0.7)}" opacity="${n(opacity * (1 - i / (count * 1.6)))}" stroke-linecap="round"/>`;
  }
  return out;
}

// A single large disc, usually cropped by the frame -- the resting mass.
function disc(rnd, cx, cy, r, fill, opacity) {
  return `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}" opacity="${opacity}"/>`;
}

// Two nested arcs forming an open lens -- used as the small motif per class.
function lens(rnd, cx, cy, r, stroke) {
  const o = r * (0.42 + rnd() * 0.28);
  return (
    `<path d="M ${n(cx - r)} ${n(cy)} A ${n(r)} ${n(r + o)} 0 0 1 ${n(cx + r)} ${n(cy)}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>` +
    `<path d="M ${n(cx - r)} ${n(cy)} A ${n(r)} ${n(r + o)} 0 0 0 ${n(cx + r)} ${n(cy)}" fill="none" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>`
  );
}

function wrap(w, h, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
}

/* ---- compositions -------------------------------------------------------- */

// Wide, quiet, lots of empty upper field. Used behind the hero.
function composeHero(seed, w = 1600, h = 1000) {
  const rnd = mulberry32(hashSeed(seed));
  let b = `<rect width="${w}" height="${h}" fill="${PAPER}"/>`;
  b += disc(rnd, w * (0.72 + rnd() * 0.08), h * 0.3, h * (0.3 + rnd() * 0.08), SAND, "1");
  b += arcs(rnd, w * 0.74, h * 0.32, 7, h * 0.075, ACCENT, 0.5);
  b += plane(rnd, w, h, h * 0.68, h * 0.1, SAND, "1");
  b += plane(rnd, w, h, h * 0.79, h * 0.08, ACCENT, "0.14");
  b += plane(rnd, w, h, h * 0.9, h * 0.06, ACCENT, "0.9");
  return wrap(w, h, b, "Abstract graphic of layered curved planes and arcs");
}

// Square-ish motif, one per class type. Seeded by slug so each differs.
function composeClass(seed, w = 800, h = 600) {
  const rnd = mulberry32(hashSeed(seed));
  let b = `<rect width="${w}" height="${h}" fill="${SAND}"/>`;
  const cx = w * (0.3 + rnd() * 0.4);
  const cy = h * (0.34 + rnd() * 0.2);
  b += disc(rnd, cx, cy, h * (0.2 + rnd() * 0.12), PAPER, "1");
  b += arcs(rnd, cx, cy, 5, h * 0.062, ACCENT, 0.55);
  b += lens(rnd, cx, cy, h * (0.12 + rnd() * 0.06), ACCENT);
  b += plane(rnd, w, h, h * (0.76 + rnd() * 0.06), h * 0.07, ACCENT, "0.16");
  b += plane(rnd, w, h, h * 0.94, h * 0.05, ACCENT, "0.85");
  return wrap(w, h, b, "Abstract graphic of arcs and curved planes");
}

// Narrow banner used above secondary sections.
function composeBand(seed, w = 1400, h = 420) {
  const rnd = mulberry32(hashSeed(seed));
  let b = `<rect width="${w}" height="${h}" fill="${PAPER}"/>`;
  b += disc(rnd, w * (0.16 + rnd() * 0.1), h * 1.05, h * (0.6 + rnd() * 0.2), SAND, "1");
  b += arcs(rnd, w * (0.82 - rnd() * 0.1), h * 0.5, 6, h * 0.14, ACCENT, 0.45);
  b += plane(rnd, w, h, h * 0.88, h * 0.12, ACCENT, "0.15");
  return wrap(w, h, b, "Abstract graphic of arcs and curved planes");
}

/* ---- site icon: transparent, no background plate ------------------------- */
function composeIcon() {
  // A single open lens + arc. No <rect> background: the mark must stay
  // transparent so it sits cleanly on any browser tab colour.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Studio mark"><title>Studio mark</title><path d="M 12 34 A 20 26 0 0 1 52 34" fill="none" stroke="${ACCENT}" stroke-width="4.5" stroke-linecap="round"/><path d="M 12 34 A 20 26 0 0 0 52 34" fill="none" stroke="${ACCENT}" stroke-width="4.5" stroke-linecap="round"/><circle cx="32" cy="34" r="5" fill="${INK}"/></svg>\n`;
}

/* ---- run ----------------------------------------------------------------- */
const CLASS_SLUGS = ["hatha", "vinyasa", "yin", "prenatal", "private"];

await mkdir(OUT, { recursive: true });

const files = [
  ["hero.svg", composeHero("hero-v1")],
  ["band-paket.svg", composeBand("band-paket-v1")],
  ["band-kontak.svg", composeBand("band-kontak-v1")],
  ["band-pemula.svg", composeBand("band-pemula-v1")],
  ["icon.svg", composeIcon()],
  ...CLASS_SLUGS.map((s) => [`class-${s}.svg`, composeClass(`class-${s}-v1`)]),
];

for (const [name, svg] of files) {
  await writeFile(path.join(OUT, name), svg, "utf8");
  console.log(`  OK  graphics/${name}  ${svg.length}B`);
}

// The site icon also lives at /icon.svg for the Next.js metadata convention.
await writeFile(path.resolve("public/icon.svg"), composeIcon(), "utf8");
console.log("  OK  public/icon.svg (transparent, no background plate)");
