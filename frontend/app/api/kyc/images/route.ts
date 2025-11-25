import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(request: NextRequest) {
	try {
		console.log("KYC Images - Starting request");

		// Get the authorization header
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.log("KYC Images - Invalid auth header format");
			return NextResponse.json(
				{ error: "Invalid authorization header" },
				{ status: 401 }
			);
		}

		// Get the search params (like ?t=timestamp)
		const searchParams = request.nextUrl.searchParams;
		const queryString = searchParams.toString();
		const url = `${BACKEND_URL}/api/kyc/images${queryString ? `?${queryString}` : ''}`;

		console.log("KYC Images - Forwarding request to backend:", url);

		// Forward the request to the backend API
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authHeader,
				"Content-Type": "application/json",
			},
			cache: "no-store",
			next: { revalidate: 0 },
		});

		console.log("KYC Images - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("KYC Images - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to fetch KYC images" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("KYC Images - Backend data:", data);
		console.log("KYC Images - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("KYC Images - Error details:", error);

		let errorMessage = "Failed to fetch KYC images";
		if (error instanceof Error) {
			errorMessage = `KYC Images error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
