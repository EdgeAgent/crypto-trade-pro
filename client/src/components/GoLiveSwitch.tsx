import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Power } from "lucide-react";

export default function GoLiveSwitch() {
  const [isLive, setIsLive] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const handleToggleLive = () => {
    if (!isLive) {
      setConfirmDialog(true);
    } else {
      setIsLive(false);
      setConfirmDialog(false);
    }
  };

  const confirmGoLive = () => {
    setIsLive(true);
    setConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`border-2 ${isLive ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isLive ? (
                <>
                  <Power className="w-8 h-8 text-red-500 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold text-red-500">LIVE TRADING ACTIVE</h3>
                    <p className="text-sm text-muted-foreground">Real trades are being executed</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-green-500">PAPER TRADING</h3>
                    <p className="text-sm text-muted-foreground">Simulated trading with virtual balance</p>
                  </div>
                </>
              )}
            </div>
            <Badge className={isLive ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
              {isLive ? "LIVE" : "PAPER"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Account Balance</p>
              <p className="text-lg font-bold text-foreground">
                ${isLive ? "50,000.00" : "10,000.00"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total P&L</p>
              <p className="text-lg font-bold text-green-400">+$2,450.50</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
              <p className="text-lg font-bold text-foreground">68.5%</p>
            </div>
          </div>

          {/* Warning */}
          {!isLive && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
              <p className="text-sm text-blue-400">
                📊 You are currently in paper trading mode. Switch to GO LIVE to execute real trades with real capital.
              </p>
            </div>
          )}

          {isLive && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Real Trading Active</p>
                <p className="text-xs text-red-400/80">
                  Your real capital is at risk. All trades will be executed on live markets. Monitor your positions carefully.
                </p>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <Button
            onClick={handleToggleLive}
            className={`w-full h-12 font-bold text-lg ${
              isLive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            }`}
          >
            {isLive ? "DISABLE LIVE TRADING" : "GO LIVE"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Confirm GO LIVE</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You are about to enable live trading with real capital. This action cannot be undone immediately.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>✓ Your real capital will be at risk</li>
                  <li>✓ All trades will execute on live markets</li>
                  <li>✓ You are responsible for all losses</li>
                  <li>✓ Ensure your strategies are properly tested</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmGoLive}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                I Understand - GO LIVE
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Features Comparison */}
      <Card className="bg-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Paper vs Live Trading</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-3">Paper Trading</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Virtual $10,000 balance</li>
                <li>✓ No real capital at risk</li>
                <li>✓ Perfect for learning</li>
                <li>✓ Test strategies safely</li>
                <li>✓ No fees or commissions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-3">Live Trading</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Real capital at work</li>
                <li>✓ Actual market execution</li>
                <li>✓ Real profits & losses</li>
                <li>✓ Exchange fees apply</li>
                <li>✓ Full market access</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
