import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		console.log("Loan Repayment - Starting repayment request");

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.log("Loan Repayment - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		console.log(
			"Loan Repayment - Auth header:",
			`Bearer ${accessToken.substring(0, 20)}...`
		);

		// Get the request body
		const body = await request.json();
		console.log("Loan Repayment - Request body:", body);

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/repay-loan`;
		console.log(
			"Loan Repayment - Forwarding request to backend:",
			backendUrl
		);

		const response = await fetch(backendUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});

		console.log("Loan Repayment - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("Loan Repayment - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to process loan repayment" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("Loan Repayment - Backend data:", data);
		console.log("Loan Repayment - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Loan Repayment - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
