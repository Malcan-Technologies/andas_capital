import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(req.url);
		const queryString = searchParams.toString();
		const backendUrl = `${BACKEND_URL}/api/notifications${
			queryString ? `?${queryString}` : ""
		}`;

		console.log("Notifications - Auth header:", `Bearer ${token}`);
		console.log(
			"Notifications - Forwarding request to backend:",
			backendUrl
		);

		// Forward the request to the backend API
		const response = await fetch(backendUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch notifications" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 }
		);
	}
}

export async function PATCH(req: Request) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await req.json();

		// Forward the request to the backend API
		const response = await fetch(`${BACKEND_URL}/api/notifications`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to update notifications" },
				{ status: response.status }
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating notifications:", error);
		return NextResponse.json(
			{ error: "Failed to update notifications" },
			{ status: 500 }
		);
	}
}
