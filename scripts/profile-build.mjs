import { readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../dist/public/assets/", import.meta.url);
const files = await readdir(root);
const assets = [];
for (const file of files) {
  const info = await stat(join(root.pathname, file));
  if (info.isFile()) assets.push({ file, bytes: info.size });
}
assets.sort((a, b) => b.bytes - a.bytes);
const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
const report = { generatedAt: new Date().toISOString(), totalBytes, assets };
await writeFile(new URL("../dist/profile.json", import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ totalBytes, largest: assets.slice(0, 5) }, null, 2));
