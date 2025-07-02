import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const adminToken = cookieStore.get("adminToken")?.value;

		if (!adminToken) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const response = await fetch(
			`${API_URL}/api/admin/applications/live-attestations`,
			{
				headers: {
					Authorization: `Bearer ${adminToken}`,
				},
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error fetching live attestation requests:", error);
		return NextResponse.json(
			{ message: "Failed to fetch live attestation requests" },
			{ status: 500 }
		);
	}
}
