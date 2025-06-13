import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

interface LoanApplication {
	id: string;
	documents?: Array<{
		id: string;
		type: string;
		status: string;
	}>;
	[key: string]: any;
}

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const id = params.id;
		console.log(
			`API /admin/applications/${id} - Fetching application details`
		);

		const backendUrl = process.env.NEXT_PUBLIC_API_URL;
		const token = request.headers.get("authorization")?.split(" ")[1];

		if (!token) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get application details from backend with additional information
		try {
			const response = await fetch(
				`${backendUrl}/api/admin/applications/${id}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				return NextResponse.json(
					{
						error:
							errorData.error ||
							"Failed to fetch application details",
					},
					{ status: response.status }
				);
			}

			const application = await response.json();

			console.log(
				`API /admin/applications/${id} - Successfully fetched application details`
			);
			console.log(
				`API /admin/applications/${id} - Application has ${
					application.documents?.length || 0
				} documents`
			);

			// Log document URLs for debugging
			if (application.documents && application.documents.length > 0) {
				console.log(`API /admin/applications/${id} - Documents:`);
				application.documents.forEach(
					(
						doc: { type: string; status: string; fileUrl: string },
						index: number
					) => {
						console.log(
							`Document ${index + 1}: Type=${doc.type}, Status=${
								doc.status
							}, URL=${doc.fileUrl}`
						);
					}
				);
			}

			return NextResponse.json(application);
		} catch (fetchError) {
			console.error(`API /admin/applications/${id} - Error:`, fetchError);
			return NextResponse.json(
				{ error: "Failed to fetch application details" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error(`API /admin/applications/${params.id} - Error:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch application details" },
			{ status: 500 }
		);
	}
}
