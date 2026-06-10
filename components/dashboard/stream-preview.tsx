"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Copy,
  Check,
  Radio,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { HlsPlayer } from "@/components/hls-player"
import { copyToClipboard as copyText } from "@/lib/clipboard"

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
}

export function StreamPreview({ stream }: StreamPreviewProps) {
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
      rtmp: `rtmp://${getMediaHost()}:1935/live/${stream.streamKey}`,
      hls: `http://${getMediaHost()}:8888/live/${stream.streamKey}/index.m3u8`,
      webrtc: `http://${getMediaHost()}:8889/live/${stream.streamKey}`,
      flv: `http://${getMediaHost()}:8888/live/${stream.streamKey}.flv`,
      srt: `srt://${getMediaHost()}:8890?streamid=read:live/${stream.streamKey}`,
    }
    : null

  const copyToClipboard = (url: string, type: string) => {
    copyText(url)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card className="overflow-hidden">
      {/* Video Preview */}
      <div className="relative aspect-video bg-black group text-white">
        {stream && isLive && playbackUrls ? (
          <>
            {/* Actual HLS Video Player */}
            <HlsPlayer
              url={playbackUrls.hls}
              isPlaying={isPlaying}
              isMuted={isMuted}
              className="h-full w-full object-cover"
            />


            {/* Live indicator */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <Badge className="bg-destructive text-destructive-foreground">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-destructive-foreground animate-pulse" />
                LIVE
              </Badge>
            </div>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-foreground hover:bg-foreground/20"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-foreground hover:bg-foreground/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Radio className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {stream ? "Stream is not live" : "Select a stream"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stream ? "Waiting for RTMP connection..." : "Click on an active stream to preview"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Playback URLs */}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">
            Playback URLs
          </h4>
          <Badge
            variant="outline"
            className={cn(
              isLive
                ? "border-success text-success"
                : "border-muted-foreground text-muted-foreground"
            )}
          >
            {isLive ? "Available" : "Inactive"}
          </Badge>
        </div>

        {playbackUrls ? (
          <div className="space-y-2">
            {Object.entries(playbackUrls).map(([type, url]) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-lg bg-secondary p-2"
              >
                <Badge variant="outline" className="w-16 justify-center text-xs uppercase">
                  {type}
                </Badge>
                <code className="flex-1 truncate text-xs text-muted-foreground">
                  {url}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copyToClipboard(url, type)}
                >
                  {copied === type ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {["rtmp", "hls", "webrtc", "flv", "srt"].map((type) => (
              <div
                key={type}
                className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2"
              >
                <Badge variant="outline" className="w-16 justify-center text-xs uppercase opacity-50">
                  {type}
                </Badge>
                <span className="flex-1 text-xs text-muted-foreground/50 italic">
                  Select a stream to view URLs
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
