import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(request: Request) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Extract query parameters from the request URL
		const { searchParams } = new URL(request.url);
		const queryString = searchParams.toString();
		const backendUrl = `${BACKEND_URL}/api/wallet/transactions${
			queryString ? `?${queryString}` : ""
		}`;

		// Forward the request to the backend API
		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
			next: { revalidate: 0 },
		});


		// Get the response body
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to fetch transactions" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Wallet Transactions - Error details:", error);

		let errorMessage = "Failed to fetch transactions";
		if (error instanceof Error) {
			errorMessage = `Wallet transactions error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
