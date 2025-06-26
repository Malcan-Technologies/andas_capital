import { NextRequest, NextResponse } from "next/server";

const backendUrl =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		console.log("Admin API: Rejecting repayment:", id);

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

		// Get request body
		const body = await request.json();
		console.log("Admin API: Rejection request body:", body);

		// Validate required fields
		if (!body.reason) {
			return NextResponse.json(
				{ error: "Rejection reason is required" },
				{ status: 400 }
			);
		}

		// Make request to backend
		const response = await fetch(
			`${backendUrl}/api/admin/repayments/${id}/reject`,
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
					error: errorData.message || "Failed to reject repayment",
					details: errorData,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("Admin API: Successfully rejected repayment");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error rejecting repayment:", error);
		return NextResponse.json(
			{
				error: "Failed to reject repayment",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
