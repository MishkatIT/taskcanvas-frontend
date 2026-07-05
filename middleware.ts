/**
 * Middleware — fast optimistic redirect only.
 *
 * The REAL auth gate is useAuthGuard in (protected)/layout.tsx.
 * The public landing page / is accessible to all.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/tasks/:path*", "/annotate/:path*"],
};
