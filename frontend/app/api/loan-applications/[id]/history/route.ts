import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Extract authorization header from the request
		const authHeader = req.headers.get("authorization");
		
		if (!authHeader) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const response = await fetch(
			`${API_URL}/api/loan-applications/${params.id}/history`,
			{
				headers: {
					Authorization: authHeader,
				},
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching loan application history:", error);
		return NextResponse.json(
			{ message: "Failed to fetch application history" },
			{ status: 500 }
		);
	}
}
