import CopyTradingUI from "@/components/CopyTradingUI";

export default function Traders() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Live Traders</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover and copy trades from top performers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <CopyTradingUI />
      </div>
    </div>
  );
}
