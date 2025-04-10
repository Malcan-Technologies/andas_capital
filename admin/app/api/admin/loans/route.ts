import { NextRequest, NextResponse } from "next/server";
import { AdminTokenStorage, fetchWithAdminTokenRefresh } from "@/lib/authUtils";

export async function GET(request: NextRequest) {
	try {
		const accessToken = AdminTokenStorage.getAccessToken();
		if (!accessToken) {
			console.error("Admin Loans - No access token found");
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		console.log("Admin Loans - Fetching loans data");

		// Use any as intermediate type since we're handling the response manually
		const data = await fetchWithAdminTokenRefresh<any>(
			`${process.env.NEXT_PUBLIC_API_URL}/api/admin/loans`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		console.log("Admin Loans - Successfully fetched loans");
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
