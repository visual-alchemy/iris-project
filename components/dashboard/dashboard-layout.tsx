"use client"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-crt-bg">
      <Sidebar />
      <div className="lg:pl-14">
        <Header title={title} description={description} />
        <main className="p-2">{children}</main>
      </div>
    </div>
  )
}
