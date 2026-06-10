"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Key,
  Send,
  Users,
  Settings,
  Radio,
  Menu,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Stream Keys", href: "/stream-keys", icon: Key },
  { name: "Destinations", href: "/destinations", icon: Send },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center">
          <img src="/IRIS.png" alt="IRIS Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            I.R.I.S.
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Streaming Gateway
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Main
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Status indicator */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-3">
          <div className="relative">
            <Radio className="h-4 w-4 text-primary" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground">
              MediaMTX Online
            </span>
            <span className="text-[10px] text-muted-foreground">
              Port 1935 Active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar lg:block">
      <SidebarContent />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
