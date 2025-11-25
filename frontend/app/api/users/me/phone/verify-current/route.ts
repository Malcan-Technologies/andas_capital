import { NextResponse } from "next/server";
import { fetchWithTokenRefresh } from "@/lib/authUtils";

export async function POST(request: Request) {
	try {

		const body = await request.json();
		const { changeToken, otp } = body;

		// Use fetchWithTokenRefresh to include auth headers
		const data = await fetchWithTokenRefresh<any>(
			"/api/users/me/phone/verify-current",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ changeToken, otp }),
			}
		);

		return NextResponse.json(data);

	} catch (error: any) {
		console.error("[Verify Current Phone Route] Error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: error.status || 500 }
		);
	}
} 