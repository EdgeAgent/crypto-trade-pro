import { readFileSync, writeFileSync } from "node:fs";

const input = process.argv[2] ?? "/tmp/edgeagent-repos.tsv";
const output = process.argv[3] ?? "client/src/data/repositoryCatalog.ts";
const rows = readFileSync(input, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => {
  const [nameWithOwner, visibility, url, description = "", updatedAt] = line.split("\t");
  const name = nameWithOwner.split("/").slice(1).join("/");
  const haystack = `${name} ${description}`.toLowerCase();
  const category = /skill|prompt|agent-swarm|agent.?architecture|orchestration|framework|protocol|runtime|mcp|n8n|automation|llm|generative-ai|ai-brain|jarvis|openmanus|clawpilot/.test(haystack)
    ? ( /skill|prompt/.test(haystack) ? "Prompt Skills" : "Frameworks" )
    : "Projects";
  return { name, nameWithOwner, visibility, url, description: description.trim(), updatedAt, category };
});
const esc = (value) => value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", " ");
const body = rows.map((row) => `  { name: "${esc(row.name)}", owner: "${esc(row.nameWithOwner.split("/")[0])}", visibility: "${row.visibility}", url: "${row.url}", description: "${esc(row.description)}", updatedAt: "${row.updatedAt}", category: "${row.category}" },`).join("\n");
const outputText = `export type RepositoryCategory = "Projects" | "Frameworks" | "Prompt Skills";\n\nexport type RepositoryRecord = {\n  name: string;\n  owner: string;\n  visibility: "public" | "private";\n  url: string;\n  description: string;\n  updatedAt: string;\n  category: RepositoryCategory;\n};\n\nexport const repositoryCatalog: RepositoryRecord[] = [\n${body}\n];\n\nexport const catalogStats = {\n  total: repositoryCatalog.length,\n  projects: repositoryCatalog.filter((repo) => repo.category === "Projects").length,\n  frameworks: repositoryCatalog.filter((repo) => repo.category === "Frameworks").length,\n  promptSkills: repositoryCatalog.filter((repo) => repo.category === "Prompt Skills").length,\n};\n`;
writeFileSync(output, outputText);
console.log(`Generated ${rows.length} source-linked repository records at ${output}`);
