import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'I.R.I.S. - Ingest & Redistribution Integrated Streaming',
  description: 'Scalable RTMP ingest and redistribution gateway for broadcasters',
  icons: {
    icon: '/IRIS.png',
    apple: '/IRIS.png',
  },
}

import { AuthProvider } from "@/lib/auth"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
