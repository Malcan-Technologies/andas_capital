import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {
		console.log(
			`[Login Route] Starting login process with backend URL: ${BACKEND_URL}`
		);

		const body = await request.json();
		const { phoneNumber, password } = body;

		// Forward user's IP address for consistent token generation and validation
		const forwardedFor = request.headers.get("x-forwarded-for");
		const realIp = request.headers.get("x-real-ip");
		const clientIp = forwardedFor || realIp || request.headers.get("x-client-ip") || "";

		// Fetch login token first
		let loginToken: string | null = null;
		try {
			const tokenHeaders: Record<string, string> = {
				"Content-Type": "application/json",
			};
			
			// Forward IP address to backend for consistent token storage
			if (clientIp) {
				tokenHeaders["X-Forwarded-For"] = clientIp;
			}

			const tokenResponse = await fetch(`${BACKEND_URL}/api/auth/login-token`, {
				method: "GET",
				headers: tokenHeaders,
				cache: "no-store",
			});

			if (tokenResponse.ok) {
				const tokenData = await tokenResponse.json();
				loginToken = tokenData.loginToken || tokenResponse.headers.get("X-Login-Token");
			} else {
				console.warn("[Login Route] Failed to fetch login token, proceeding without token");
			}
		} catch (tokenError) {
			console.error("[Login Route] Error fetching login token:", tokenError);
			// Continue without token - backend will reject if required
		}

		console.log(
			`[Login Route] Forwarding login request for phone: ${phoneNumber}`
		);

		// Forward the request to the backend API with token
		const loginBody: { phoneNumber: string; password: string; loginToken?: string } = {
			phoneNumber,
			password,
		};

		if (loginToken) {
			loginBody.loginToken = loginToken;
		}

		// Forward IP address to backend for consistent token validation
		const loginHeaders: Record<string, string> = {
			"Content-Type": "application/json",
		};
		
		if (clientIp) {
			loginHeaders["X-Forwarded-For"] = clientIp;
		}
		
		if (loginToken) {
			loginHeaders["X-Login-Token"] = loginToken;
		}

		const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
			method: "POST",
			headers: loginHeaders,
			body: JSON.stringify(loginBody),
			cache: "no-store",
			next: { revalidate: 0 },
		});

		console.log(
			`[Login Route] Received response with status: ${response.status}`
		);

		// Get the response body
		const data = await response.json();
		console.log(
			`[Login Route] Response data:`,
			data.message
				? { message: data.message }
				: { error: data.error || "Unknown error" }
		);

		if (!response.ok) {
			// For phone verification errors, pass through all necessary fields
			if (response.status === 403 && data.requiresPhoneVerification) {
				return NextResponse.json(
					{ 
						message: data.message,
						requiresPhoneVerification: data.requiresPhoneVerification,
						phoneNumber: data.phoneNumber,
						userId: data.userId
					},
					{ status: response.status }
				);
			}
			
			return NextResponse.json(
				{ error: data.message || "Invalid credentials" },
				{ status: response.status }
			);
		}

		// Create response with tokens
		const jsonResponse = NextResponse.json({
			message: data.message,
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
		console.error("[Login Route] Error details:", error);

		// Try to provide more specific error information
		let errorMessage = "Failed to authenticate";
		if (error instanceof Error) {
			errorMessage = `Authentication error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
