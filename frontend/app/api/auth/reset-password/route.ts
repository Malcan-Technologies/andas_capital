import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {

		const body = await request.json();
		const { resetToken, newPassword } = body;

		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ resetToken, newPassword }),
			cache: "no-store",
			next: { revalidate: 0 },
		});

		// Get the response body
		const data = await response.json();
		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to reset password" },
				{ status: response.status }
			);
		}

		// Return success response
		return NextResponse.json({
			message: data.message,
		});

	} catch (error) {
		console.error("[Reset Password Route] Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
} 