"use client"

import { copyToClipboard as copyText } from "@/lib/clipboard"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getServerStats, getDatabaseStats } from "@/lib/api"

export default function SettingsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [serverStats, setServerStats] = useState({ version: "v1.16.2", uptime: "-", connections: 0 })
  const [dbStats, setDbStats] = useState({ records: 0, size: "0 MB", lastBackup: "-" })
  const [uptimeSeconds, setUptimeSeconds] = useState(0)

  useEffect(() => {
    getServerStats().then(s => { setServerStats(s); const p = s.uptime.split(":").map(Number); if(p.length===3) setUptimeSeconds(p[0]*3600+p[1]*60+p[2]) })
    getDatabaseStats().then(setDbStats)
  }, [])

  useEffect(() => {
    if (!uptimeSeconds) return
    const t = setInterval(() => setUptimeSeconds(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [uptimeSeconds > 0])

  const fmtUptime = (s: number) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` }
  const copier = (t: string, k: string) => { copyText(t); setCopied(k); setTimeout(() => setCopied(null), 2000) }

  return (
    <ProtectedRoute>
      <DashboardLayout title="SETTINGS" description="Gateway configuration">
        <Tabs defaultValue="server" className="space-y-2">
          <TabsList className="border border-grid-line bg-crt-panel p-0 h-auto gap-0 inline-flex">
            {["server","security","database"].map(t => <TabsTrigger key={t} value={t} className="border-r border-grid-line last:border-0 font-data text-sm tracking-[0.1em] uppercase data-[state=active]:bg-sig-green-dim data-[state=active]:text-sig-green py-2 px-3">{t}</TabsTrigger>)}
          </TabsList>

          <TabsContent value="server" className="space-y-2">
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ MEDIAMTX CONFIGURATION ]</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{l:"RTMP PORT",v:"1935"},{l:"HLS PORT",v:"8888"},{l:"WEBRTC PORT",v:"8889"},{l:"API PORT",v:"4000"}].map(f => (
                  <div key={f.l} className="space-y-1"><Label className="text-[11px] font-data tracking-[0.08em]">{f.l}</Label><Input defaultValue={f.v} readOnly className="h-8 text-sm" /></div>
                ))}
              </div>
              <div className="mt-2 space-y-1.5">
                {[{l:"AUTO-RESTART ON FAILURE",d:"Docker managed",c:true},{l:"ENABLE WEBRTC PLAYBACK",d:"Ultra-low latency",c:true}].map(i => (
                  <div key={i.l} className="flex items-center justify-between border border-grid-line px-2 py-2"><div><Label className="text-xs">{i.l}</Label><p className="text-[11px] text-phos-faint">{i.d}</p></div><Switch checked={i.c} disabled /></div>
                ))}
              </div>
            </div>
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ SYSTEM STATUS ]</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-grid-line p-2"><div className="flex items-center justify-between text-[11px] font-data tracking-[0.08em] text-phos-faint"><span>MEDIAMTX</span><span className="flex items-center gap-1 text-sig-green"><span className="lamp-green" />ONLN</span></div><div className="mt-1 font-data text-lg text-phos-white">{serverStats.version}</div></div>
                <div className="border border-grid-line p-2"><div className="text-[11px] font-data tracking-[0.08em] text-phos-faint">UPTIME</div><div className="mt-1 font-data text-lg text-phos-white">{uptimeSeconds>0?fmtUptime(uptimeSeconds):serverStats.uptime}</div></div>
                <div className="border border-grid-line p-2"><div className="text-[11px] font-data tracking-[0.08em] text-phos-faint">CONNECTIONS</div><div className="mt-1 font-data text-lg text-phos-white">{serverStats.connections} CLIENTS</div></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-2">
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ AUTHENTICATION ]</div>
              <div className="space-y-1.5">
                {[{l:"REQUIRE KEY VALIDATION",d:"Webhook auth before ingest",c:true},{l:"IP WHITELIST ENFORCEMENT",d:"Restrict by IP",c:false}].map(i => (
                  <div key={i.l} className="flex items-center justify-between border border-grid-line px-2 py-2"><div><Label className="text-xs">{i.l}</Label><p className="text-[11px] text-phos-faint">{i.d}</p></div><Switch checked={i.c} disabled={i.c} /></div>
                ))}
              </div>
            </div>
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ API KEYS ]</div>
              <div className="space-y-2">
                {[{l:"PUBLIC KEY",k:"pk_live_abc123def456ghi789jkl012",ck:"pub"},{l:"SECRET KEY",k:"sk_live_••••••••••••••••••••••••",ck:"sec"}].map(item => (
                  <div key={item.ck} className="flex items-center justify-between border border-grid-line px-2 py-2"><div className="min-w-0 flex-1"><Label className="text-xs">{item.l}</Label><div className="mt-1 flex items-center gap-1"><code className="text-xs font-data text-phos-white/70 truncate">{item.k}</code><Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copier(item.k, item.ck)}>{copied===item.ck?<Check className="h-3 w-3 text-sig-green" />:<Copy className="h-3 w-3" />}</Button></div></div><Button variant="outline" size="sm" onClick={() => alert("Regenerated!")} className="shrink-0 ml-2"><RefreshCw className="h-3 w-3" />REGEN</Button></div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="database" className="space-y-2">
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ POSTGRESQL CONNECTION ]</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{l:"HOST",v:"postgres"},{l:"PORT",v:"5432"},{l:"DATABASE",v:"iris_engine_dev"},{l:"USER",v:"postgres"}].map(f => (
                  <div key={f.l} className="space-y-1"><Label className="text-[11px] font-data tracking-[0.08em]">{f.l}</Label><Input defaultValue={f.v} readOnly className="h-8 text-sm" /></div>
                ))}
              </div>
              <div className="mt-2 text-sm font-data text-sig-green"><span className="lamp-green inline-block mr-1" />CONNECTED</div>
            </div>
            <div className="border border-grid-line bg-crt-panel p-3">
              <div className="text-xs font-data tracking-[0.1em] text-phos-dim mb-3">[ DATABASE STATISTICS ]</div>
              <div className="grid grid-cols-3 gap-2">
                {[{l:"RECORDS",v:dbStats.records.toLocaleString()},{l:"SIZE",v:dbStats.size},{l:"LAST BACKUP",v:dbStats.lastBackup}].map(s => (
                  <div key={s.l} className="border border-grid-line p-2"><div className="text-[11px] font-data tracking-[0.08em] text-phos-faint">{s.l}</div><div className="mt-1 font-data text-lg text-phos-white">{s.v}</div></div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
