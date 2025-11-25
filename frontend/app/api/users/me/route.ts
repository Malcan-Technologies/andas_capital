import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get("authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.error("Users/me - Invalid auth header format");
			return NextResponse.json(
				{ error: "Invalid authorization header" },
				{ status: 401 }
			);
		}

		// Forward the request to the backend API
		const backendResponse = await fetch(`${BACKEND_URL}/api/users/me`, {
			headers: {
				Authorization: authHeader,
			},
		});
		if (!backendResponse.ok) {
			console.error("Users/me - Error response from backend");
			return NextResponse.json(
				{ error: "Authentication failed" },
				{ status: backendResponse.status }
			);
		}

		const data = await backendResponse.json();
		// Return the user data with no-cache headers
		const response = NextResponse.json(data);
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
		return response;
	} catch (error) {
		console.error("Users/me error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user data" },
			{ status: 500 }
		);
	}
}

export async function PUT(request: Request) {
	try {
		const authHeader = request.headers.get("authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.error("Users/me PUT - Invalid auth header format");
			return NextResponse.json(
				{ error: "Invalid authorization header" },
				{ status: 401 }
			);
		}

		// Get the request body
		const body = await request.json();

		// Forward the request to the backend API
		const backendResponse = await fetch(`${BACKEND_URL}/api/users/me`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: authHeader,
			},
			body: JSON.stringify(body),
		});

		if (!backendResponse.ok) {
			console.error("Users/me PUT - Error response from backend");
			
			// Try to extract the specific error message from backend
			let errorMessage = "Failed to update user data";
			try {
				const errorData = await backendResponse.json();
				console.error("Users/me PUT - Backend error data:", errorData);
				errorMessage = errorData.message || errorData.error || errorMessage;
			} catch (parseError) {
				console.error("Users/me PUT - Failed to parse backend error:", parseError);
			}
			
			return NextResponse.json(
				{ error: errorMessage },
				{ status: backendResponse.status }
			);
		}

		const data = await backendResponse.json();
		// Return the updated user data with no-cache headers
		const response = NextResponse.json(data);
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
		
		// Add custom header to trigger cross-device sync
		response.headers.set('X-Profile-Updated', 'true');
		
		return response;
	} catch (error) {
		console.error("Users/me PUT error:", error);
		return NextResponse.json(
			{ error: "Failed to update user data" },
			{ status: 500 }
		);
	}
}
