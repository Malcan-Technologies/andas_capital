import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Get the pathname of the request
	const path = request.nextUrl.pathname;

	// Check if the path starts with /dashboard
	if (path.startsWith("/dashboard")) {
		// Special handling for KYC routes with temporary tokens
		if (path.startsWith("/dashboard/kyc/")) {
			const kycToken = request.nextUrl.searchParams.get("t");
			if (kycToken) {
				return NextResponse.next();
			} else {
				console.error(`[Middleware] ❌ No KYC token found, continuing to regular auth check`);
			}
		}

		// Get the token from the cookies
		const token = request.cookies.get("token")?.value;
		const refreshToken = request.cookies.get("refreshToken")?.value;

		// If there's no token and no refresh token, redirect to the login page
		if (!token && !refreshToken) {
			// Create a URL for the login page with a redirect back to the dashboard
			const loginUrl = new URL("/login", request.url);
			loginUrl.searchParams.set("redirect", path);

			return NextResponse.redirect(loginUrl);
		}
	}

	// Continue with the request
	return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
	matcher: ["/dashboard/:path*"],
};
