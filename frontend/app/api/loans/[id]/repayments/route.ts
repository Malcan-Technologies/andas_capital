import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		console.log(
			"Loan Repayments - Starting repayments request for loan:",
			params.id
		);

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.log("Loan Repayments - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		console.log(
			"Loan Repayments - Auth header:",
			`Bearer ${accessToken.substring(0, 20)}...`
		);

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${params.id}/repayments`;
		console.log(
			"Loan Repayments - Forwarding request to backend:",
			backendUrl
		);

		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: "no-store",
		});

		console.log("Loan Repayments - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("Loan Repayments - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to fetch loan repayments" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("Loan Repayments - Backend data:", data);
		console.log("Loan Repayments - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Loan Repayments - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
