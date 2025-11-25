import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const body = await request.json();
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
			`${backendUrl}/api/admin/credit-reports/request`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					message: data.message || "Failed to request credit report",
				},
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error requesting credit report:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to request credit report",
			},
			{ status: 500 }
		);
	}
}

