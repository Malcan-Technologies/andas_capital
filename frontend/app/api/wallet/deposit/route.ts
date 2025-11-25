import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(request: Request) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { amount, method, description } = body;

		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/wallet/deposit`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ amount, method, description }),
			cache: "no-store",
			next: { revalidate: 0 },
		});

		// Get the response body
		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to create deposit" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Wallet Deposit - Error details:", error);

		let errorMessage = "Failed to create deposit";
		if (error instanceof Error) {
			errorMessage = `Wallet deposit error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
