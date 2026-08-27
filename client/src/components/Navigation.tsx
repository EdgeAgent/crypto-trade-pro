import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BarChart3, BookOpen, Boxes, ChevronRight, FolderGit2, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  shortLabel: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", shortLabel: "Projects", icon: FolderGit2 },
  { href: "/frameworks", label: "Frameworks", shortLabel: "Frameworks", icon: Boxes },
  { href: "/prompt-skills", label: "Prompt Skills", shortLabel: "Skills", icon: BookOpen },
];

function isActivePath(currentPath: string, href: string) {
  return href === "/" ? currentPath === "/" : currentPath.startsWith(href);
}

export default function Navigation() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Signed out securely");
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav data-testid="app-navigation" className="sticky top-0 z-50 border-b border-white/10 bg-background/85 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="touch-target h-11 w-11 shrink-0 border-white/10 bg-white/[0.04] text-muted-foreground lg:hidden" aria-label="Open navigation menu">
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(88vw,360px)] border-r border-white/10 bg-card/95 p-0 backdrop-blur-xl">
              <SheetHeader className="border-b border-white/10 px-5 py-5 text-left">
                <SheetTitle className="flex items-center gap-3 text-left text-foreground">
                  <span className="brand-mark h-9 w-9 rounded-xl"><BarChart3 className="h-5 w-5" /></span>
                  <span>Edge Atlas</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-[calc(100%-78px)] flex-col justify-between px-3 py-4">
                <div className="space-y-1">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Workspace</p>
                  {navItems.map(({ href, label, icon: Icon }) => {
                    const active = isActivePath(location, href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeMenu}
                        className={`touch-target flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${active ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                        {active && <ChevronRight className="ml-auto h-4 w-4" />}
                      </Link>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-accent/20 bg-accent/[0.06] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Execution mode</p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-accent"><span className="status-dot bg-accent" /> PAPER · SAFETY GATED</p>
                      </div>
                      <Badge variant="outline" className="border-accent/30 text-accent">Safe</Badge>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">Live execution stays gated until broker and risk checks pass.</p>
                  </div>
                  <Link href="/settings" onClick={closeMenu} className="touch-target flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-muted-foreground hover:bg-white/[0.05] hover:text-foreground">
                    <Settings className="h-5 w-5" /> Settings <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                  <button type="button" onClick={() => { closeMenu(); void handleLogout(); }} disabled={isLoggingOut} className="touch-target flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-muted-foreground hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50">
                    <LogOut className="h-5 w-5" /> {isLoggingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="group flex min-w-0 items-center gap-3 text-foreground" aria-label="Edge Atlas home">
            <span className="brand-mark h-10 w-10 shrink-0 rounded-2xl shadow-[0_0_24px_rgba(0,217,255,0.22)]"><BarChart3 className="h-5 w-5" /></span>
            <span className="min-w-0 truncate text-[15px] font-bold tracking-tight sm:text-lg">Edge <span className="text-accent">Atlas</span></span>
          </Link>
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(location, href);
            return (
              <Link key={href} href={href} className={`group relative flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors ${active ? "text-accent" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"}`}>
                <Icon className="h-4 w-4" />
                {label}
                {active && <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent shadow-[0_0_12px_rgba(0,217,255,0.75)]" />}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link href="/settings" className="hidden items-center gap-2 rounded-xl border border-accent/20 bg-accent/[0.06] px-3 py-2 text-left transition-colors hover:border-accent/40 hover:bg-accent/[0.1] sm:flex" aria-label="Open live trading settings">
            <span className="status-dot bg-accent" />
            <span className="hidden xl:block"><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</span><span className="block text-xs font-bold text-accent">REPOSITORY ATLAS</span></span>
            <span className="text-xs font-bold text-accent xl:hidden">ATLAS</span>
          </Link>
          <Link href="/settings" className="touch-target flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:border-accent/30 hover:text-foreground" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Link>
          <Button type="button" variant="outline" size="icon" onClick={() => void handleLogout()} disabled={isLoggingOut} className="touch-target h-11 w-11 border-white/10 bg-white/[0.04] text-muted-foreground hover:border-red-500/30 hover:text-red-300" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
