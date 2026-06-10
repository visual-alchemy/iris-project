"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Search,
  MoreVertical,
  Play,
  Square,
  ExternalLink,
  Trash2,
  Edit,
  RefreshCw,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Destination {
  id: string
  name: string
  platform: string
  rtmpUrl: string
  streamKeyRef: string
  status: "streaming" | "ready" | "error" | "stopped"
  viewers?: number
  bitrate?: string
  uptime?: string
  errorMessage?: string
}

import {
  getDestinations,
  getStreamKeys,
  createDestination,
  startDestination,
  stopDestination,
} from "@/lib/api"

const platformConfig: Record<
  string,
  { color: string; icon: string }
> = {
  YouTube: { color: "bg-[#FF0000]", icon: "YT" },
  Twitch: { color: "bg-[#9146FF]", icon: "TW" },
  Facebook: { color: "bg-[#1877F2]", icon: "FB" },
  "Twitter/X": { color: "bg-foreground", icon: "X" },
  "Custom RTMP": { color: "bg-primary", icon: "RT" },
  "Custom SRT": { color: "bg-amber-600", icon: "SRT" },
}

const statusConfig = {
  streaming: {
    label: "Streaming",
    color: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  ready: {
    label: "Ready",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  error: {
    label: "Error",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  stopped: {
    label: "Stopped",
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
}

const getPlatformDisplayName = (plat: string) => {
  const p = plat?.toLowerCase() || '';
  if (p === 'youtube') return 'YouTube';
  if (p === 'twitch') return 'Twitch';
  if (p === 'facebook') return 'Facebook';
  if (p === 'twitter') return 'Twitter/X';
  if (p === 'srt') return 'Custom SRT';
  return 'Custom RTMP';
}

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [streamKeys, setStreamKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Form states
  const [formName, setFormName] = useState("")
  const [formPlatform, setFormPlatform] = useState("youtube")
  const [formUrl, setFormUrl] = useState("")
  const [formStreamKeyId, setFormStreamKeyId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [destData, keyData] = await Promise.all([
        getDestinations(),
        getStreamKeys()
      ])

      setStreamKeys(keyData)

      const mappedDestinations: Destination[] = destData.map((dest: any) => {
        const matchKey = keyData.find((k: any) => k.id.toString() === dest.stream_key_id?.toString())
        const keyName = matchKey ? matchKey.name : `Stream Key #${dest.stream_key_id}`

        return {
          id: dest.id.toString(),
          name: dest.name,
          platform: getPlatformDisplayName(dest.platform),
          rtmpUrl: dest.url,
          streamKeyRef: keyName,
          status: dest.status as "streaming" | "ready" | "error" | "stopped",
        }
      })

      setDestinations(mappedDestinations)
    } catch (err) {
      console.error("Failed to fetch destinations or stream keys:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteDestination = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      const { deleteDestination } = await import("@/lib/api");
      await deleteDestination(id);
      setDestinations(prev => prev.filter(d => d.id.toString() !== id.toString()));
    } catch (err) {
      alert("Failed to delete destination");
      console.error(err);
    }
  }

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formUrl.trim() || !formStreamKeyId) {
      alert("Please fill in all fields and select a source stream key.")
      return
    }

    setIsSubmitting(true)
    try {
      await createDestination(formName, formPlatform, formUrl, formStreamKeyId)
      setCreateDialogOpen(false)
      // Reset form
      setFormName("")
      setFormPlatform("youtube")
      setFormUrl("")
      setFormStreamKeyId("")
      await fetchData()
    } catch (err) {
      alert("Failed to create destination")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartDestination = async (id: string) => {
    try {
      await startDestination(id)
      await fetchData()
    } catch (err) {
      alert("Failed to start streaming to destination")
      console.error(err)
    }
  }

  const handleStopDestination = async (id: string) => {
    try {
      await stopDestination(id)
      await fetchData()
    } catch (err) {
      alert("Failed to stop streaming to destination")
      console.error(err)
    }
  }

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.platform.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === "all" || dest.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: destinations.length,
    streaming: destinations.filter((d) => d.status === "streaming").length,
    ready: destinations.filter((d) => d.status === "ready").length,
    error: destinations.filter((d) => d.status === "error").length,
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Destinations"
        description="Manage your RTMP stream targets"
      >
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Targets</p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streaming</p>
                <p className="text-2xl font-semibold text-success">
                  {stats.streaming}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Play className="h-5 w-5 text-success" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ready</p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.ready}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Square className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-semibold text-destructive">
                  {stats.error}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <RefreshCw className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:w-80"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="streaming">Streaming</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Destination
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <form onSubmit={handleCreateDestination}>
                <DialogHeader>
                  <DialogTitle>Add Stream Destination</DialogTitle>
                  <DialogDescription>
                    Configure a new RTMP or SRT destination to restream your content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="dest-name">Destination Name</Label>
                    <Input
                      id="dest-name"
                      placeholder="e.g., YouTube Main"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={formPlatform} onValueChange={setFormPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitch">Twitch</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="custom">Custom RTMP</SelectItem>
                        <SelectItem value="srt">Custom SRT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rtmp-url">{formPlatform === "srt" ? "SRT URI" : "RTMP URL"}</Label>
                    <Input
                      id="rtmp-url"
                      placeholder={formPlatform === "srt" ? "srt://ip:port or srt://ip:port?streamid=xxx" : "rtmp://a.rtmp.youtube.com/live2/xxxx"}
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {formPlatform === "srt"
                        ? "Full SRT URI (e.g., srt://ip:port or srt://ip:port?streamid=xxx)"
                        : "Full RTMP URL including stream key from your platform"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-key">Source Stream Key</Label>
                    <Select value={formStreamKeyId} onValueChange={setFormStreamKeyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source key" />
                      </SelectTrigger>
                      <SelectContent>
                        {streamKeys.length === 0 ? (
                          <SelectItem value="none" disabled>No active stream keys</SelectItem>
                        ) : (
                          streamKeys.map((sk) => (
                            <SelectItem key={sk.id} value={sk.id}>
                              {sk.name} ({sk.keyString})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Which ingest stream to forward to this destination
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false)
                      setFormName("")
                      setFormPlatform("youtube")
                      setFormUrl("")
                      setFormStreamKeyId("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Destination"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Destinations Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDestinations.map((destination) => {
            const platform = platformConfig[destination.platform] || {
              color: "bg-muted",
              icon: "?",
            }
            const status = statusConfig[destination.status]

            return (
              <Card key={destination.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-foreground",
                          platform.color
                        )}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {destination.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {destination.platform}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", status.color)}
                    >
                      <span
                        className={cn(
                          "mr-1.5 h-1.5 w-1.5 rounded-full",
                          status.dot,
                          destination.status === "streaming" && "animate-pulse"
                        )}
                      />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="font-medium text-foreground">
                        {destination.streamKeyRef}
                      </span>
                    </div>
                    {destination.status === "streaming" && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Viewers:</span>
                          <span className="font-medium text-foreground">
                            {destination.viewers?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Bitrate:</span>
                          <span className="font-medium text-foreground">
                            {destination.bitrate}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-mono text-foreground">
                            {destination.uptime}
                          </span>
                        </div>
                      </>
                    )}
                    {destination.status === "error" && destination.errorMessage && (
                      <div className="rounded-md bg-destructive/10 p-2">
                        <p className="text-xs text-destructive">
                          {destination.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      {destination.status === "streaming" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStopDestination(destination.id)}
                        >
                          <Square className="mr-1.5 h-3.5 w-3.5" />
                          Stop
                        </Button>
                      ) : destination.status === "error" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartDestination(destination.id)}
                        >
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          Retry
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleStartDestination(destination.id)}
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" />
                          Start
                        </Button>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => alert("Edit destination coming soon!")}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert("View on platform coming soon!")}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Platform
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteDestination(destination.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
