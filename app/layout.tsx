import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { getServerSession } from "next-auth/next"


const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: "ModernShop - Modern E-Commerce Platform",
    template: "%s | ModernShop"
  },
  description: "A modern, fast, and secure e-commerce platform built with Next.js, featuring seamless shopping experiences and powerful admin tools.",
  keywords: ["e-commerce", "online shopping", "modern", "next.js", "react"],
  authors: [{ name: "ModernShop Team" }],
  creator: "ModernShop",
  publisher: "ModernShop",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "ModernShop",
    title: "ModernShop - Modern E-Commerce Platform",
    description: "Discover amazing products with our modern e-commerce platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ModernShop - Modern E-Commerce Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ModernShop - Modern E-Commerce Platform",
    description: "Discover amazing products with our modern e-commerce platform",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getServerSession()

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
          storageKey="modernshop-theme"
        >
          <div className="relative flex min-h-screen flex-col">
            <Header session={session} />
            <main className="flex-1 relative">
              {children}
            </main>
       
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}