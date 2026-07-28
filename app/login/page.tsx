"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { login } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  username: z.string().min(1, "REQUIRED"),
  password: z.string().min(1, "REQUIRED"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login: setAuthSession } = useAuth()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const response = await login(data.username, data.password)
      setAuthSession(response.token, response.user)
    } catch {
      setError("AUTHENTICATION FAILED // INVALID CREDENTIALS")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-crt-bg font-mono">
      <div className="flex h-8 items-center gap-3 border-b border-grid-line px-4 text-[12px] font-data tracking-[0.08em] text-phos-faint">
        <span>[ I.R.I.S. TERMINAL ]</span>
        <span className="text-phos-dim">|</span>
        <span>REV 3.2</span>
        <span className="text-phos-dim">|</span>
        <span className="flex items-center gap-1.5"><span className="lamp-green" />SYS:ONLN</span>
        <span className="ml-auto">SECURE AUTH</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-[520px] border border-grid-strong bg-crt-panel">
          <div className="flex items-center justify-between border-b border-grid-line px-4 py-2">
            <span className="text-xs font-data tracking-[0.1em] text-phos-dim">AUTHENTICATION // OPERATOR LOGIN</span>
            <span className="flex items-center gap-1.5 text-xs font-data tracking-[0.08em] text-phos-faint">
              <span className="lamp-amber" />AWAIT
            </span>
          </div>

          <div className="border-b border-grid-line px-6 py-8">
            <div className="space-y-1">
              <div className="text-xs font-data tracking-[0.12em] text-phos-dim">INGEST & REDISTRIBUTION INTEGRATED STREAMING</div>
              <h1 className="font-heading text-[clamp(2.5rem,8vw,4rem)] leading-[0.85] tracking-[-0.04em] text-phos-white">I.R.I.S.</h1>
              <div className="flex items-center gap-3 text-xs font-data tracking-[0.08em] text-phos-faint">
                <span>ZERO-TRANSCODE GATEWAY</span>
                <span className="text-grid-strong">|</span>
                <span>MULTI-PROTOCOL PLAYBACK</span>
                <span className="text-grid-strong">|</span>
                <span>UNLIMITED RESTREAM</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-grid-line text-center divide-x divide-grid-line">
            {[["PORT","1935"],["HLS","8888"],["WTRC","8889"],["SRT","8890"]].map(([label, val]) => (
              <div key={label} className="py-3">
                <div className="text-[11px] font-data tracking-[0.12em] text-phos-faint">{label}</div>
                <div className="mt-1 font-data text-sm text-phos-white">{val}</div>
              </div>
            ))}
          </div>

          <div className="px-6 py-6">
            <div className="mb-4 text-xs font-data tracking-[0.1em] text-phos-dim">ENTER CREDENTIALS TO CONTINUE</div>
            {error && (
              <div className="mb-4 border border-sig-red bg-sig-red-dim px-3 py-2">
                <span className="text-xs font-data tracking-[0.08em] text-sig-red">{error}</span>
              </div>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-data tracking-[0.1em] text-phos-dim">USERNAME</label>
                <Input placeholder="operator" className="h-9" {...form.register("username")} />
                {form.formState.errors.username && (
                  <p className="mt-1 text-[11px] text-sig-red">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-data tracking-[0.1em] text-phos-dim">PASSPHRASE</label>
                <Input type="password" placeholder="········" className="h-9" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="mt-1 text-[11px] text-sig-red">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-data tracking-[0.08em] text-phos-faint">DEMO: admin / password</span>
                <Button type="submit" disabled={isLoading} className="h-9 px-6">
                  {isLoading ? "AUTHENTICATING..." : "AUTHENTICATE >>>"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="flex h-8 items-center justify-center border-t border-grid-line text-[11px] font-data tracking-[0.1em] text-phos-faint">
        CLASSIFIED // INTERNAL USE ONLY // REV 3.2
      </div>
    </div>
  )
}
