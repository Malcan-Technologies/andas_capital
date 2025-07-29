import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id } = params;

		console.log("Loan Transactions - Auth header:", `Bearer ${token}`);
		console.log(
			"Loan Transactions - Forwarding request to backend:",
			`${BACKEND_URL}/api/loans/${id}/transactions`
		);

		// Forward the request to the backend API
		const response = await fetch(
			`${BACKEND_URL}/api/loans/${id}/transactions`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: "no-store",
				next: { revalidate: 0 },
			}
		);

		console.log("Loan Transactions - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		// Get the response body
		const data = await response.json();
		console.log("Loan Transactions - Backend data:", data);

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.message || "Failed to fetch loan transactions" },
				{ status: response.status }
			);
		}

		console.log("Loan Transactions - Successful response");
		return NextResponse.json(data);
	} catch (error) {
		console.error("Loan Transactions - Error details:", error);

		let errorMessage = "Failed to fetch loan transactions";
		if (error instanceof Error) {
			errorMessage = `Loan transactions error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
