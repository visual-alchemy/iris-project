"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatCard } from "@/components/dashboard/stat-card"
import { StreamPreview, type Stream } from "@/components/dashboard/stream-preview"
import { ActiveStreams } from "@/components/dashboard/active-streams"
import { DestinationsStatus } from "@/components/dashboard/destinations-status"
import { Radio, Key, Send, Users } from "lucide-react"

import { getStreams, getDashboardStats } from "@/lib/api"

import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  const [streams, setStreams] = useState<Stream[]>([])
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    Promise.all([getStreams(), getDashboardStats()]).then(([streamsData, statsData]) => {
      if (mounted) {
        setStreams(streamsData)
        if (streamsData.length > 0) setSelectedStream(streamsData[0])
        setStats(statsData)
        setIsLoading(false)
      }
    })

    return () => { mounted = false }
  }, [])

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="Dashboard"
        description="Overview of your streaming infrastructure"
      >
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Streams"
            value={stats?.streams.total || 0}
            description="Currently broadcasting"
            icon={Radio}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Stream Keys"
            value={stats?.keys.total || 0}
            description={`${stats?.keys.active || 0} currently active`}
            icon={Key}
          />
          <StatCard
            title="Destinations"
            value={stats?.destinations.total || 0}
            description={`${stats?.destinations.streaming || 0} streaming, ${stats?.destinations.idle || 0} idle`}
            icon={Send}
          />
        </div>

        {/* Main Content Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Stream Preview */}
          <StreamPreview stream={selectedStream} />

          {/* Active Streams */}
          <ActiveStreams
            streams={streams}
            selectedStream={selectedStream}
            onSelectStream={setSelectedStream}
          />
        </div>

        {/* Destinations */}
        <div className="mt-6">
          <DestinationsStatus />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
