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
    if (typeof window !== 'undefined') {
      const activeKey = apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY
      const activeHost = apiHost || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

      if (activeKey) {
        posthog.init(activeKey, {
          api_host: activeHost,
          person_profiles: 'always',
        })
      }
    }
  }, [apiKey, apiHost])


  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}

