"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Play, Square, ExternalLink } from "lucide-react"
import { getDestinations } from "@/lib/api"

interface Destination {
  id: string
  name: string
  url: string
  status: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  streaming: {
    label: "Streaming",
    className: "bg-success/10 text-success border-success/20",
  },
  ready: {
    label: "Ready",
    className: "bg-muted text-muted-foreground border-border",
  },
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-border",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  stopped: {
    label: "Stopped",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function DestinationsStatus() {
  const [destinations, setDestinations] = useState<Destination[]>([])

  useEffect(() => {
    getDestinations().then(setDestinations)
  }, [])

  const getStatusConfig = (status: string) =>
    statusConfig[status] || statusConfig.inactive

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Stream Targets</h3>
        <Button variant="outline" size="sm">
          Add Target
        </Button>
      </div>
      <div className="divide-y divide-border">
        {destinations.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground">No destinations configured</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add destinations from the Destinations page
              </p>
            </div>
          </div>
        ) : (
          destinations.map((destination) => (
            <div
              key={destination.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-foreground">
                  {destination.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {destination.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        getStatusConfig(destination.status).className
                      )}
                    >
                      {getStatusConfig(destination.status).label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                    {destination.url}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
