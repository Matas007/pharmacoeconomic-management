import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farmakoekonominio modeliavimo valdymo sistema',
  description: 'Sistema farmakoekonominio modeliavimo užklausų valdymui',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#2563eb',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Farmakoekonomika',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Farmakoekonomika" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
