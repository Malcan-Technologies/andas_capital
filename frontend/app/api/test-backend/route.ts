import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET() {
	try {
		// Log all environment variables for debugging
		console.log(`[Test Route] Environment check:`);
		console.log(
			`[Test Route] NEXT_PUBLIC_API_URL=${process.env.NEXT_PUBLIC_API_URL}`
		);
		console.log(`[Test Route] NODE_ENV=${process.env.NODE_ENV}`);
		console.log(`[Test Route] Using BACKEND_URL=${BACKEND_URL}`);

		// Attempt to fetch the docs URL to see if the backend is reachable
		const response = await fetch(`${BACKEND_URL}/api/auth/test-bcrypt`, {
			method: "GET",
			cache: "no-store",
			next: { revalidate: 0 },
		});

		const status = response.status;
		console.log(`[Test Route] Response status: ${status}`);

		let responseData;
		if (response.ok) {
			try {
				responseData = await response.json();
				console.log(`[Test Route] Response data:`, responseData);
			} catch (e) {
				console.error("[Test Route] Error parsing response:", e);
				responseData = { error: "Could not parse response" };
			}
		} else {
			responseData = { error: `HTTP error ${status}` };
		}

		return NextResponse.json({
			success: response.ok,
			message: "Backend connection test completed",
			backendUrl: BACKEND_URL,
			status,
			responseData,
		});
	} catch (error) {
		console.error("[Test Route] Error connecting to backend:", error);

		return NextResponse.json(
			{
				success: false,
				message:
					error instanceof Error ? error.message : "Unknown error",
				backendUrl: BACKEND_URL,
			},
			{ status: 500 }
		);
	}
}
