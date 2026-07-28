"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Trash2 } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface User { id: string; username: string; createdAt: string }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    (async () => {
      try { const { getUsers } = await import("@/lib/api"); setUsers(await getUsers()) }
      catch(e) { console.error(e) }
    })()
  }, [])

  const create = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return
    setSubmitting(true)
    try {
      const { createUser } = await import("@/lib/api")
      const r = await createUser(newUsername, newPassword)
      setUsers(prev => [...prev, { id: String(r.data.id), username: r.data.username, createdAt: r.data.inserted_at || new Date().toISOString() }])
      setDialogOpen(false); setNewUsername(""); setNewPassword("")
    } catch(e) { console.error(e) } finally { setSubmitting(false) }
  }

  const del = async (id: string) => {
    if (!confirm("Delete this user?")) return
    try { const { deleteUser } = await import("@/lib/api"); await deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)) }
    catch(e) { alert("Failed"); console.error(e) }
  }

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <ProtectedRoute>
      <DashboardLayout title="USERS" description="Operator credentials">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
          <Input placeholder="SEARCH USERS..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-52" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5" />ADD USER</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>CREATE OPERATOR</DialogTitle><DialogDescription>Add a new dashboard operator.</DialogDescription></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1"><Label>USERNAME</Label><Input placeholder="OPERATOR_ID" value={newUsername} onChange={e => setNewUsername(e.target.value)} /></div>
              <div className="space-y-1"><Label>PASSPHRASE</Label><Input type="password" placeholder="········" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>CANCEL</Button><Button onClick={create} disabled={submitting || !newUsername.trim() || !newPassword.trim()}>{submitting ? "CREATING..." : "CREATE"}</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>

        <div className="border border-grid-line bg-crt-panel">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] border-b border-grid-line px-2 py-1.5 text-[11px] font-data tracking-[0.1em] text-phos-dim">
            <span>OPERATOR</span><span>ROLE</span><span>ADDED</span><span></span>
          </div>
          <div className="divide-y divide-grid-line">
            {filtered.map((u, i) => (
              <div key={u.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center px-2 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-data text-phos-faint">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-sm font-data text-phos-white">{u.username}</span>
                </div>
                <span className="text-sm font-data text-phos-dim">ADMIN</span>
                <span className="text-sm font-data text-phos-faint">{new Date(u.createdAt).toLocaleDateString()}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-grid-strong bg-crt-panel">
                    <DropdownMenuItem onClick={() => del(u.id)} className="text-xs font-data text-sig-red"><Trash2 className="mr-1 h-3.5 w-3.5" />DELETE</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs font-data text-phos-faint/40">NO USERS FOUND</div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
