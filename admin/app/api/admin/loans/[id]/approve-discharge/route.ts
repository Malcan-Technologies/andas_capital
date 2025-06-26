import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const token = request.headers.get("authorization")?.split(" ")[1];
		if (!token) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { notes } = await request.json();

		const response = await fetch(
			`${
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"
			}/api/admin/loans/${params.id}/approve-discharge`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ notes }),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ message: data.message || "Failed to approve discharge" },
				{ status: response.status }
			);
		}

		return NextResponse.json(data);
	} catch (error: any) {
		console.error("Admin Loan Discharge Approval - Exception:", error);
		return NextResponse.json(
			{
				message:
					error.message ||
					"An error occurred while approving discharge",
			},
			{ status: error.status || 500 }
		);
	}
}
