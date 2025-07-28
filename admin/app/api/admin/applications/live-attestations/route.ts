import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(req: NextRequest) {
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
			`${API_URL}/api/admin/applications/live-attestations`,
			{
				headers: {
					Authorization: authHeader,
				},
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching live attestation requests:", error);
		return NextResponse.json(
			{ message: "Failed to fetch live attestation requests" },
			{ status: 500 }
		);
	}
}
