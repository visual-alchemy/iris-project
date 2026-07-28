"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getDestinations } from "@/lib/api"

interface Destination {
  id: string
  name: string
  url: string
  status: string
}

const STATUS: Record<string, { label: string; lamp: "green" | "amber" | "red" }> = {
  streaming: { label: "STREAMING", lamp: "green" },
  ready: { label: "READY", lamp: "amber" },
  active: { label: "ACTIVE", lamp: "green" },
  inactive: { label: "INACTIVE", lamp: "amber" },
  error: { label: "ERROR", lamp: "red" },
  stopped: { label: "STOPPED", lamp: "amber" },
}

export function DestinationsStatus() {
  const [destinations, setDestinations] = useState<Destination[]>([])

  useEffect(() => { getDestinations().then(setDestinations) }, [])

  const getStatus = (s: string) => STATUS[s] || STATUS.inactive

  return (
    <div className="border border-grid-line bg-crt-panel h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-grid-line px-2 py-1.5 shrink-0">
        <span className="text-xs font-data tracking-[0.1em] text-phos-dim">[ STREAM TARGETS ]</span>
        <span className="text-xs font-data text-phos-faint">{destinations.length} LINK</span>
      </div>
      <div className="divide-y divide-grid-line flex-1 overflow-auto">
        {destinations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-xs font-data tracking-[0.1em] text-phos-faint/40">NO DESTINATIONS CONFIGURED</span>
          </div>
        ) : (
          destinations.map((d) => {
            const s = getStatus(d.status)
            return (
              <div key={d.id} className="flex items-center gap-2 px-2 py-2">
                <span className="text-[11px] font-data tracking-[0.08em] text-phos-faint">INGEST</span>
                <span className="text-grid-strong">→</span>
                <span className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-data text-phos-white truncate">{d.name}</span>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-data tracking-[0.08em]",
                      s.lamp === "green" ? "text-sig-green" : s.lamp === "red" ? "text-sig-red" : "text-phos-faint"
                    )}>
                      <span className={cn(s.lamp === "green" ? "lamp-green" : s.lamp === "red" ? "lamp-red" : "lamp-amber")} />
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-0.5 font-data text-[11px] text-phos-faint/50 truncate">{d.url}</div>
                </span>
                <span className="text-[11px] font-data tracking-[0.08em] text-phos-faint">TGT</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
