"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Cookies from "js-cookie";
import { Box, Button, Typography, Dialog, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import DocumentUploadForm from "@/components/application/DocumentUploadForm";

interface LoanApplication {
	id: string;
	status: string;
	appStep: number;
	amount: number;
	term: number;
	purpose: string;
	createdAt: string;
	updatedAt: string;
	monthlyRepayment: number;
	interestRate: number;
	legalFee: number;
	netDisbursement: number;
	applicationFee?: number;
	originationFee?: number;
	attestationType?: string;
	attestationCompleted?: boolean;
	attestationDate?: string;
	attestationNotes?: string;
	meetingCompletedAt?: string;
	product: {
		name: string;
		code: string;
		originationFee: number;
		legalFee: number;
		applicationFee: number;
		interestRate: number;
		requiredDocuments?: string[];
	};
	documents?: Array<{
		id: string;
		name: string;
		type: string;
		status: string;
		fileUrl: string;
	}>;
	user?: {
		fullName: string;
		email: string;
		phoneNumber: string;
		employmentStatus: string;
		employerName?: string;
		monthlyIncome?: string;
		address1: string;
		address2?: string;
		city: string;
		state: string;
		postalCode: string;
	};
}

export default function ApplicationDetails(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = use(props.params);
    const router = useRouter();
    const [application, setApplication] = useState<LoanApplication | null>(
		null
	);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState<string>("");
    const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

    useEffect(() => {
		const fetchData = async () => {
			try {
				const token =
					localStorage.getItem("token") || Cookies.get("token");
				if (!token) {
					router.push("/login");
					return;
				}

				// Fetch user data
				const userResponse = await fetch("/api/users/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!userResponse.ok) {
					router.push("/login");
					return;
				}

				const userData = await userResponse.json();
				setUserName(
					userData.firstName ||
						userData.fullName?.split(" ")[0] ||
						"Guest"
				);

				// Fetch application details
				const response = await fetch(
					`/api/loan-applications/${params.id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Failed to fetch application");
				}

				const data = await response.json();
				setApplication(data);
			} catch (error) {
				console.error("Error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [router, params.id]);

    const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

    const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

    const getStatusColor = (status: string, attestationType?: string) => {
		switch (status) {
			case "INCOMPLETE":
				return "bg-yellow-100 text-yellow-800 border border-yellow-200";
			case "PENDING_APP_FEE":
			case "PENDING_KYC":
			case "PENDING_APPROVAL":
				return "bg-blue-100 text-blue-800 border border-blue-200";
			case "PENDING_ATTESTATION":
				// Special color for live call requests
				if (attestationType === "MEETING") {
					return "bg-purple-100 text-purple-800 border border-purple-200";
				}
				return "bg-cyan-100 text-cyan-800 border border-cyan-200";
			case "PENDING_SIGNATURE":
				return "bg-indigo-100 text-indigo-800 border border-indigo-200";
			case "PENDING_DISBURSEMENT":
				return "bg-orange-100 text-orange-800 border border-orange-200";
			case "APPROVED":
				return "bg-green-100 text-green-800 border border-green-200";
			case "REJECTED":
				return "bg-red-100 text-red-800 border border-red-200";
			case "DISBURSED":
				return "bg-purple-100 text-purple-800 border border-purple-200";
			case "WITHDRAWN":
				return "bg-gray-100 text-gray-800 border border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border border-gray-200";
		}
	};

    const getStatusLabel = (status: string, attestationType?: string) => {
		switch (status) {
			case "INCOMPLETE":
				return "Incomplete";
			case "PENDING_APP_FEE":
				return "Pending Fee";
			case "PENDING_KYC":
				return "Pending KYC";
			case "PENDING_APPROVAL":
				return "Under Review";
			case "PENDING_ATTESTATION":
				// Show special status for live call requests
				if (attestationType === "MEETING") {
					return "Awaiting Live Call";
				}
				return "Pending Attestation";
			case "PENDING_SIGNATURE":
				return "Pending Signature";
			case "PENDING_DISBURSEMENT":
				return "Pending Disbursement";
			case "APPROVED":
				return "Approved";
			case "REJECTED":
				return "Rejected";
			case "DISBURSED":
				return "Disbursed";
			case "WITHDRAWN":
				return "Withdrawn";
			default:
				return status;
		}
	};

    const calculateFees = (application: LoanApplication) => {
		// Use the fees stored in the database instead of calculating them
		const legalFee = application.legalFee;
		const netDisbursement = application.netDisbursement;
		const applicationFee = application.applicationFee || 0;
		const originationFee = application.originationFee || 0;

		return {
			interestRate: application.interestRate,
			legalFee,
			netDisbursement,
			originationFee,
			applicationFee,
			totalFees: originationFee + legalFee + applicationFee,
		};
	};

    const handleDocumentUpdate = async () => {
		try {
			const token = localStorage.getItem("token") || Cookies.get("token");
			if (!token || !application) return;

			// Fetch updated application details
			const response = await fetch(
				`/api/loan-applications/${params.id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch updated application");
			}

			const data = await response.json();
			setApplication(data);
		} catch (error) {
			console.error("Error updating documents:", error);
		}
	};

    return (
		<DashboardLayout userName={userName}>
			<div className="min-h-screen bg-offwhite">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
					{loading ? (
						<div className="flex justify-center items-center p-8">
							<div className="flex flex-col items-center space-y-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
								<p className="text-gray-700 font-body">
									Loading application details...
								</p>
							</div>
						</div>
					) : application ? (
						<div className="space-y-6">
							{/* Back Button */}
							<div className="mb-6">
								<button
									onClick={() => router.back()}
									className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors font-body"
								>
									<ArrowBackIcon className="h-4 w-4 mr-2" />
									Back to Applications
								</button>
							</div>

							{/* Header */}
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
								<div className="flex items-center justify-between">
									<div>
										<h1 className="text-3xl font-heading font-bold text-gray-700 mb-2">
											Loan Application Details
										</h1>
										<p className="text-gray-600 font-body">
											Application ID:{" "}
											{application.id
												.slice(-8)
												.toUpperCase()}
										</p>
									</div>
									<span
										className={`px-4 py-2 text-sm font-semibold rounded-xl ${getStatusColor(
											application.status,
											application.attestationType
										)}`}
									>
										{getStatusLabel(
											application.status,
											application.attestationType
										)}
									</span>
								</div>
							</div>

							{/* Loan Details Section */}
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
								<h2 className="text-2xl font-heading font-bold text-gray-700 mb-6">
									Loan Details
								</h2>
								<div className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Product
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.product.name}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Loan Amount
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{formatCurrency(
													application.amount
												)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Loan Purpose
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.purpose}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Loan Term
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.term} months
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Interest Rate
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{
													application.product
														.interestRate
												}
												% monthly
											</span>
										</div>
									</div>

									{/* Fees Section */}
									{application && (
										<>
											<div className="pt-4 border-t border-gray-200">
												<h3 className="text-lg font-heading font-semibold text-gray-700 mb-4">
													Fee Breakdown
												</h3>
												<div className="space-y-3">
													<div className="flex justify-between">
														<span className="text-gray-600 font-body">
															Origination Fee (
															{
																application
																	.product
																	.originationFee
															}
															%)
														</span>
														<span className="text-red-600 font-semibold font-body">
															(
															{formatCurrency(
																calculateFees(
																	application
																).originationFee
															)}
															)
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 font-body">
															Legal Fee (
															{
																application
																	.product
																	.legalFee
															}
															%)
														</span>
														<span className="text-red-600 font-semibold font-body">
															(
															{formatCurrency(
																calculateFees(
																	application
																).legalFee
															)}
															)
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600 font-body">
															Application Fee
															(paid upfront)
														</span>
														<span className="text-red-600 font-semibold font-body">
															(
															{formatCurrency(
																calculateFees(
																	application
																).applicationFee
															)}
															)
														</span>
													</div>
												</div>
											</div>

											<div className="pt-4 border-t border-gray-200">
												<div className="space-y-4">
													{/* Net Loan Disbursement - Highlighted */}
													<div className="bg-blue-tertiary/5 rounded-xl p-4 border border-blue-tertiary/20">
														<div className="flex justify-between items-center">
															<span className="text-blue-tertiary font-semibold text-lg font-body">
																Net Loan
																Disbursement
															</span>
															<span className="text-blue-tertiary font-bold text-xl font-heading">
																{formatCurrency(
																	calculateFees(
																		application
																	)
																		.netDisbursement
																)}
															</span>
														</div>
													</div>

													{/* Monthly Repayment - Highlighted */}
													<div className="bg-purple-primary/5 rounded-xl p-4 border border-purple-primary/20">
														<div className="flex justify-between items-center">
															<span className="text-purple-primary font-semibold text-lg font-body">
																Monthly
																Repayment
															</span>
															<span className="text-purple-primary font-bold text-xl font-heading">
																{formatCurrency(
																	application.monthlyRepayment
																)}
															</span>
														</div>
													</div>
												</div>
											</div>
										</>
									)}
								</div>
							</div>

							{/* Personal Information Section */}
							{application.user && (
								<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
									<h2 className="text-2xl font-heading font-bold text-gray-700 mb-6">
										Personal Information
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Full Name
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.user.fullName}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Email
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.user.email}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Phone Number
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{application.user.phoneNumber}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600 font-body">
												Employment Status
											</span>
											<span className="text-gray-700 font-semibold font-body">
												{
													application.user
														.employmentStatus
												}
											</span>
										</div>
										{application.user.employerName && (
											<div className="flex justify-between">
												<span className="text-gray-600 font-body">
													Employer
												</span>
												<span className="text-gray-700 font-semibold font-body">
													{
														application.user
															.employerName
													}
												</span>
											</div>
										)}
										{application.user.monthlyIncome && (
											<div className="flex justify-between">
												<span className="text-gray-600 font-body">
													Monthly Income
												</span>
												<span className="text-gray-700 font-semibold font-body">
													{formatCurrency(
														Number(
															application.user
																.monthlyIncome
														)
													)}
												</span>
											</div>
										)}
									</div>
									<div className="pt-4 border-t border-gray-200 mt-4">
										<h3 className="text-lg font-heading font-semibold text-gray-700 mb-3">
											Address
										</h3>
										<div className="text-gray-700 font-body">
											{application.user.address1}
											{application.user.address2 && (
												<>
													<br />
													{application.user.address2}
												</>
											)}
											<br />
											{application.user.city},{" "}
											{application.user.state}{" "}
											{application.user.postalCode}
										</div>
									</div>
								</div>
							)}

							{/* Documents Section */}
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
								<div className="flex justify-between items-center mb-6">
									<h2 className="text-2xl font-heading font-bold text-gray-700">
										Required Documents
									</h2>
									<button
										onClick={() =>
											setIsDocumentDialogOpen(true)
										}
										className="inline-flex items-center px-6 py-3 border border-blue-tertiary rounded-xl text-blue-tertiary bg-white hover:bg-blue-tertiary/5 transition-colors font-body"
										disabled={
											application.status === "WITHDRAWN"
										}
									>
										<EditIcon className="h-4 w-4 mr-2" />
										Edit Documents
									</button>
								</div>
								<div className="divide-y divide-gray-200">
									{application.product.requiredDocuments &&
									application.product.requiredDocuments
										.length > 0 ? (
										application.product.requiredDocuments.map(
											(docType) => {
												const uploadedDocs =
													application.documents?.filter(
														(doc) =>
															doc.type === docType
													) || [];
												return (
													<div
														key={docType}
														className="flex flex-col py-4"
													>
														<div className="flex justify-between items-center mb-2">
															<span className="text-gray-700 font-semibold font-body">
																{docType}
															</span>
															<span
																className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-xl ${
																	uploadedDocs.length >
																	0
																		? "bg-green-50 text-green-600 border border-green-200"
																		: "bg-yellow-50 text-yellow-600 border border-yellow-200"
																}`}
															>
																{uploadedDocs.length >
																0
																	? `${uploadedDocs.length} file(s) uploaded`
																	: "Not Uploaded"}
															</span>
														</div>
														{uploadedDocs.length >
															0 && (
															<div className="pl-4 space-y-2">
																{uploadedDocs.map(
																	(doc) => (
																		<div
																			key={
																				doc.id
																			}
																			className="flex justify-between items-center"
																		>
																			<span className="text-gray-600 font-body text-sm">
																				{doc.fileUrl
																					?.split(
																						"/"
																					)
																					.pop() ||
																					doc.name ||
																					"Unknown file"}
																			</span>
																			<a
																				href={`${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${application.id}/documents/${doc.id}`}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-blue-tertiary hover:text-blue-600 text-sm font-body transition-colors"
																			>
																				View
																			</a>
																		</div>
																	)
																)}
															</div>
														)}
													</div>
												);
											}
										)
									) : (
										<div className="py-4">
											<p className="text-gray-600 font-body">
												No required documents found
											</p>
										</div>
									)}
								</div>
								{application.status === "WITHDRAWN" && (
									<p className="text-gray-500 font-body mt-4 text-sm">
										Document uploads are disabled for
										withdrawn applications.
									</p>
								)}
							</div>

							{/* Application Timeline */}
							<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
								<h2 className="text-2xl font-heading font-bold text-gray-700 mb-6">
									Application Timeline
								</h2>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500" />
										<div className="flex-1">
											<p className="text-gray-700 font-semibold font-body">
												Application Started
											</p>
											<p className="text-gray-600 font-body text-sm">
												{formatDate(
													application.createdAt
												)}
											</p>
										</div>
									</div>
									{application.status !== "INCOMPLETE" && (
										<div className="flex items-center gap-3">
											<div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500" />
											<div className="flex-1">
												<p className="text-gray-700 font-semibold font-body">
													Application Submitted
												</p>
												<p className="text-gray-600 font-body text-sm">
													{formatDate(
														application.updatedAt
													)}
												</p>
											</div>
										</div>
									)}
									{application.status === "WITHDRAWN" && (
										<div className="flex items-center gap-3">
											<div className="flex-shrink-0 w-3 h-3 rounded-full bg-red-500" />
											<div className="flex-1">
												<p className="text-gray-700 font-semibold font-body">
													Application Withdrawn
												</p>
												<p className="text-gray-600 font-body text-sm">
													{formatDate(
														application.updatedAt
													)}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<p className="text-gray-600 font-body">
								Application not found
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Document Upload Dialog */}
			<Dialog
				open={isDocumentDialogOpen}
				onClose={() => setIsDocumentDialogOpen(false)}
				maxWidth="md"
				fullWidth
				PaperProps={{
					style: {
						backgroundColor: "white",
						borderRadius: "12px",
						border: "1px solid #E5E7EB",
					},
				}}
			>
				<div className="p-6 bg-white">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-2xl font-heading font-bold text-purple-primary">
							Edit Documents
						</h3>
						<button
							onClick={() => setIsDocumentDialogOpen(false)}
							className="text-gray-500 hover:text-gray-700 transition-colors"
						>
							<CloseIcon className="h-6 w-6" />
						</button>
					</div>
					{application && (
						<DocumentUploadForm
							applicationId={application.id}
							productCode={application.product.code}
							onSuccess={() => {
								handleDocumentUpdate();
								setIsDocumentDialogOpen(false);
							}}
							existingDocuments={application.documents || []}
						/>
					)}
				</div>
			</Dialog>
		</DashboardLayout>
	);
}
