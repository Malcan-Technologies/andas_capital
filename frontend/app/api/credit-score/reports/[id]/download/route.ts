import { NextRequest, NextResponse } from "next/server";
import { fetchWithTokenRefresh } from "@/lib/authUtils";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
		// For now, return a mock download URL since we haven't integrated with CTOS yet
		const mockDownloadUrl = {
			downloadUrl: `https://example.com/mock-ctos-report-${params.id}.pdf`,
		};

		return NextResponse.json(mockDownloadUrl);
	} catch (error) {
		console.error("Error getting report download URL:", error);
		return NextResponse.json(
			{ error: "Failed to get report download URL" },
			{ status: 500 }
		);
	}
}
