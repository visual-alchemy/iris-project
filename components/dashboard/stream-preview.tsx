"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HlsPlayer } from "@/components/hls-player"
import { copyToClipboard as copyText } from "@/lib/clipboard"
import { Play, Pause, Volume2, VolumeX, Copy, Check, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Stream {
  id: string
  name: string
  streamKey: string
  status: "live" | "starting" | "stopping"
  bitrate: string
  viewers: number
  duration: string
  targets: number
  readyTime?: string | null
}

interface StreamPreviewProps {
  stream: Stream | null
  compact?: boolean
}

export function StreamPreview({ stream, compact }: StreamPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const isLive = stream?.status === "live"

  const getMediaHost = () => {
    if (typeof window === "undefined") return "localhost"
    return window.location.hostname
  }

  const playbackUrls = stream
    ? {
      RTMP: `rtmp://${getMediaHost()}:1935/live/${stream.streamKey}`,
      HLS: `http://${getMediaHost()}:8888/live/${stream.streamKey}/index.m3u8`,
      WEBRTC: `http://${getMediaHost()}:8889/live/${stream.streamKey}`,
      FLV: `http://${getMediaHost()}:8888/live/${stream.streamKey}.flv`,
      SRT: `srt://${getMediaHost()}:8890?streamid=read:live/${stream.streamKey}`,
    }
    : null

  const copyToClipboard = (url: string, type: string) => {
    copyText(url)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className={cn("border border-grid-line bg-crt-panel", compact ? "flex flex-col min-h-0" : "")}>
      {/* Video */}
      <div className={cn("relative bg-black overflow-hidden", compact ? "shrink-0 aspect-video max-h-[44vh]" : "aspect-video")}>
        {stream && isLive && playbackUrls ? (
          <>
            <HlsPlayer url={playbackUrls.HLS} isPlaying={isPlaying} isMuted={isMuted} className="h-full w-full object-contain" />
            <div className="absolute left-2 top-2 flex items-center gap-2">
              <span className="flex items-center gap-1 bg-sig-green text-crt-bg px-2 py-0.5 text-xs font-data tracking-[0.1em]">
                <span className="inline-block h-1.5 w-1.5 bg-crt-bg animate-pulse" />
                LIVE
              </span>
              <span className="text-xs font-data text-white/50">
                {stream.viewers.toLocaleString()} VIEWERS
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/15" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/15" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <span className="text-xs font-data text-white/40">{stream.bitrate}</span>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Radio className="mx-auto h-8 w-8 text-phos-faint/30" />
              <p className="mt-2 text-[11px] font-data tracking-[0.1em] text-phos-faint">
                {stream ? "NO SIGNAL" : "NO STREAM SELECTED"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URLs */}
      <div className={cn("border-t border-grid-line", compact ? "flex-1 min-h-0 overflow-auto" : "")}>
        <div className="flex items-center justify-between border-b border-grid-line px-2 py-1.5">
          <span className="text-[11px] font-data tracking-[0.1em] text-phos-dim">
            [ PLAYBACK URLS ]
          </span>
          <span className={cn("text-[11px] font-data tracking-[0.08em]", isLive ? "text-sig-green" : "text-phos-faint")}>
            {isLive ? ">>> ACTIVE" : "--- INACTIVE"}
          </span>
        </div>
        <div className="divide-y divide-grid-line">
          {playbackUrls
            ? Object.entries(playbackUrls).map(([type, url]) => (
                <div key={type} className="flex items-center gap-2 px-2 py-1">
                  <span className="w-14 shrink-0 text-[10px] font-data tracking-[0.1em] text-phos-dim">{type}</span>
                  <code className="min-w-0 flex-1 truncate text-[11px] font-data text-phos-white/70">{url}</code>
                  <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => copyToClipboard(url, type)}>
                    {copied === type ? <Check className="h-3 w-3 text-sig-green" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              ))
            : ["RTMP", "HLS", "WEBRTC", "FLV", "SRT"].map((type) => (
                <div key={type} className="flex items-center gap-2 px-2 py-1">
                  <span className="w-14 shrink-0 text-[10px] font-data tracking-[0.1em] text-phos-faint/40">{type}</span>
                  <span className="flex-1 text-[11px] font-data text-phos-faint/30 italic">---</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}
