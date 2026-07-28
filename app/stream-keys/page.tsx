"use client"

import { copyToClipboard as copyText } from "@/lib/clipboard"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Copy, Check, Trash2, RefreshCw, Key } from "lucide-react"
import { cn } from "@/lib/utils"
import { getStreamKeys, createStreamKey, deleteStreamKey, regenerateStreamKey } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StreamKeysPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newActive, setNewActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [host, setHost] = useState("")

  useEffect(() => { setHost(window.location.hostname) }, [])
  useEffect(() => {
    getStreamKeys().then(data => {
      setKeys(data.map((k: any) => ({
        id: k.id, name: k.name, keyString: k.key, status: k.status,
        lastUsed: k.lastUsed, currentStream: k.status === "active"
      })))
    })
  }, [])

  const filtered = keys.filter(k =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.keyString.toLowerCase().includes(search.toLowerCase())
  )

  const copy = (id: string, key: string) => { copyText(key); setCopied(id); setTimeout(() => setCopied(null), 2000) }

  const create = async () => {
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      const r = await createStreamKey(newName, newActive)
      setKeys(prev => [{ id: r.id, name: r.name, keyString: r.key, status: r.status, lastUsed: "Never", currentStream: false }, ...prev])
      setDialogOpen(false); setNewName(""); setNewActive(true)
    } catch(e) { console.error(e) } finally { setSubmitting(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Delete this stream key?")) return
    try { await deleteStreamKey(id); setKeys(prev => prev.filter(k => String(k.id) !== String(id))) }
    catch(e) { alert("Failed"); console.error(e) }
  }

  const regen = async (id: string, name: string) => {
    if (!confirm(`Regenerate key for "${name}"? Old key stops working.`)) return
    try {
      const nk = await regenerateStreamKey(id)
      setKeys(prev => prev.map(k => String(k.id) === String(id) ? {...k, keyString: nk.key, status: nk.status, lastUsed: "Never", currentStream: false} : k))
    } catch(e) { alert("Failed"); console.error(e) }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="STREAM KEYS" description="Manage ingest credentials">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
          <Input placeholder="SEARCH KEYS..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-56" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5" />CREATE KEY</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>CREATE STREAM KEY</DialogTitle><DialogDescription>Generate a new RTMP ingest credential.</DialogDescription></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1"><Label>Key Name</Label><Input placeholder="e.g., MAIN_BROADCAST" value={newName} onChange={e => setNewName(e.target.value)} /></div>
              <div className="flex items-center justify-between border border-grid-line px-3 py-2"><div><Label>Active on creation</Label><p className="text-[11px] text-phos-faint">Enable immediately</p></div><Switch checked={newActive} onCheckedChange={setNewActive} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>CANCEL</Button><Button onClick={create} disabled={submitting || !newName.trim()}>{submitting ? "GENERATING..." : "GENERATE KEY"}</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>

        <div className="border border-grid-line bg-crt-panel">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] border-b border-grid-line px-2 py-1.5 text-[11px] font-data tracking-[0.1em] text-phos-dim">
            <span>NAME</span><span>KEY</span><span>STATUS</span><span>LAST USED</span><span></span>
          </div>
          <div className="divide-y divide-grid-line">
            {filtered.map((k, i) => (
              <div key={k.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] items-center px-2 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-data text-phos-faint">{String(i+1).padStart(2,"0")}</span>
                  <Key className="h-3.5 w-3.5 text-phos-faint" />
                  <span className="text-sm font-data text-phos-white">{k.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <code className="text-xs font-data text-phos-white/70 truncate">{k.keyString}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copy(k.id, k.keyString)}>
                    {copied === k.id ? <Check className="h-3 w-3 text-sig-green" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div>
                  {k.currentStream ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-data tracking-[0.08em] text-sig-green"><span className="lamp-green" />LIVE</span>
                  ) : (
                    <span className={cn("text-[11px] font-data tracking-[0.08em]", k.status === "active" ? "text-sig-green" : "text-phos-faint")}>
                      {k.status === "active" ? ">>> ACTIVE" : "--- INACTIVE"}
                    </span>
                  )}
                </div>
                <span className="text-xs font-data text-phos-faint">{k.lastUsed || "NEVER"}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-grid-strong bg-crt-panel">
                    <DropdownMenuItem onClick={() => regen(k.id, k.name)} className="text-xs font-data"><RefreshCw className="mr-1 h-3.5 w-3.5" />REGENERATE</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => del(k.id)} className="text-xs font-data text-sig-red"><Trash2 className="mr-1 h-3.5 w-3.5" />DELETE</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 border border-grid-line bg-crt-panel p-3">
          <div className="text-[11px] font-data tracking-[0.1em] text-phos-dim mb-2">[ RTMP CONNECTION ]</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-data">
              <span className="w-16 text-phos-faint">SERVER</span>
              <code className="text-phos-white/70">{`rtmp://${host || "<server>"}:1935/live`}</code>
            </div>
            <div className="flex items-center gap-2 text-xs font-data">
              <span className="w-16 text-phos-faint">KEY</span>
              <code className="text-phos-white/70">USE ANY ACTIVE KEY ABOVE</code>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
