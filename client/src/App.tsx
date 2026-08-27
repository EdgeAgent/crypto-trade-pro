import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Markets = lazy(() => import("./pages/Markets"));
const AssetDetail = lazy(() => import("./pages/AssetDetail"));
const Trading = lazy(() => import("./pages/Trading"));
const Traders = lazy(() => import("./pages/Traders"));
const Signals = lazy(() => import("./pages/Signals"));
const Bots = lazy(() => import("./pages/Bots"));
const Settings = lazy(() => import("./pages/Settings"));
const RepositoryLibrary = lazy(() => import("./pages/RepositoryLibrary"));
const RepositoryDetail = lazy(() => import("./pages/RepositoryDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoading() {
  return <div className="flex min-h-[50vh] items-center justify-center px-4 text-sm text-muted-foreground" role="status" aria-live="polite">Loading workspace…</div>;
}

function Router() {
  return <div className="min-h-screen bg-background"><Suspense fallback={<RouteLoading />}><Switch><Route path="/" component={Home} /><Route path="/markets" component={Markets} /><Route path="/asset/:id" component={AssetDetail} /><Route path="/trading" component={Trading} /><Route path="/traders" component={Traders} /><Route path="/signals" component={Signals} /><Route path="/bots" component={Bots} /><Route path="/settings" component={Settings} /><Route path="/repositories" component={() => <RepositoryLibrary category="All" />} /><Route path="/projects" component={() => <RepositoryLibrary category="Projects" />} /><Route path="/frameworks" component={() => <RepositoryLibrary category="Frameworks" />} /><Route path="/prompt-skills" component={() => <RepositoryLibrary category="Prompt Skills" />} /><Route path="/repository/:slug" component={RepositoryDetail} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense></div>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Navigation /><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
