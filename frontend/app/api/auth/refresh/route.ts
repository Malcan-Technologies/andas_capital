import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {

		const body = await request.json();
		const { refreshToken } = body;

		if (!refreshToken) {
			return NextResponse.json(
				{ error: "Refresh token is required" },
				{ status: 400 }
			);
		}

		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refreshToken }),
			cache: "no-store",
			next: { revalidate: 0 },
		});

		// Get the response body
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to refresh token" },
				{ status: response.status }
			);
		}

		// Create response with the new tokens
		const jsonResponse = NextResponse.json({
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			isOnboardingComplete: data.isOnboardingComplete,
			onboardingStep: data.onboardingStep,
		});

		// Set cookies with proper expiration
		// Access token - 15 minutes
		jsonResponse.cookies.set("token", data.accessToken, {
			expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
			maxAge: 15 * 60, // 15 minutes in seconds
			path: "/",
		});

		// Refresh token - 90 days
		jsonResponse.cookies.set("refreshToken", data.refreshToken, {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
			maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
			path: "/",
		});

		return jsonResponse;
	} catch (error) {
		console.error("[Refresh Token Route] Error details:", error);

		let errorMessage = "Failed to refresh token";
		if (error instanceof Error) {
			errorMessage = `Refresh token error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
