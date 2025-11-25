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

		console.log("Wallet - Auth header:", `Bearer ${token}`);
		console.log(
			"Wallet - Forwarding request to backend:",
			`${BACKEND_URL}/api/wallet`
		);

		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/wallet`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			cache: "no-store",
			next: { revalidate: 0 },
		});

		console.log("Wallet - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		// Get the response body
		const data = await response.json();
		console.log("Wallet - Backend data:", data);

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to fetch wallet data" },
				{ status: response.status }
			);
		}

		console.log("Wallet - Successful response");
		return NextResponse.json(data);
	} catch (error) {
		console.error("Wallet - Error details:", error);

		let errorMessage = "Failed to fetch wallet data";
		if (error instanceof Error) {
			errorMessage = `Wallet error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
