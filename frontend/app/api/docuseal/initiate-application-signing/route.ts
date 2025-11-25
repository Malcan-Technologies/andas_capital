import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Get the request body
		const body = await request.json();

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/docuseal/initiate-application-signing`;

		const response = await fetch(backendUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.error("DocuSeal - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to initiate document signing" },
				{ status: response.status }
			);
		}

		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		console.error("DocuSeal - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
