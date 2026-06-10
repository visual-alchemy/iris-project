"use client"

import { useEffect, useRef } from "react"
import Hls from "hls.js"

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

        let hls: Hls

        if (Hls.isSupported()) {
            hls = new Hls()
            hls.loadSource(url)
            hls.attachMedia(video)
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
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

        return () => {
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
