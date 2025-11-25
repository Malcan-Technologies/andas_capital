import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = params.id;
		const body = await request.json();
		const { status } = body;

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}

		const backendUrl = process.env.NEXT_PUBLIC_API_URL;
		const token = request.headers.get("authorization")?.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Update document status in backend
		console.log(
			`API /admin/documents/${id}/status - Updating status to ${status}`
		);

		try {
			const response = await fetch(
				`${backendUrl}/api/admin/documents/${id}/status`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status }),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				return NextResponse.json(
					{
						error:
							errorData.error ||
							"Failed to update document status",
					},
					{ status: response.status }
				);
			}

			const updatedDocument = await response.json();
			console.log(
				`API /admin/documents/${id}/status - Successfully updated document status`
			);

			return NextResponse.json(updatedDocument);
		} catch (fetchError) {
			console.error(
				`API /admin/documents/${id}/status - Error:`,
				fetchError
			);
			return NextResponse.json(
				{ error: "Failed to update document status" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error(
			`API /admin/documents/${params.id}/status - Error:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to update document status" },
			{ status: 500 }
		);
	}
}
