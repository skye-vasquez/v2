import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Compliance Hub | Metro by T-Mobile',
  description: 'Retail Compliance Management PWA',
  manifest: '/manifest.json',
  themeColor: '#8B5CF6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Compliance Hub',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8B5CF6" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-white">
        {children}
        <Toaster position="top-right" richColors />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((reg) => console.log('SW registered:', reg.scope))
                    .catch((err) => console.log('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
