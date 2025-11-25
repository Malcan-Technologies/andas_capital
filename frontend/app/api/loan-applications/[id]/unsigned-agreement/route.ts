import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		
		// Get authorization header (sent from frontend)
		const authHeader = request.headers.get("authorization");
		
		if (!authHeader) {
			console.error('❌ No authorization header found');
			return NextResponse.json(
				{ success: false, message: "No authorization token provided" },
				{ status: 401 }
			);
		}

		const backendUrl = `${API_URL}/api/loan-applications/${id}/unsigned-agreement`;

		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				Authorization: authHeader,
			},
		});

		if (!response.ok) {
			const data = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
			console.error('❌ Backend error:', data);
			return NextResponse.json(
				data,
				{ status: response.status }
			);
		}

		// Backend returns JSON with DocuSeal URL, not PDF
		const data = await response.json();
		
		return NextResponse.json(data, {
			status: 200,
		});
	} catch (error) {
		console.error("Error downloading unsigned agreement:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Error downloading unsigned agreement",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

