/**
 * Converts the licensed Neue Montreal TTFs into self-hosted WOFF2.
 * Source folder is local to the machine that owns the font licence and is
 * intentionally NOT committed. Re-run with: npm run fonts
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { compress } from "wawoff2";

const SRC = process.env.NEUE_MONTREAL_DIR ?? "C:/Users/User/Downloads/NEUE MONTREAL";
const OUT = path.resolve("public/fonts");

// Only the weights the design system actually uses.
const FACES = [
  { file: "NeueMontreal-Regular.ttf", out: "NeueMontreal-Regular.woff2" },
  { file: "NeueMontreal-Medium.ttf", out: "NeueMontreal-Medium.woff2" },
];

await mkdir(OUT, { recursive: true });

for (const face of FACES) {
  const src = path.join(SRC, face.file);
  if (!existsSync(src)) {
    console.error(`  MISSING  ${src}`);
    process.exitCode = 1;
    continue;
  }
  const ttf = await readFile(src);
  const woff2 = await compress(ttf);
  await writeFile(path.join(OUT, face.out), Buffer.from(woff2));
  const pct = (100 - (woff2.length / ttf.length) * 100).toFixed(1);
  console.log(`  OK  ${face.out}  ${ttf.length}B -> ${woff2.length}B (-${pct}%)`);
}
