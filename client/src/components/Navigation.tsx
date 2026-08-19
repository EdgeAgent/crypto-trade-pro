import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { BarChart3, Zap, Users, TrendingUp, Cpu, Settings, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [isLive, setIsLive] = useState(false);

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-accent transition-colors">
            <BarChart3 className="w-6 h-6 text-accent" />
            CryptoTrade Pro
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Dashboard
            </Link>
            <Link href="/markets" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Markets
            </Link>
            <Link href="/traders" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              <Users className="w-4 h-4" />
              Traders
            </Link>
            <Link href="/signals" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Signals
            </Link>
            <Link href="/bots" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              Bots
            </Link>
            <Link href="/trading" className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Trade
            </Link>
          </div>

          {/* GO LIVE Switch */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex flex-col gap-1">
                <div className="text-xs font-semibold text-muted-foreground">TRADING MODE</div>
                <div className={`text-sm font-bold ${isLive ? "text-red-400" : "text-green-400"}`}>
                  {isLive ? "🔴 LIVE" : "📄 PAPER"}
                </div>
              </div>
              <Switch
                checked={isLive}
                onCheckedChange={setIsLive}
                className="ml-2"
              />
            </div>

            <Button variant="outline" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
