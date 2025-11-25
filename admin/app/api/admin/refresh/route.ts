import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { refreshToken } = body;

		if (!refreshToken) {
			console.error("API /admin/refresh - No refresh token provided");
			return NextResponse.json(
				{ error: "Refresh token is required" },
				{ status: 400 }
			);
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL;

		const response = await fetch(`${backendUrl}/api/admin/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
		});

		const data = await response.json();

		if (!response.ok) {
			console.error("API /admin/refresh - Error response:", data.error);
			return NextResponse.json(
				{ error: data.error || "Failed to refresh token" },
				{ status: response.status }
			);
		}

		// Create response with the new tokens
		const jsonResponse = NextResponse.json({
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
		});

		// Set cookies with proper expiration
		// Access token - 15 minutes
		jsonResponse.cookies.set("adminToken", data.accessToken, {
			expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
			maxAge: 15 * 60, // 15 minutes in seconds
			path: "/",
		});

		// Refresh token - 90 days
		jsonResponse.cookies.set("adminRefreshToken", data.refreshToken, {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
			maxAge: 90 * 24 * 60 * 60, // 90 days in seconds as a fallback
			path: "/",
		});

		return jsonResponse;
	} catch (error) {
		console.error("API /admin/refresh - Exception:", error);
		return NextResponse.json(
			{ error: "Failed to refresh token" },
			{ status: 500 }
		);
	}
}
