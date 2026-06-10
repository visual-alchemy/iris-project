"use client"

import { copyToClipboard as copyText } from "@/lib/clipboard"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Search,
  MoreVertical,
  Copy,
  Check,
  Key,
  Trash2,
  RefreshCw,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StreamKey {
  id: string
  name: string
  keyString: string
  status: "active" | "inactive"
  ipWhitelist: string[]
  createdAt: string
  lastUsed: string | null
  currentStream: boolean
}

import { getStreamKeys, createStreamKey, deleteStreamKey, regenerateStreamKey } from "@/lib/api"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StreamKeysPage() {
  const [streamKeys, setStreamKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Dialog Form State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyActive, setNewKeyActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverHost, setServerHost] = useState("")

  useEffect(() => {
    setServerHost(window.location.hostname)
  }, [])

  useEffect(() => {
    let mounted = true
    getStreamKeys().then((data) => {
      if (mounted) {
        // Map API data structure to component's expected structure
        const mappedKeys = data.map((key: any) => ({
          id: key.id,
          name: key.name,
          keyString: key.key,
          status: key.status,
          ipWhitelist: [], // Default to empty based on API structure
          createdAt: new Date().toISOString().split('T')[0], // Add default creation date
          lastUsed: key.lastUsed,
          currentStream: key.status === "active"
        }))
        setStreamKeys(mappedKeys)
        setIsLoading(false)
      }
    })
    return () => { mounted = false }
  }, [])

  const copyKey = (id: string, key: string) => {
    copyText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    setIsSubmitting(true)
    try {
      const response = await createStreamKey(newKeyName, newKeyActive);
      const newKey = response;

      const mappedNewKey = {
        id: newKey.id.toString(),
        name: newKey.name,
        keyString: newKey.key,
        status: newKey.status,
        ipWhitelist: [],
        createdAt: "Just now",
        lastUsed: "Never",
        currentStream: false
      }

      setStreamKeys(prev => [mappedNewKey, ...prev])
      setCreateDialogOpen(false)
      setNewKeyName("")
      setNewKeyActive(true)
    } catch (err) {
      console.error("Failed to create key", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stream key?")) return;
    try {
      await deleteStreamKey(id);
      setStreamKeys(prev => prev.filter(k => k.id.toString() !== id.toString()));
    } catch (err) {
      alert("Failed to delete stream key");
      console.error(err);
    }
  }

  const handleRegenerateKey = async (id: string, name: string) => {
    if (!confirm(`Regenerate the key for "${name}"? The old key will stop working.`)) return;
    try {
      const newKey = await regenerateStreamKey(id);
      setStreamKeys(prev =>
        prev.map(k =>
          k.id.toString() === id.toString()
            ? {
                ...k,
                keyString: newKey.key,
                status: newKey.status,
                lastUsed: "Never",
                currentStream: false
              }
            : k
        )
      );
    } catch (err) {
      alert("Failed to regenerate stream key");
      console.error(err);
    }
  }

  const filteredKeys = streamKeys.filter(
    (key) =>
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.keyString.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Stream Keys"
        description="Manage RTMP stream keys and IP whitelists"
      >
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stream keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:w-80"
            />
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Stream Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Stream Key</DialogTitle>
                <DialogDescription>
                  Generate a new RTMP stream key for your broadcasting software.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Key Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Main Broadcast"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip-whitelist">IP Whitelist (Optional)</Label>
                  <Input
                    id="ip-whitelist"
                    placeholder="e.g., 192.168.1.100, 10.0.0.50"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of allowed IP addresses. Leave empty to
                    allow all.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <Label>Active on Creation</Label>
                    <p className="text-xs text-muted-foreground">
                      Enable this key immediately after creation
                    </p>
                  </div>
                  <Switch
                    checked={newKeyActive}
                    onCheckedChange={setNewKeyActive}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={isSubmitting || !newKeyName.trim()}>
                  {isSubmitting ? "Generating..." : "Generate Key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stream Keys Table */}
        <Card className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stream Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Whitelist</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Key className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Created {key.createdAt}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-secondary px-2 py-1 font-mono text-xs">
                        {key.keyString}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => copyKey(key.id, key.keyString)}
                      >
                        {copiedKey === key.id ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          key.status === "active"
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {key.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                      {key.currentStream && (
                        <Badge className="bg-destructive text-destructive-foreground">
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                          Live
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {key.ipWhitelist.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">
                          {key.ipWhitelist.length} IP
                          {key.ipWhitelist.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        All allowed
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {key.lastUsed || "Never"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert("IP Whitelist editing coming soon!")}>
                          <Shield className="mr-2 h-4 w-4" />
                          Edit Whitelist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerateKey(key.id, key.name)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate Key
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteKey(key.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* RTMP URL Info */}
        <Card className="mt-6 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                RTMP Connection Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure your broadcasting software with the following settings:
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm text-muted-foreground">
                    Server URL:
                  </span>
                  <code className="rounded bg-secondary px-3 py-1.5 font-mono text-sm">
                    {`rtmp://${serverHost || "<server-ip>"}:1935/live`}
                  </code>
                </div>
                <div className="flex items-center gap-4">
                  <span className="w-24 text-sm text-muted-foreground">
                    Stream Key:
                  </span>
                  <code className="rounded bg-secondary px-3 py-1.5 font-mono text-sm">
                    Use any active stream key from the table above
                  </code>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
