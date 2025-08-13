import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { getServerSession } from "next-auth/next"
import { checkAdminAccess } from "@/lib/auth"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    default: "Shop ElBhja - Algerian Store for Signs & More",
    template: "%s | Shop ElBhja"
  },
  description:
    "Shop ElBhja is Algeria’s trusted store for high-quality signs, custom shop boards, LED displays, and more. We deliver premium advertising products that make your business stand out.",
  keywords: [
    "Shop ElBhja",
    "signs Algeria",
    "shop boards Algeria",
    "store signs",
    "custom signs",
    "advertising boards",
    "LED displays",
    "shop decorations",
    "Algeria business signs",
    "لافتات محلات الجزائر",
    "إعلانات المحلات",
    "تصاميم لافتات"
  ],
  authors: [{ name: "Shop ElBhja Team" }],
  creator: "Shop ElBhja",
  publisher: "Shop ElBhja",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  icons: {
    icon: "/logo.ico" // <-- Use your logo instead of favicon
  },
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "/",
    siteName: "Shop ElBhja",
    title: "ElBhja",
    description:
      "Discover Shop ElBhja – Algeria’s go-to store for custom signs, advertising boards, LED displays, and more to make your shop stand out.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Shop ElBhja - Algerian Store for Signs & More"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop ElBhja - Algerian Store for Signs & More",
    description:
      "Your source for custom signs, shop boards, LED displays, and advertising products in Algeria.",
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
    google: process.env.GOOGLE_VERIFICATION_ID
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
  const isadmin = await checkAdminAccess()
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
            <Header session={session} isadmin={isadmin} />
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