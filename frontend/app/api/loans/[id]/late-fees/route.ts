import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {

		// Get the access token from cookies
		const cookieStore = await cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.error("Loan Late Fees - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/loans/${params.id}/late-fees`;

		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error("Loan Late Fees - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to fetch loan late fees" },
				{ status: response.status }
			);
		}

		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		console.error("Loan Late Fees - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
} 