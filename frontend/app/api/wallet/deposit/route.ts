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

		console.log("Wallet Deposit - Auth header:", `Bearer ${token}`);
		console.log("Wallet Deposit - Request body:", {
			amount,
			method,
			description,
		});
		console.log(
			"Wallet Deposit - Forwarding request to backend:",
			`${BACKEND_URL}/api/wallet/deposit`
		);

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

		console.log("Wallet Deposit - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		// Get the response body
		const data = await response.json();
		console.log("Wallet Deposit - Backend data:", data);

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to create deposit" },
				{ status: response.status }
			);
		}

		console.log("Wallet Deposit - Successful response");
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
