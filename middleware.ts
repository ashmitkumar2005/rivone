import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isProtectedPath = path.startsWith('/player') || path.startsWith('/restore')

    if (isProtectedPath) {
        const hasAccess = request.cookies.get('rivon-access')?.value === 'true'

        if (!hasAccess) {
            return NextResponse.redirect(new URL('/access', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/player/:path*', '/restore/:path*'],
}
