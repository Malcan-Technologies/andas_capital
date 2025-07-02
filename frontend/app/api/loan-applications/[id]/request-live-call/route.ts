import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();

		const response = await fetch(
			`${API_URL}/api/loan-applications/${params.id}/request-live-call`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			}
		);

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error("Error requesting live call:", error);
		return NextResponse.json(
			{ message: "Failed to request live call" },
			{ status: 500 }
		);
	}
}
