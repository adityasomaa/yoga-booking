/**
 * Fails if any raw z-index appears outside the single scale in globals.css.
 * Run: npm run audit:z
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("src");
const SCALE_FILE = path.resolve("src/app/globals.css");

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = await walk(ROOT);
const offenders = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // Tailwind numeric z utilities: z-10, z-50, -z-10 ...
    const twClass = line.match(/(?:^|["'\s`])-?z-\[?\d/);
    // CSS/JS numeric z-index, e.g. z-index: 40  /  zIndex: 40
    const cssRaw = /z-?[iI]ndex\s*[:=]\s*["']?-?\d/.test(line);

    if (!twClass && !cssRaw) return;

    // The scale itself is allowed to hold numbers, and only in globals.css.
    if (file === SCALE_FILE && /--z-[a-z-]+:\s*\d+;/.test(line)) return;

    offenders.push(`${path.relative(process.cwd(), file)}:${i + 1}  ${line.trim()}`);
  });
}

const scale = await readFile(SCALE_FILE, "utf8");
const tokens = [...scale.matchAll(/--z-([a-z-]+):\s*(\d+);/g)].map(
  (m) => `${m[1]}=${m[2]}`
);

console.log(`\n  z-index scale (${tokens.length} tokens): ${tokens.join(", ")}`);
if (offenders.length) {
  console.log(`\n  RAW z-index found (${offenders.length}):`);
  for (const o of offenders) console.log(`    ${o}`);
  process.exit(1);
}
console.log("  Raw z-index in codebase: 0\n");
