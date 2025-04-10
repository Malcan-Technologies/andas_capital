import { NextResponse } from "next/server";
import { AdminTokenStorage } from "../../../../../../lib/authUtils";

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = params.id;
		const body = await request.json();
		const backendUrl = process.env.NEXT_PUBLIC_API_URL;
		const token = AdminTokenStorage.getAccessToken();

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Update application status in backend
		const response = await fetch(
			`${backendUrl}/api/admin/applications/${id}/status`,
			{
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: body.status }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{
					error:
						errorData.error ||
						"Failed to update application status",
				},
				{ status: response.status }
			);
		}

		const updatedApplication = await response.json();
		return NextResponse.json(updatedApplication);
	} catch (error) {
		console.error(
			`API /admin/applications/${params.id}/status - Error:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to update application status" },
			{ status: 500 }
		);
	}
}
