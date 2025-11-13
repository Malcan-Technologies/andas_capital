import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const applicationId = params.id;
		console.log(
			`API /admin/applications/${applicationId}/signatures - Fetching signature status`
		);

		const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
		const token = request.headers.get("authorization")?.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Forward request to backend API
		const response = await fetch(
			`${backendUrl}/api/admin/applications/${applicationId}/signatures`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		const data = await response.json();

		if (!response.ok) {
			console.error(
				`API /admin/applications/${applicationId}/signatures - Backend error:`,
				data
			);
			return NextResponse.json(data, { status: response.status });
		}

		console.log(
			`API /admin/applications/${applicationId}/signatures - Successfully fetched signature status`
		);

		return NextResponse.json(data);
	} catch (error) {
		console.error(
			`API /admin/applications/${params.id}/signatures - Error:`,
			error
		);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch signature status",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

