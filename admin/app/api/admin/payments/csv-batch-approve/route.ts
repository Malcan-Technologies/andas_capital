import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: NextRequest) {
	try {
		console.log("Admin API: Processing CSV batch approval request");

		// Get the authorization header from the request
		const authHeader = request.headers.get("authorization");
		if (!authHeader) {
			console.error("Admin API: No authorization header found");
			return NextResponse.json(
				{ error: "Authorization header is required" },
				{ status: 401 }
			);
		}

		// Extract token from Bearer token
		const token = authHeader.replace("Bearer ", "");
		if (!token) {
			console.error("Admin API: No token found in authorization header");
			return NextResponse.json(
				{ error: "Valid token is required" },
				{ status: 401 }
			);
		}

		// Get the request body
		const body = await request.json();
		
		console.log("Admin API: Forwarding batch approval to backend");

		// Make request to backend
		const response = await fetch(
			`${backendUrl}/api/admin/payments/csv-batch-approve`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			}
		);

		console.log("Admin API: Backend response status:", response.status);

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch (parseError) {
				console.error("Failed to parse error response:", parseError);
				errorData = { message: "Failed to parse error response" };
			}

			console.error("Backend API error:", errorData);
			return NextResponse.json(
				{
					error: errorData.message || "Failed to process batch approval",
					details: errorData,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log(
			"Admin API: Successfully processed batch approval:",
			data.data?.summary || "No summary available"
		);

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error processing batch approval:", error);
		return NextResponse.json(
			{
				error: "Failed to process batch approval",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}