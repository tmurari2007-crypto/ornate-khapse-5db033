import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

import { AppShell } from '../components/AppShell'
import { NexusProvider } from '../lib/store'
import '../styles.css'

const siteName = 'NEXUS — Your AI Execution Layer'
const siteDescription =
  'NEXUS turns email, meetings, documents and conversations into approved, executed and verified actions.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#0c0b0a' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

function RootComponent() {
  return (
    <NexusProvider>
      <AppShell>
        <Outlet />
      </AppShell>
    </NexusProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
