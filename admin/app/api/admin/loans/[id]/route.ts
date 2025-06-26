import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const loanId = params.id;

		const response = await fetch(
			`${
				process.env.BACKEND_URL || "http://localhost:4001"
			}/api/admin/loans/${loanId}`,
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
				{ message: data.message || "Failed to fetch loan" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching loan:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
