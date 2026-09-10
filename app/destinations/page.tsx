"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Play, Square, Trash2, Edit, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDestinations, getStreamKeys, createDestination, startDestination, stopDestination, type StreamKey } from "@/lib/api"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/protected-route"

const PLATFORM_CFG: Record<string, string> = { YouTube: "YT", Twitch: "TW", Facebook: "FB", "Twitter/X": "X", "Custom RTMP": "RT", "Custom SRT": "SRT" }
const getPlatformDisplayName = (p: string) => { const l = p?.toLowerCase()||''; if(l==='youtube') return 'YouTube'; if(l==='twitch') return 'Twitch'; if(l==='facebook') return 'Facebook'; if(l==='twitter') return 'Twitter/X'; if(l==='srt') return 'Custom SRT'; return 'Custom RTMP' }
const getPlatformFormValue = (n: string) => { const l = n?.toLowerCase()||''; if(l.includes('youtube')) return 'youtube'; if(l.includes('twitch')) return 'twitch'; if(l.includes('facebook')) return 'facebook'; if(l.includes('twitter')||l.includes('x')) return 'twitter'; if(l.includes('srt')) return 'srt'; return 'custom' }

interface DestinationRow {
  id: string
  name: string
  platform: string
  rtmpUrl: string
  streamKeyRef: string
  status: string
  streamKeyId: string
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationRow[]>([])
  const [streamKeys, setStreamKeys] = useState<StreamKey[]>([])
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [fName, setFName] = useState(""); const [fPlatform, setFPlatform] = useState("youtube"); const [fUrl, setFUrl] = useState(""); const [fKeyId, setFKeyId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editOpen, setEditOpen] = useState(false); const [eId, setEId] = useState(""); const [eName, setEName] = useState(""); const [ePlatform, setEPlatform] = useState("youtube"); const [eUrl, setEUrl] = useState(""); const [eKeyId, setEKeyId] = useState("")

  const fetchData = async () => {
    const [d, k] = await Promise.all([getDestinations(), getStreamKeys()])
    setStreamKeys(k)
    setDestinations(d.map((x) => {
      const mk = k.find((kk) => String(kk.id) === String(x.stream_key_id))
      return { id: String(x.id), name: x.name, platform: getPlatformDisplayName(x.platform), rtmpUrl: x.url, streamKeyRef: mk ? mk.name : `KEY#${x.stream_key_id}`, status: x.status, streamKeyId: String(x.stream_key_id || "") }
    }))
  }

  useEffect(() => { fetchData() }, [])

  const del = async (id: string) => {
    toast.error("Delete this destination?", {
      action: {
        label: "DELETE",
        onClick: async () => {
          try { const { deleteDestination } = await import("@/lib/api"); await deleteDestination(id); setDestinations(prev => prev.filter(d => d.id !== id)); toast.success("Destination deleted") }
          catch(e) { console.error(e); toast.error("Failed to delete destination") }
        },
      },
    })
  }
  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fName.trim() || !fUrl.trim() || !fKeyId) { toast.error("Fill all fields"); return }
    setSubmitting(true)
    try { await createDestination(fName, fPlatform, fUrl, fKeyId); setCreateOpen(false); setFName(""); setFPlatform("youtube"); setFUrl(""); setFKeyId(""); await fetchData() }
    catch(e) { console.error(e); toast.error("Failed to create destination") } finally { setSubmitting(false) }
  }
  const edit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!eName.trim() || !eUrl.trim() || !eKeyId) { toast.error("Fill all fields"); return }
    setSubmitting(true)
    try { const { updateDestination } = await import("@/lib/api"); await updateDestination(eId, eName, ePlatform, eUrl, eKeyId); setEditOpen(false); await fetchData() }
    catch(e) { console.error(e); toast.error("Failed to update destination") } finally { setSubmitting(false) }
  }
  const openEdit = (d: DestinationRow) => { setEId(d.id); setEName(d.name); setEPlatform(getPlatformFormValue(d.platform)); setEUrl(d.rtmpUrl); setEKeyId(d.streamKeyId); setEditOpen(true) }
  const start = async (id: string) => { try { await startDestination(id); await fetchData() } catch(e) { console.error(e); toast.error("Failed to start destination") } }
  const stop = async (id: string) => { try { await stopDestination(id); await fetchData() } catch(e) { console.error(e); toast.error("Failed to stop destination") } }

  const filtered = destinations.filter(d => { const ms = d.name.toLowerCase().includes(search.toLowerCase())||d.platform.toLowerCase().includes(search.toLowerCase()); const mf = filterStatus==="all"||d.status===filterStatus; return ms&&mf })
  const streaming = destinations.filter(d => d.status==="streaming").length
  const errors = destinations.filter(d => d.status==="error").length

  return (
    <ProtectedRoute>
      <DashboardLayout title="DESTINATIONS" description="Manage restream targets">
        <div className="grid grid-cols-3 border border-grid-line mb-2">
          <div className="border-r border-grid-line px-3 py-2"><div className="text-[11px] font-data tracking-[0.1em] text-phos-faint">TOTAL</div><div className="font-data text-lg text-phos-white">{destinations.length}</div></div>
          <div className="border-r border-grid-line px-3 py-2"><div className="text-[11px] font-data tracking-[0.1em] text-phos-faint">STREAMING</div><div className="font-data text-lg text-sig-green">{streaming}</div></div>
          <div className="px-3 py-2"><div className="text-[11px] font-data tracking-[0.1em] text-phos-faint">ERRORS</div><div className="font-data text-lg text-sig-red">{errors}</div></div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div className="flex items-center gap-2">
            <Input placeholder="SEARCH..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-52" />
            <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[120px] text-xs font-data h-9"><SelectValue placeholder="FILTER" /></SelectTrigger><SelectContent>{["all","streaming","ready","error","stopped"].map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}</SelectContent></Select>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5" />ADD TARGET</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg"><form onSubmit={create}><DialogHeader><DialogTitle>ADD DESTINATION</DialogTitle></DialogHeader><div className="space-y-3 py-2"><div className="space-y-1"><Label>Name</Label><Input value={fName} onChange={e => setFName(e.target.value)} required /></div><div className="space-y-1"><Label>Platform</Label><Select value={fPlatform} onValueChange={setFPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["youtube","twitch","facebook","twitter","custom","srt"].map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><Label>URL</Label><Input value={fUrl} onChange={e => setFUrl(e.target.value)} required /></div><div className="space-y-1"><Label>Source Key</Label><Select value={fKeyId} onValueChange={setFKeyId}><SelectTrigger><SelectValue placeholder="SELECT KEY" /></SelectTrigger><SelectContent>{streamKeys.map(k => <SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>CANCEL</Button><Button type="submit" disabled={submitting}>{submitting ? "ADDING..." : "ADD"}</Button></DialogFooter></form></DialogContent>
          </Dialog>
        </div>

        <div className="border border-grid-line bg-crt-panel">
          <div className="grid grid-cols-[1fr_auto] border-b border-grid-line px-2 py-1.5 text-[11px] font-data tracking-[0.1em] text-phos-dim"><span>PIPELINE</span><span className="text-right">STATUS</span></div>
          <div className="divide-y divide-grid-line">
            {filtered.map(d => (
              <div key={d.id} className="flex items-center gap-2 px-2 py-2">
                <span className="text-[11px] font-data text-phos-faint">INGEST</span>
                <span className="text-grid-strong">→</span>
                <span className="flex items-center gap-1 text-xs font-data text-phos-faint"><span className="w-5 h-4 flex items-center justify-center border border-grid-line text-[9px] font-data text-phos-dim">{PLATFORM_CFG[d.platform]||"?"}</span>{d.streamKeyRef}</span>
                <span className="text-grid-strong">→</span>
                <span className="min-w-0 flex-1 text-sm font-data text-phos-white truncate">{d.name}</span>
                <span className="text-grid-strong">→</span>
                <span className="text-[11px] font-data text-phos-faint">TGT</span>
                <span className={cn("inline-flex items-center gap-1 text-[11px] font-data tracking-[0.08em] ml-auto mr-2", d.status==="streaming"?"text-sig-green":d.status==="error"?"text-sig-red":"text-phos-faint")}><span className={cn(d.status==="streaming"?"lamp-green":d.status==="error"?"lamp-red":"lamp-amber")} />{d.status.toUpperCase()}</span>
                <div className="flex items-center gap-1">
                  {d.status==="streaming" ? <Button size="sm" variant="destructive" onClick={() => stop(d.id)}><Square className="h-3 w-3" />STOP</Button> : d.status==="error" ? <Button size="sm" variant="outline" onClick={() => start(d.id)}><RefreshCw className="h-3 w-3" />RETRY</Button> : <Button size="sm" onClick={() => start(d.id)}><Play className="h-3 w-3" />START</Button>}
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="border-grid-strong bg-crt-panel"><DropdownMenuItem onClick={() => openEdit(d)} className="text-xs font-data"><Edit className="mr-1 h-3.5 w-3.5" />EDIT</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => del(d.id)} className="text-xs font-data text-sig-red"><Trash2 className="mr-1 h-3.5 w-3.5" />DELETE</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}><DialogContent className="sm:max-w-lg"><form onSubmit={edit}><DialogHeader><DialogTitle>EDIT DESTINATION</DialogTitle></DialogHeader><div className="space-y-3 py-2"><div className="space-y-1"><Label>Name</Label><Input value={eName} onChange={ee => setEName(ee.target.value)} required /></div><div className="space-y-1"><Label>Platform</Label><Select value={ePlatform} onValueChange={setEPlatform}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["youtube","twitch","facebook","twitter","custom","srt"].map(p => <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}</SelectContent></Select></div><div className="space-y-1"><Label>URL</Label><Input value={eUrl} onChange={ee => setEUrl(ee.target.value)} required /></div><div className="space-y-1"><Label>Source Key</Label><Select value={eKeyId} onValueChange={setEKeyId}><SelectTrigger><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{streamKeys.map(k => <SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>CANCEL</Button><Button type="submit" disabled={submitting}>{submitting ? "SAVING..." : "SAVE"}</Button></DialogFooter></form></DialogContent></Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
