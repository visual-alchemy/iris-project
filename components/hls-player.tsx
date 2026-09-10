"use client"

import { useEffect, useRef } from "react"
import type Hls from "hls.js"

interface HlsPlayerProps {
    url: string
    isPlaying: boolean
    isMuted: boolean
    className?: string
}

export function HlsPlayer({ url, isPlaying, isMuted, className }: HlsPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let hls: Hls | null = null
        let cancelled = false

        const load = async () => {
            // Dynamically import hls.js so it is not in the initial bundle
            const { default: HlsModule } = await import("hls.js")
            if (cancelled) return

            if (HlsModule.isSupported()) {
                hls = new HlsModule()
                hls.loadSource(url)
                hls.attachMedia(video)
                hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) {
                        video.play().catch(console.error)
                    }
                })
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                // Native HLS support (Safari)
                video.src = url
                video.addEventListener("loadedmetadata", () => {
                    if (isPlaying) {
                        video.play().catch(console.error)
                    }
                })
            }
        }

        load()

        return () => {
            cancelled = true
            if (hls) {
                hls.destroy()
            }
        }
    }, [url])

    useEffect(() => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.play().catch(console.error)
        } else {
            videoRef.current.pause()
        }
    }, [isPlaying])

    useEffect(() => {
        if (!videoRef.current) return
        videoRef.current.muted = isMuted
    }, [isMuted])

    return (
        <video
            ref={videoRef}
            className={className}
            muted={isMuted}
            playsInline
        />
    )
}
