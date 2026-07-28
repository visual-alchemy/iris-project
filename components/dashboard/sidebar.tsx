"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Radio, Menu } from "lucide-react"

const ITEMS = [
  { id: "01", name: "DASH", href: "/" },
  { id: "02", name: "KEYS", href: "/stream-keys" },
  { id: "03", name: "DEST", href: "/destinations" },
  { id: "04", name: "USRS", href: "/users" },
  { id: "05", name: "CONF", href: "/settings" },
]

function RailContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col border-r border-grid-line bg-crt-bg">
      {/* Brand */}
      <div className="flex h-12 items-center justify-center border-b border-grid-line">
        <div className="flex h-7 w-7 items-center justify-center">
          <img src="/IRIS.png" alt="IRIS" className="h-5 w-5 object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 transition-colors group",
                isActive
                  ? "bg-sig-green-dim text-sig-green border-r-2 border-sig-green"
                  : "text-phos-faint hover:bg-crt-field hover:text-phos-dim"
              )}
              title={item.name}
            >
              <span className="text-[12px] font-data tracking-widest leading-none">
                {item.id}
              </span>
              <span className="text-[10px] font-data tracking-[0.15em] leading-none mt-0.5">
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Status lamp */}
      <div className="flex flex-col items-center gap-1 border-t border-grid-line py-3">
        <span className="lamp-green" />
        <span className="text-[10px] font-data tracking-[0.15em] text-phos-faint">ONLN</span>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-14 lg:block">
      <RailContent />
    </aside>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-14 bg-crt-bg p-0 border-r border-grid-line">
        <RailContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
