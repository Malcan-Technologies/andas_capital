import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	try {
		const token = request.headers.get("authorization")?.split(" ")[1];
		if (!token) {
			console.error("Admin Loans - No access token found");
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/api/admin/loans`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{ message: errorData.error || "Failed to fetch loans" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error: any) {
		console.error("Admin Loans - Fetch exception:", error);

		// Handle specific error status codes if available
		if (error.status === 401) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{
				message:
					error.message || "An error occurred while fetching loans",
			},
			{ status: error.status || 500 }
		);
	}
}
