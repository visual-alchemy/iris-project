"use client"

import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileSidebar } from "./sidebar"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [time, setTime] = useState("")
  const [uptime, setUptime] = useState("00:00:00")

  useEffect(() => {
    setTime(new Date().toTimeString().slice(0, 8))
    const t = setInterval(() => setTime(new Date().toTimeString().slice(0, 8)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const start = Date.now()
    const u = setInterval(() => {
      const d = new Date(Date.now() - start)
      setUptime(
        [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
          .map(v => String(v).padStart(2, "0"))
          .join(":")
      )
    }, 1000)
    return () => clearInterval(u)
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-grid-line bg-crt-bg/95 backdrop-blur-sm">
      {/* Status strip */}
      <div className="flex h-8 items-center gap-3 border-b border-grid-line px-3 text-[12px] font-data tracking-[0.08em] text-phos-faint">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="lamp-green" />
            INGEST:1935
          </span>
          <span className="text-phos-dim">|</span>
          <span className="flex items-center gap-1.5">
            <span className="lamp-green" />
            MTX:ONLN
          </span>
          <span className="text-phos-dim">|</span>
          <span className="flex items-center gap-1.5">
            <span className="lamp-green" />
            API:4000
          </span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span>UPT: {uptime}</span>
          <span className="text-phos-dim">|</span>
          <span>SYS: {time}</span>
          <span className="text-phos-dim">|</span>
          <span>UNIT: S00-{user?.username?.slice(0, 4).toUpperCase() || "OP01"}</span>
        </div>
      </div>

      {/* Title bar */}
      <div className="flex h-8 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <span className="text-sm font-heading tracking-tighter text-phos-white">
            {title.toUpperCase()}
          </span>
          {description && (
            <span className="hidden sm:inline text-xs font-data tracking-[0.06em] text-phos-dim">
              // {description}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-[9px] tracking-[0.12em] text-phos-dim hover:text-sig-red"
          onClick={() => logout()}
        >
          <LogOut className="h-3 w-3" />
          SIGNOUT
        </Button>
      </div>
    </header>
  )
}
