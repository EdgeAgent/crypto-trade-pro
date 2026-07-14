import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/NotFound";
import Markets from "@/pages/Markets";
import Trading from "@/pages/Trading";
import Traders from "@/pages/Traders";
import Signals from "@/pages/Signals";
import Bots from "@/pages/Bots";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/markets" component={Markets} />
        <Route path="/trading" component={Trading} />
        <Route path="/traders" component={Traders} />
        <Route path="/signals" component={Signals} />
        <Route path="/bots" component={Bots} />
        <Route path="/404" component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // NOTE: About Theme
  // - Dark theme with cyan accents for premium trading platform experience
  // - OKLCH color space for better color representation
  // - Theme is now set to dark by default
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Navigation />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
