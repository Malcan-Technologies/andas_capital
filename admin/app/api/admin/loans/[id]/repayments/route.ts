import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const loanId = params.id;

		const response = await fetch(
			`${
				process.env.BACKEND_URL || "http://localhost:4001"
			}/api/admin/loans/${loanId}/repayments`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: request.headers.get("authorization") || "",
				},
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ message: data.message || "Failed to fetch repayments" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching repayments:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
