import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(
	request: NextRequest,
	{ params }: { params: { imageId: string } }
) {
	try {
		console.log("KYC Image - Starting request for imageId:", params.imageId);

		// Get the authorization header
		const authHeader = request.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			console.log("KYC Image - Invalid auth header format");
			return NextResponse.json(
				{ error: "Invalid authorization header" },
				{ status: 401 }
			);
		}

		const url = `${BACKEND_URL}/api/kyc/images/${params.imageId}`;
		console.log("KYC Image - Forwarding request to backend:", url);

		// Forward the request to the backend API
		const response = await fetch(url, {
			method: "GET",
			headers: {
				Authorization: authHeader,
			},
			cache: "no-store",
			next: { revalidate: 0 },
		});

		console.log("KYC Image - Backend response:", {
			status: response.status,
			ok: response.ok,
			contentType: response.headers.get("content-type"),
		});

		if (!response.ok) {
			const errorData = await response.text();
			console.log("KYC Image - Backend error:", errorData);
			return NextResponse.json(
				{ error: "Failed to fetch KYC image" },
				{ status: response.status }
			);
		}

		// Stream the image file response
		const arrayBuffer = await response.arrayBuffer();
		const contentType = response.headers.get("content-type") || "image/png";

		console.log("KYC Image - Successful response, content-type:", contentType);

		return new NextResponse(arrayBuffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "private, no-cache",
			},
		});
	} catch (error) {
		console.error("KYC Image - Error details:", error);

		let errorMessage = "Failed to fetch KYC image";
		if (error instanceof Error) {
			errorMessage = `KYC Image error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
