import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		console.log("DocuSeal - Starting test-connection request");

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.log("DocuSeal - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		console.log(
			"DocuSeal - Auth header:",
			`Bearer ${accessToken.substring(0, 20)}...`
		);

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/docuseal/test-connection`;
		console.log("DocuSeal - Forwarding request to backend:", backendUrl);

		const response = await fetch(backendUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			cache: "no-store",
		});

		console.log("DocuSeal - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("DocuSeal - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to test DocuSeal connection" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("DocuSeal - Backend data:", data);
		console.log("DocuSeal - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("DocuSeal - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
