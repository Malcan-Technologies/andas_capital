import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {

		const body = await request.json();
		const { phoneNumber } = body;


		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/auth/resend-otp`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phoneNumber }),
			cache: "no-store",
			next: { revalidate: 0 },
		});

		// Get the response body
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ message: data.message || "Failed to resend OTP" },
				{ status: response.status }
			);
		}

		return NextResponse.json({
			message: data.message,
			otpSent: data.otpSent,
			expiresAt: data.expiresAt,
		});
	} catch (error) {
		console.error("[Resend OTP Route] Error details:", error);

		// Try to provide more specific error information
		let errorMessage = "Failed to resend OTP";
		if (error instanceof Error) {
			errorMessage = `Resend OTP error: ${error.message}`;
		}

		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
} 