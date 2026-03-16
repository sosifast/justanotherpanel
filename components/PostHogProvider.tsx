'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

export function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      })

      return () => {
        posthog.capture('$pageleave', {
          '$current_url': url,
        })
      }
    }
  }, [pathname, searchParams])

  return null
}

export function PHProvider({ 
  children, 
  apiKey, 
  apiHost 
}: { 
  children: React.ReactNode,
  apiKey?: string,
  apiHost?: string
}) {
  const pathname = usePathname()

  useEffect(() => {
    if (apiKey && typeof window !== 'undefined') {
      posthog.init(apiKey, {
        api_host: apiHost || 'https://us.i.posthog.com',
        person_profiles: 'always',
        capture_pageview: false 
      })
    } else if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
       posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'always',
        capture_pageview: false 
      })
    }
  }, [apiKey, apiHost])

  // Skip PostHog for admin routes
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}

