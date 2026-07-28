"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Stream } from "./stream-preview"

interface ActiveStreamsProps {
  streams: Stream[]
  selectedStream: Stream | null
  onSelectStream: (stream: Stream) => void
}

function formatDuration(readyTime: string | null | undefined): string {
  if (!readyTime) return "00:00:00"
  try {
    const start = new Date(readyTime).getTime()
    const diffSec = Math.max(0, Math.floor((Date.now() - start) / 1000))
    const h = Math.floor(diffSec / 3600)
    const m = Math.floor((diffSec % 3600) / 60)
    const s = diffSec % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  } catch { return "00:00:00" }
}

export function ActiveStreams({ streams, selectedStream, onSelectStream }: ActiveStreamsProps) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (streams.length === 0) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [streams.length])

  return (
    <div className="border border-grid-line bg-crt-panel h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-grid-line px-2 py-1.5 shrink-0">
        <span className="text-xs font-data tracking-[0.1em] text-phos-dim">[ STREAMS ]</span>
        <span className="text-xs font-data text-phos-faint">{streams.length} UNIT{streams.length !== 1 ? "S" : ""}</span>
      </div>
      <div className="divide-y divide-grid-line flex-1 overflow-auto">
        {streams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-xs font-data tracking-[0.1em] text-phos-faint/40">NO ACTIVE STREAMS</span>
            <span className="mt-1 text-[11px] font-data tracking-[0.1em] text-phos-faint/30">AWAITING INGEST</span>
          </div>
        ) : (
          streams.map((stream, i) => {
            const isSelected = selectedStream?.id === stream.id
            return (
              <div
                key={stream.id}
                className={cn(
                  "flex items-center justify-between px-2 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-sig-green-dim border-l-2 border-sig-green" : "border-l-2 border-transparent hover:bg-crt-field"
                )}
                onClick={() => onSelectStream(stream)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-data tracking-[0.1em] text-phos-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="lamp-green" />
                    <span className={cn("text-sm font-data truncate", isSelected ? "text-sig-green" : "text-phos-white/80")}>
                      {stream.name}
                    </span>
                  </div>
                  <div className="mt-0.5 ml-6 flex items-center gap-2 text-[11px] font-data">
                    <span className="text-phos-faint">{stream.streamKey}</span>
                    <span className="text-grid-strong">|</span>
                    <span className="text-phos-faint">{stream.bitrate}</span>
                    <span className="text-grid-strong">|</span>
                    <span className="text-phos-faint">{formatDuration(stream.readyTime)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-data text-phos-faint">{stream.viewers}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-grid-strong bg-crt-panel">
                      <DropdownMenuItem className="text-xs font-data text-sig-red" onClick={(e) => e.stopPropagation()}>
                        <Square className="mr-1 h-3 w-3" />
                        STOP STREAM
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
