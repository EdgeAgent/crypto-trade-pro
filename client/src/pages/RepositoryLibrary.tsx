import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, BookOpen, Boxes, ExternalLink, FolderGit2, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { repositoryCatalog, type RepositoryCategory } from "@/data/repositoryCatalog";

const categories: Array<{ value: RepositoryCategory; label: string; icon: typeof FolderGit2 }> = [
  { value: "Projects", label: "Projects", icon: FolderGit2 },
  { value: "Frameworks", label: "Frameworks", icon: Boxes },
  { value: "Prompt Skills", label: "Prompt Skills", icon: BookOpen },
];

const slugFor = (name: string) => encodeURIComponent(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

export default function RepositoryLibrary({ category }: { category: RepositoryCategory }) {
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<"all" | "public" | "private">("all");
  const records = useMemo(() => repositoryCatalog.filter((repo) => {
    const matchesCategory = repo.category === category;
    const haystack = `${repo.name} ${repo.description} ${repo.owner}`.toLowerCase();
    return matchesCategory && (visibility === "all" || repo.visibility === visibility) && haystack.includes(query.toLowerCase().trim());
  }), [category, query, visibility]);
  const currentCategory = categories.find((item) => item.value === category) ?? categories[0];
  const CategoryIcon = currentCategory.icon;

  return <div className="min-h-screen bg-background"><main className="mx-auto max-w-[1440px] space-y-7 px-4 py-7 sm:px-6 lg:px-8">
    <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.12] via-card/90 to-violet-500/[0.08] p-5 sm:p-8">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent"><CategoryIcon className="h-4 w-4" /> Repository library</div><h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-5xl">A home for the things you’re building.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Browse source-linked projects, frameworks, and prompt skills from one quiet workspace. Nothing is ranked by made-up scores; every card points back to its source.</p></div>
    </section>
    <div className="flex gap-2 overflow-x-auto pb-1">{categories.map(({ value, label, icon: Icon }) => <Link key={value} href={value === "Projects" ? "/projects" : value === "Frameworks" ? "/frameworks" : "/prompt-skills"} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${value === category ? "border-accent/40 bg-accent/12 text-accent" : "border-white/10 bg-card/60 text-muted-foreground hover:border-accent/30 hover:text-foreground"}`}><Icon className="h-4 w-4" />{label}</Link>)}</div>
    <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-card/50 p-3 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${category.toLowerCase()}…`} aria-label={`Search ${category.toLowerCase()}`} className="h-11 border-white/10 bg-background/70 pl-10" /></label><div className="flex gap-2"><button type="button" onClick={() => setVisibility("all")} className={`touch-target min-h-11 rounded-xl px-3 text-xs font-semibold ${visibility === "all" ? "bg-accent text-accent-foreground" : "border border-white/10 text-muted-foreground"}`}>All</button><button type="button" onClick={() => setVisibility("public")} className={`touch-target min-h-11 rounded-xl px-3 text-xs font-semibold ${visibility === "public" ? "bg-accent text-accent-foreground" : "border border-white/10 text-muted-foreground"}`}>Public</button><button type="button" onClick={() => setVisibility("private")} className={`touch-target min-h-11 rounded-xl px-3 text-xs font-semibold ${visibility === "private" ? "bg-accent text-accent-foreground" : "border border-white/10 text-muted-foreground"}`}>Private</button></div></section>
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{category}</p><h2 className="mt-1 text-2xl font-bold text-foreground">{records.length} source-linked records</h2></div><span className="text-xs text-muted-foreground">Catalog snapshot · Aug 2026</span></div>
    {records.length === 0 ? <Card className="border-white/10 bg-card/60 p-10 text-center"><Sparkles className="mx-auto h-6 w-6 text-accent" /><h2 className="mt-3 font-semibold text-foreground">No records match this view</h2><p className="mt-1 text-sm text-muted-foreground">Try another search or visibility filter. The catalog never invents missing entries.</p></Card> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{records.map((repo) => <Card key={`${repo.owner}/${repo.name}`} className="group flex min-h-[220px] flex-col border-white/10 bg-card/65 p-5 transition-colors hover:border-accent/30"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-medium text-muted-foreground">{repo.owner}</p><h3 className="mt-1 truncate text-lg font-bold text-foreground">{repo.name}</h3></div><Badge variant="outline" className={repo.visibility === "public" ? "shrink-0 border-emerald-400/30 text-emerald-300" : "shrink-0 border-violet-400/30 text-violet-300"}>{repo.visibility}</Badge></div><p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">{repo.description || "No repository description was provided."}</p><div className="mt-auto flex items-center justify-between gap-3 pt-5"><Link href={`/repository/${slugFor(repo.name)}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80">Open record <ArrowUpRight className="h-4 w-4" /></Link><a href={repo.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 text-xs text-muted-foreground hover:text-foreground">GitHub <ExternalLink className="h-3.5 w-3.5" /></a></div></Card>)}</div>}
  </main></div>;
}

export { slugFor };
