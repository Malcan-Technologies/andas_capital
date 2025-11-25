import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: NextRequest) {
	try {
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

		// Get the form data from the request
		const formData = await request.formData();
		
		// Forward the request to backend with the form data
		const response = await fetch(
			`${backendUrl}/api/admin/payments/csv-upload`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					// Don't set Content-Type header, let fetch handle it for FormData
				},
				body: formData,
			}
		);

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
					error: errorData.message || "Failed to process CSV upload",
					details: errorData,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error processing CSV upload:", error);
		return NextResponse.json(
			{
				error: "Failed to process CSV upload",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}