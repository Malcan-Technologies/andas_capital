import { NextResponse } from "next/server";
import { AdminTokenStorage } from "../../../../lib/authUtils";

export async function GET(request: Request) {
	try {
		const backendUrl = process.env.NEXT_PUBLIC_API_URL;
		const token = AdminTokenStorage.getAccessToken();

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Call the backend API directly
		const response = await fetch(`${backendUrl}/api/admin/applications`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{ error: errorData.error || "Failed to fetch applications" },
				{ status: response.status }
			);
		}

		const applications = await response.json();
		return NextResponse.json(applications);
	} catch (error) {
		console.error("API /admin/applications - Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch applications" },
			{ status: 500 }
		);
	}
}
