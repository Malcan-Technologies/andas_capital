import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	try {
		// Get the admin token from the request headers or cookies
		const authHeader = request.headers.get("authorization");
		let token = authHeader?.replace("Bearer ", "");

		if (!token) {
			// Try to get from cookies as fallback
			const cookies = request.headers.get("cookie");
			if (cookies) {
				const tokenMatch = cookies.match(/adminToken=([^;]+)/);
				if (tokenMatch) {
					token = tokenMatch[1];
				}
			}
		}

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "No authentication token provided" },
				{ status: 401 }
			);
		}

		// Forward the request to the backend
		const backendUrl = `${
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"
		}/api/admin/repayments/pending`;
		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{
					success: false,
					message: data.message || "Failed to fetch pending payments",
				},
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching pending payments:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
