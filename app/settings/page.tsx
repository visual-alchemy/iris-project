"use client"

import { copyToClipboard as copyText } from "@/lib/clipboard"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Server,
  Shield,
  Database,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { getServerStats, getDatabaseStats } from "@/lib/api"

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [serverStats, setServerStats] = useState({ version: "v1.16.2", uptime: "-", connections: 0 });
  const [dbStats, setDbStats] = useState({ records: 0, size: "0 MB", lastBackup: "-" });
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    getServerStats().then((stats) => {
      setServerStats(stats);
      // Parse uptime string like "3:45:12" into seconds
      const parts = stats.uptime.split(":").map(Number);
      if (parts.length === 3) {
        setUptimeSeconds(parts[0] * 3600 + parts[1] * 60 + parts[2]);
      }
    });
    getDatabaseStats().then(setDbStats);
  }, []);

  // Real-time uptime ticker
  useEffect(() => {
    if (uptimeSeconds === 0) return;
    const interval = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [uptimeSeconds > 0]);

  const formatUptime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    copyText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Settings"
        description="Configure your I.R.I.S. streaming gateway"
      >
        <Tabs defaultValue="server" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="server">
              <Server className="mr-2 h-4 w-4" />
              Server
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* Server Settings */}
          <TabsContent value="server" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">
                MediaMTX Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Core streaming server settings
              </p>

              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>RTMP Port</Label>
                    <Input defaultValue="1935" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>HLS Port</Label>
                    <Input defaultValue="8888" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>WebRTC Port</Label>
                    <Input defaultValue="8889" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>API Port</Label>
                    <Input defaultValue="4000" readOnly />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label>Auto-restart on Failure</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically restart MediaMTX if it crashes (Managed by Docker)
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label>Enable WebRTC Playback</Label>
                    <p className="text-xs text-muted-foreground">
                      Ultra-low latency WebRTC streams
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Server Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Current server health and connections
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      MediaMTX
                    </span>
                    <Badge className="bg-success text-success-foreground">
                      Online
                    </Badge>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {serverStats.version}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <Badge variant="outline">Running</Badge>
                  </div>
                  <p className="mt-2 font-mono text-xl font-semibold text-foreground">
                    {uptimeSeconds > 0 ? formatUptime(uptimeSeconds) : serverStats.uptime}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Connections
                    </span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {serverStats.connections} clients
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Authentication
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure authentication settings
              </p>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label>Require Stream Key Validation</Label>
                    <p className="text-xs text-muted-foreground">
                      Validate stream keys via Elixir auth Webhook before accepting ingest
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <Label>IP Whitelist Enforcement</Label>
                    <p className="text-xs text-muted-foreground">
                      Only allow streams from whitelisted IPs
                    </p>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage API access credentials
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <Label>Public API Key</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="rounded bg-secondary px-3 py-1.5 font-mono text-xs">
                        pk_live_abc123def456ghi789jkl012
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(
                            "pk_live_abc123def456ghi789jkl012",
                            "public"
                          )
                        }
                      >
                        {copied === "public" ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert("API key regenerated! (placeholder)")}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <Label>Secret API Key</Label>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="rounded bg-secondary px-3 py-1.5 font-mono text-xs">
                        {"sk_live_••••••••••••••••••••••••"}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() =>
                          copyToClipboard(
                            "••••••••••••••••••••••••••",
                            "secret"
                          )
                        }
                      >
                        {copied === "secret" ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => alert("Secret key regenerated! (placeholder)")}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">
                PostgreSQL Connection
              </h3>
              <p className="text-sm text-muted-foreground">
                Database connection settings (Docker Environment)
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Host</Label>
                  <Input defaultValue="postgres" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input defaultValue="5432" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Database</Label>
                  <Input defaultValue="iris_engine_dev" readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input defaultValue="postgres" readOnly />
                </div>
              </div>

              <div className="mt-6">
                <Badge className="bg-success text-success-foreground">
                  Connected
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Database Statistics
              </h3>
              <p className="text-sm text-muted-foreground">
                Current database usage
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <span className="text-sm text-muted-foreground">
                    Total Records
                  </span>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {dbStats.records.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <span className="text-sm text-muted-foreground">
                    Database Size
                  </span>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {dbStats.size}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <span className="text-sm text-muted-foreground">
                    Last Backup
                  </span>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {dbStats.lastBackup}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => alert("Settings saved!")}>Save Changes</Button>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
