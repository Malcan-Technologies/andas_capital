import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
	try {
		console.log("Wallet Withdraw - Starting withdrawal request");

		// Get the access token from cookies
		const cookieStore = cookies();
		const accessToken = cookieStore.get("token")?.value;

		if (!accessToken) {
			console.log("Wallet Withdraw - No access token found");
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		console.log(
			"Wallet Withdraw - Auth header:",
			`Bearer ${accessToken.substring(0, 20)}...`
		);

		// Get the request body
		const body = await request.json();
		console.log("Wallet Withdraw - Request body:", body);

		// Forward the request to the backend
		const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/withdraw`;
		console.log(
			"Wallet Withdraw - Forwarding request to backend:",
			backendUrl
		);

		const response = await fetch(backendUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(body),
			cache: "no-store",
		});

		console.log("Wallet Withdraw - Backend response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("Wallet Withdraw - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to process withdrawal" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("Wallet Withdraw - Backend data:", data);
		console.log("Wallet Withdraw - Successful response");

		return NextResponse.json(data);
	} catch (error) {
		console.error("Wallet Withdraw - Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
