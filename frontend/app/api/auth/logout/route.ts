import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {

		// Get the authorization header
		const authHeader = request.headers.get("authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{ message: "Logged out" },
				{ status: 200 }
			);
		}

		// Forward the logout request to the backend API
		try {
			await fetch(`${BACKEND_URL}/api/auth/logout`, {
				method: "POST",
				headers: {
					Authorization: authHeader,
				},
				cache: "no-store",
			});

		} catch (error) {
			console.error(
				"[Logout Route] Error invalidating token on server:",
				error
			);
			// Even if server-side logout fails, we still want to clear client-side tokens
		}

		return NextResponse.json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("[Logout Route] Error details:", error);
		// Even if there's an error, return success since client-side tokens will be cleared
		return NextResponse.json({ message: "Logged out" });
	}
}
