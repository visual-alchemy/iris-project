"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StreamPreview, type Stream } from "@/components/dashboard/stream-preview"
import { ActiveStreams } from "@/components/dashboard/active-streams"
import { DestinationsStatus } from "@/components/dashboard/destinations-status"
import { getStreams, getDashboardStats, type DashboardStats } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let mounted = true
    Promise.all([getStreams(), getDashboardStats()]).then(([s, st]) => {
      if (mounted) { setStreams(s); if (s.length > 0) setSelectedStream(s[0]); setStats(st) }
    })
    return () => { mounted = false }
  }, [])

  return (
    <ProtectedRoute>
      <DashboardLayout title="DASHBOARD" description="System telemetry overview">
        <div className="flex flex-col gap-1 h-[calc(100vh-7rem)]">
          {/* Telemetry strip */}
          <div className="grid grid-cols-4 border border-grid-line shrink-0">
            {[
              { label: "ACTIVE STREAMS", value: stats?.streams?.total ?? 0, sub: "LIVE INGEST" },
              { label: "STREAM KEYS", value: stats?.keys?.total ?? 0, sub: `${stats?.keys?.active ?? 0} ACTIVE` },
              { label: "DESTINATIONS", value: stats?.destinations?.total ?? 0, sub: `${stats?.destinations?.streaming ?? 0} STREAMING` },
              { label: "OPERATORS", value: stats?.users?.total ?? 1, sub: "AUTHORIZED" },
            ].map((item, i) => (
              <div key={item.label} className={`border-grid-line px-3 py-1.5 ${i < 3 ? 'border-r' : ''}`}>
                <div className="text-[11px] font-data tracking-[0.1em] text-phos-faint">{item.label}</div>
                <div className="font-data text-xl text-phos-white">{item.value}</div>
                <div className="text-[11px] font-data tracking-[0.08em] text-phos-dim">{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Main grid: player+URLs (left) | streams+destinations (right) */}
          <div className="grid grid-cols-[1fr_1fr] gap-1 flex-1 min-h-0">
            {/* Left column */}
            <div className="flex flex-col gap-1 min-h-0">
              <StreamPreview stream={selectedStream} compact />
            </div>
            {/* Right column */}
            <div className="flex flex-col gap-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-auto">
                <ActiveStreams streams={streams} selectedStream={selectedStream} onSelectStream={setSelectedStream} />
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                <DestinationsStatus />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
