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

	// Forward the backend response — may include userId (new account) or just a generic message (to prevent enumeration)
	return NextResponse.json({
		message: data.message,
		...(data.userId && { userId: data.userId }),
		phoneNumber: data.phoneNumber,
		...(data.otpSent !== undefined && { otpSent: data.otpSent }),
		...(data.expiresAt && { expiresAt: data.expiresAt }),
	});
	} catch (error) {
		console.error("Signup error:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}
