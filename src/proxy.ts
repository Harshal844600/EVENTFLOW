import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// These routes don't require authentication
const isPublicRoute = createRouteMatcher([
  '/', 
  '/events(.*)', 
  '/about(.*)',
  '/api/webhooks(.*)',
  '/api/upload/presigned-url(.*)',
  '/auth(.*)'
])

const clerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export function proxy(request: any, event: any) {
  return clerk(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
