import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { initSentry } from './shared/sentry'
import './index.css'
import 'leaflet/dist/leaflet.css'
import App from './App.tsx'

initSentry()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 min — data stays fresh
      gcTime: 10 * 60 * 1000,        // 10 min — cache after unmount
      refetchOnWindowFocus: false,     // no refetch on tab switch
      retry: 1,                        // 1 retry on failure
      refetchOnReconnect: false,       // no refetch on network reconnect
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#fff',
              color: '#334155',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
