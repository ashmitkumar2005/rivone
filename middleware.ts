import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define protected paths
    const isProtectedPage = path.startsWith('/player') || path.startsWith('/restore')
    const isProtectedApi = path.startsWith('/api') && !path.startsWith('/api/auth')

    if (isProtectedPage || isProtectedApi) {
        const hasAccess = request.cookies.get('rivon-access')?.value === 'true'

        if (!hasAccess) {
            // Return 401 for API calls instead of redirecting
            if (isProtectedApi) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            // Redirect to access page for UI routes
            return NextResponse.redirect(new URL('/access', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/player/:path*', '/restore/:path*', '/api/:path*'],
}
