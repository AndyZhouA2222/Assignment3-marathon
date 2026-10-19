// Bundles each skill's demo page into out/demos/<name>/index.html.
// node tools/build-demos.mjs [name ...]
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEMOS } from "./demos.mjs";

const only = process.argv.slice(2);
for (const d of DEMOS) {
  if (only.length && !only.includes(d.name)) continue;
  if (!existsSync(d.entry)) { console.log(`skip ${d.name} (no ${d.entry})`); continue; }
  const out = join("out/demos", d.name);
  mkdirSync(out, { recursive: true });
  const r = await build({
    stdin: { contents: `import { createRoot } from "react-dom/client"; import Demo from ${JSON.stringify(resolve(d.entry))}; createRoot(document.getElementById("root")).render(<Demo />);`, loader: "tsx", resolveDir: process.cwd() },
    bundle: true, write: false, format: "iife", jsx: "automatic", minify: true, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning",
  });
  const css = d.css.map(f => readFileSync(f, "utf8")).join("\n");
  writeFileSync(join(out, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${d.title}</title>
<link rel="stylesheet" href="${d.fonts}"><style>html,body{margin:0}${css}</style></head><body><div id="root"></div><script>${r.outputFiles[0].text}</script></body></html>`);
  console.log(`built ${out}/index.html`);
}
