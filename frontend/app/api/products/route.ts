import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	try {
		console.log("Products - Starting products request");

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.log("Products - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		console.log(
			"Products - Auth header:",
			`Bearer ${accessToken.substring(0, 20)}...`
		);

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
		console.log("Products - Forwarding request to backend:", backendUrl);

		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			cache: "no-store",
		});

		console.log("Products - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("Products - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to fetch products" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("Products - Backend data:", data);
		console.log("Products - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Products - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
