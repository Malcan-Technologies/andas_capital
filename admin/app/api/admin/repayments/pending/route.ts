import { NextRequest, NextResponse } from "next/server";

const backendUrl =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
	try {
		console.log("Admin API: Fetching pending repayments");

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

		console.log("Admin API: Making request to backend with token");

		// Make request to backend
		const response = await fetch(
			`${backendUrl}/api/admin/repayments/pending`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
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
					error:
						errorData.message ||
						"Failed to fetch pending repayments",
					details: errorData,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log(
			"Admin API: Successfully fetched pending repayments:",
			data.data?.length || 0,
			"items"
		);

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching pending repayments:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch pending repayments",
				details:
					error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
