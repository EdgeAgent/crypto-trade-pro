import React, { useState } from "react";
import { AlertCircle, CheckCircle, LockKeyhole, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GoLiveSwitchProps {
  isReady?: boolean;
  brokerLabel?: string;
  dailyLossLimit?: number;
}

export default function GoLiveSwitch({ isReady = false, brokerLabel = "No broker connected", dailyLossLimit = 1000 }: GoLiveSwitchProps) {
  const [isLive, setIsLive] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const handleToggleLive = () => {
    if (isLive) {
      setIsLive(false);
      setConfirmDialog(false);
      return;
    }

    if (!isReady) return;
    setConfirmDialog(true);
  };

  const confirmGoLive = () => {
    if (!isReady) return;
    setIsLive(true);
    setConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${isLive ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isLive ? (
                <>
                  <Power className="w-8 h-8 text-red-500 animate-pulse" />
                  <div>
                    <h3 className="text-xl font-bold text-red-500">LIVE TRADING ACTIVE</h3>
                    <p className="text-sm text-muted-foreground">Execution requires a verified broker connection</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-green-500">PAPER TRADING</h3>
                    <p className="text-sm text-muted-foreground">Safe default while broker credentials are placeholders</p>
                  </div>
                </>
              )}
            </div>
            <Badge className={isLive ? "bg-red-600 text-white" : "bg-green-600 text-white"}>{isLive ? "LIVE" : "PAPER"}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Connection</p>
              <p className="text-sm font-bold text-foreground">{isReady ? brokerLabel : "Not configured"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily loss limit</p>
              <p className="text-sm font-bold text-foreground">${dailyLossLimit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Execution state</p>
              <p className={`text-sm font-bold ${isLive ? "text-red-400" : "text-green-400"}`}>{isLive ? "Live orders enabled" : "Simulation only"}</p>
            </div>
          </div>

          {!isLive && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6 flex items-start gap-3">
              <LockKeyhole className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-300">GO LIVE is locked until the account is ready</p>
                <p className="text-xs text-blue-200/80 mt-1">Configure and validate a broker connection, set a valid daily loss limit, then explicitly confirm the real-capital disclosure.</p>
              </div>
            </div>
          )}

          {isLive && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">Real Trading Active</p>
                <p className="text-xs text-red-400/80">Real capital may be at risk. Disable live mode immediately if the broker, strategy, or risk limits are not behaving as expected.</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleToggleLive}
            disabled={!isLive && !isReady}
            className={`w-full h-12 font-bold text-lg ${isLive ? "bg-red-600 hover:bg-red-700 text-white" : isReady ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {isLive ? "DISABLE LIVE TRADING" : isReady ? "GO LIVE" : "CONFIGURE BROKER TO UNLOCK"}
          </Button>
        </div>
      </Card>

      {confirmDialog && (
        <Card className="border-2 border-yellow-500/50 bg-yellow-500/5">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-yellow-500 mb-2">Confirm GO LIVE</h3>
                <p className="text-sm text-muted-foreground mb-4">You are about to enable live execution with real capital through {brokerLabel}. This can result in irreversible losses.</p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                  <li>✓ A verified broker connection is active</li>
                  <li>✓ The daily loss limit is ${dailyLossLimit.toLocaleString()}</li>
                  <li>✓ Real orders will execute on live markets</li>
                  <li>✓ You accept fees, slippage, and potential loss of capital</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setConfirmDialog(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={confirmGoLive} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold">I Understand — GO LIVE</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-card border-border/50">
        <div className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Trading modes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-3">Paper trading</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ No real capital at risk</li>
                <li>✓ Safe strategy validation</li>
                <li>✓ No broker credentials required</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-3">Live trading</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Real market execution</li>
                <li>✓ Exchange fees and slippage apply</li>
                <li>✓ Requires verified broker credentials and risk limits</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
