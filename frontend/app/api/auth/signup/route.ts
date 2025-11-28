import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const { phoneNumber, password } = await request.json();

		// Forward the request to the backend API
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phoneNumber, password }),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to create user" },
				{ status: response.status }
			);
		}

	// Return the actual response from the backend (userId, phoneNumber, otpSent, expiresAt)
	return NextResponse.json({
		message: data.message,
		userId: data.userId,
		phoneNumber: data.phoneNumber,
		otpSent: data.otpSent,
		expiresAt: data.expiresAt,
	});
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}
