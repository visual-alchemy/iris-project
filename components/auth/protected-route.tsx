"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-crt-bg font-mono">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sig-green" />
                    <span className="text-xs font-data tracking-[0.12em] text-phos-faint">
                        INITIALIZING SYSTEM...
                    </span>
                </div>
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}
