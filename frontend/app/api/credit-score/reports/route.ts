import { NextResponse } from "next/server";
import { fetchWithTokenRefresh } from "@/lib/authUtils";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET() {
	try {
		// For now, return mock data since we haven't integrated with CTOS yet
		const mockReports = {
			reports: [
				{
					id: "report_1",
					score: 725,
					reportDate: new Date(
						Date.now() - 7 * 24 * 60 * 60 * 1000
					).toISOString(), // 7 days ago
					status: "COMPLETED",
					downloadUrl: "#",
				},
				{
					id: "report_2",
					score: 700,
					reportDate: new Date(
						Date.now() - 37 * 24 * 60 * 60 * 1000
					).toISOString(), // 37 days ago
					status: "COMPLETED",
					downloadUrl: "#",
				},
			],
		};

		return NextResponse.json(mockReports);
	} catch (error) {
		console.error("Error fetching credit reports:", error);
		return NextResponse.json(
			{ error: "Failed to fetch credit reports" },
			{ status: 500 }
		);
	}
}
