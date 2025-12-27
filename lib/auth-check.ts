import { NextRequest, NextResponse } from "next/server";

export function isAuthenticated(req: NextRequest): boolean {
    const value = req.cookies.get('rivon-access')?.value;
    return value === 'true' || value === 'guest';
}

export function isAdmin(req: NextRequest): boolean {
    return req.cookies.get('rivon-access')?.value === 'true';
}

export function unauthorizedResponse() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbiddenResponse() {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
}
