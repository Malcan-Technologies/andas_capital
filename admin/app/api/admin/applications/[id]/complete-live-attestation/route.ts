import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// Force dynamic rendering since we need to access request headers
export const dynamic = 'force-dynamic';

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Extract authorization header from the request
		const authHeader = req.headers.get("authorization");
		
		if (!authHeader) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();

		const response = await fetch(
			`${API_URL}/api/admin/applications/${params.id}/complete-live-attestation`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authHeader,
				},
				body: JSON.stringify(body),
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error completing live attestation:", error);
		return NextResponse.json(
			{ message: "Failed to complete live attestation" },
			{ status: 500 }
		);
	}
}
