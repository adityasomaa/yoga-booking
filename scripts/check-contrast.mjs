/**
 * WCAG AA audit for every colour pair the design system actually renders.
 * Run: npm run contrast
 * Exits non-zero if any pair used for text falls under 4.5:1.
 */
const T = {
  bg:          "#F4F1EA",
  surface:     "#FFFFFF",
  surfaceAlt:  "#EBE7DC",
  ink:         "#15181A",
  inkSoft:     "#4A5350",
  accent:      "#1C5344",
  accentInk:   "#FFFFFF",
  accentSoft:  "#E2EDE7",
  ok:          "#1C5344",
  warn:        "#7A4A12",
  full:        "#8A2B2B",
  past:        "#5A5F5C",
  line:        "#D6D0C2",
  focus:       "#1C5344",
};

const srgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
};
const lum = (h) => { const [r, g, b] = srgb(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

// [label, foreground, background, minimum]
// 4.5 = body text (AA). 3.0 = large text >=24px and non-text UI boundaries.
const PAIRS = [
  ["ink on bg",              T.ink,      T.bg,         4.5],
  ["ink on surface",         T.ink,      T.surface,    4.5],
  ["ink on surfaceAlt",      T.ink,      T.surfaceAlt, 4.5],
  ["ink on accentSoft",      T.ink,      T.accentSoft, 4.5],
  ["inkSoft on bg",          T.inkSoft,  T.bg,         4.5],
  ["inkSoft on surface",     T.inkSoft,  T.surface,    4.5],
  ["inkSoft on surfaceAlt",  T.inkSoft,  T.surfaceAlt, 4.5],
  ["accent on bg",           T.accent,   T.bg,         4.5],
  ["accent on surface",      T.accent,   T.surface,    4.5],
  ["accent on accentSoft",   T.accent,   T.accentSoft, 4.5],
  ["accentInk on accent",    T.accentInk,T.accent,     4.5],
  ["status ok on surface",   T.ok,       T.surface,    4.5],
  ["status ok on bg",        T.ok,       T.bg,         4.5],
  ["status warn on surface", T.warn,     T.surface,    4.5],
  ["status warn on bg",      T.warn,     T.bg,         4.5],
  ["status full on surface", T.full,     T.surface,    4.5],
  ["status full on bg",      T.full,     T.bg,         4.5],
  ["status past on surface", T.past,     T.surface,    4.5],
  ["status past on bg",      T.past,     T.bg,         4.5],
  ["focus ring on bg",       T.focus,    T.bg,         3.0],
  ["focus ring on surface",  T.focus,    T.surface,    3.0],
  ["line on bg",             T.line,     T.bg,         1.0],
];

let fail = 0;
console.log("\n  PAIR                        RATIO   MIN   RESULT");
console.log("  " + "-".repeat(52));
for (const [label, fg, bg, min] of PAIRS) {
  const r = ratio(fg, bg);
  const pass = r >= min;
  if (!pass) fail++;
  console.log(
    `  ${label.padEnd(26)} ${r.toFixed(2).padStart(5)}  ${min.toFixed(1).padStart(4)}   ${pass ? "PASS" : "FAIL"}`
  );
}
console.log("  " + "-".repeat(52));
console.log(`  ${PAIRS.length - fail}/${PAIRS.length} pass\n`);
if (fail) process.exit(1);
