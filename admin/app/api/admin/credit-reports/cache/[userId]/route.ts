import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: { userId: string } }
) {
	try {
		const userId = params.userId;
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
		const token = request.headers.get("authorization")?.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Forward request to backend
		const response = await fetch(
			`${backendUrl}/api/admin/credit-reports/cache/${userId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					message: data.message || "Failed to fetch cached credit report",
				},
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching cached credit report:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch cached credit report",
			},
			{ status: 500 }
		);
	}
}

