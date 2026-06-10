"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} description={description} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
