import GoLiveSwitch from "@/components/GoLiveSwitch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your trading preferences and account</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* GO LIVE Switch Section */}
        <div className="mb-12">
          <GoLiveSwitch />
        </div>

        {/* Account Settings */}
        <div className="space-y-6">
          <Card className="bg-card border-border/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Account Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Display Name</label>
                  <Input
                    type="text"
                    placeholder="Your trading name"
                    defaultValue="kevin Doherty"
                    className="mt-2 bg-muted border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    defaultValue="kevin@example.com"
                    className="mt-2 bg-muted border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">API Key (for live trading)</label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="mt-2 bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Your API key is encrypted and never shared
                  </p>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90">Save Changes</Button>
              </div>
            </div>
          </Card>

          {/* Risk Management */}
          <Card className="bg-card border-border/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Risk Management</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Max Position Size (%)</label>
                  <Input
                    type="number"
                    placeholder="5"
                    defaultValue="5"
                    className="mt-2 bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum percentage of account to risk per trade
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Daily Loss Limit ($)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    defaultValue="1000"
                    className="mt-2 bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Stop trading if daily loss exceeds this amount
                  </p>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90">Update Risk Settings</Button>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border-border/50">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Notifications</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-foreground">Trade execution alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-foreground">Daily P&L summary</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-foreground">Trader signal notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-foreground">Email notifications</span>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
