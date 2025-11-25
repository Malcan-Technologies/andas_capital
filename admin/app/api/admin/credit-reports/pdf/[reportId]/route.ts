import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: { reportId: string } }
) {
	try {
		const { reportId } = params;
		const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
		const token = request.headers.get("authorization")?.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Forward request to backend
		const response = await fetch(
			`${backendUrl}/api/admin/credit-reports/${reportId}/pdf`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			const data = await response.json().catch(() => ({}));
			return NextResponse.json(
				{
					success: false,
					message: data.message || "Failed to fetch PDF",
				},
				{ status: response.status }
			);
		}

		// Get PDF buffer from backend
		const pdfBuffer = await response.arrayBuffer();

		// Get filename from Content-Disposition header or use default
		const contentDisposition = response.headers.get("Content-Disposition");
		let filename = "credit-report.pdf";
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename="(.+)"/);
			if (filenameMatch) {
				filename = filenameMatch[1];
			}
		}

		// Return PDF with proper headers
		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error fetching PDF:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch PDF",
			},
			{ status: 500 }
		);
	}
}

