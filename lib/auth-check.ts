import { NextRequest, NextResponse } from "next/server";

export function isAuthenticated(req: NextRequest): boolean {
    return req.cookies.get('rivon-access')?.value === 'true';
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
