"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, ExternalLink, Square, Play } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    const now = Date.now()
    const diffSec = Math.max(0, Math.floor((now - start) / 1000))
    const h = Math.floor(diffSec / 3600)
    const m = Math.floor((diffSec % 3600) / 60)
    const s = diffSec % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  } catch {
    return "00:00:00"
  }
}

export function ActiveStreams({
  streams,
  selectedStream,
  onSelectStream,
}: ActiveStreamsProps) {
  const [, setTick] = useState(0)

  // Tick every second to update real-time durations
  useEffect(() => {
    if (streams.length === 0) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [streams.length])

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Active Streams</h3>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <div className="divide-y divide-border">
        {streams.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">No active streams</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Streams will appear here when they go live
              </p>
            </div>
          </div>
        ) : (
          streams.map((stream) => {
            const isSelected = selectedStream?.id === stream.id
            return (
              <div
                key={stream.id}
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer transition-colors",
                  isSelected
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-secondary/50"
                )}
                onClick={() => onSelectStream(stream)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className={cn(
                        "h-12 w-20 rounded-md flex items-center justify-center",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <Play
                        className={cn(
                          "h-4 w-4",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <Badge className="absolute -right-1 -top-1 h-5 bg-destructive text-[10px] text-destructive-foreground">
                      LIVE
                    </Badge>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {stream.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{stream.streamKey}</span>
                      <span>{stream.bitrate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-mono text-foreground">
                      {formatDuration(stream.readyTime)}
                    </p>
                    <p className="text-xs text-muted-foreground">duration</p>
                  </div>
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-foreground">
                      {stream.targets}
                    </p>
                    <p className="text-xs text-muted-foreground">targets</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectStream(stream)
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Preview Stream
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop Stream
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
