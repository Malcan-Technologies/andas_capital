"use client";

import { useEffect, useState } from "react";
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

export default function ApplicationDetails({
	params,
}: {
	params: { id: string };
}) {
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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "INCOMPLETE":
				return "bg-yellow-500/20 text-yellow-400";
			case "PENDING_APP_FEE":
			case "PENDING_KYC":
			case "PENDING_APPROVAL":
				return "bg-blue-500/20 text-blue-400";
			case "APPROVED":
				return "bg-green-500/20 text-green-400";
			case "REJECTED":
				return "bg-red-500/20 text-red-400";
			case "DISBURSED":
				return "bg-purple-500/20 text-purple-400";
			case "WITHDRAWN":
				return "bg-gray-500/20 text-gray-400";
			default:
				return "bg-gray-500/20 text-gray-400";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "INCOMPLETE":
				return "Incomplete";
			case "PENDING_APP_FEE":
				return "Pending Fee";
			case "PENDING_KYC":
				return "Pending KYC";
			case "PENDING_APPROVAL":
				return "Under Review";
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
		const amount = application.amount;
		const legalFee = application.legalFee;
		const netDisbursement = application.netDisbursement;
		const originationFee = amount - netDisbursement - legalFee;
		const applicationFee = Number(application.product.applicationFee) || 0;

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
			<div className="min-h-screen bg-gray-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{loading ? (
						<div className="flex justify-center items-center p-8">
							<div
								className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent align-[-0.125em]"
								role="status"
							>
								<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
									Loading...
								</span>
							</div>
						</div>
					) : application ? (
						<div className="space-y-6">
							<div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
								<div className="flex items-center justify-between border-b border-gray-700/50 pb-4 mb-4">
									<div>
										<button
											onClick={() => router.back()}
											className="mb-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-gray-300 bg-gray-800/50 backdrop-blur-md hover:bg-gray-700/50 transition-colors"
										>
											<ArrowBackIcon className="h-4 w-4 mr-2" />
											Back to Applications
										</button>
										<h1 className="text-2xl font-semibold text-white">
											Loan Application Details
										</h1>
									</div>
									<span
										className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
											application.status
										)}`}
									>
										{getStatusLabel(application.status)}
									</span>
								</div>

								{/* Loan Details Section */}
								<div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 mb-6">
									<h2 className="text-lg font-medium text-white mb-6">
										Loan Details
									</h2>
									<div className="space-y-6">
										<div className="space-y-4">
											<div className="flex justify-between">
												<span className="text-gray-400">
													Product
												</span>
												<span className="text-white font-medium">
													{application.product.name}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Loan Amount
												</span>
												<span className="text-white font-medium">
													{formatCurrency(
														application.amount
													)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Loan Purpose
												</span>
												<span className="text-white font-medium">
													{application.purpose}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Loan Term
												</span>
												<span className="text-white font-medium">
													{application.term} months
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Interest Rate
												</span>
												<span className="text-white font-medium">
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
												<div className="pt-4 border-t border-gray-700/50">
													<div className="space-y-4">
														<div className="flex justify-between">
															<span className="text-gray-400">
																Origination Fee
																(
																{
																	application
																		.product
																		.originationFee
																}
																%)
															</span>
															<span className="text-red-400">
																(
																{formatCurrency(
																	calculateFees(
																		application
																	)
																		.originationFee
																)}
																)
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-gray-400">
																Legal Fee (
																{
																	application
																		.product
																		.legalFee
																}
																%)
															</span>
															<span className="text-red-400">
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
															<span className="text-gray-400">
																Application Fee
																(paid upfront)
															</span>
															<span className="text-red-400">
																(
																{formatCurrency(
																	calculateFees(
																		application
																	)
																		.applicationFee
																)}
																)
															</span>
														</div>
													</div>
												</div>

												<div className="pt-4 border-t border-gray-700/50">
													<div className="space-y-4">
														<div className="flex justify-between">
															<span className="text-white font-bold">
																Net Loan
																Disbursement
															</span>
															<span className="text-green-400 font-bold">
																{formatCurrency(
																	calculateFees(
																		application
																	)
																		.netDisbursement
																)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-white font-bold">
																Monthly
																Repayment
															</span>
															<span className="text-red-400 font-bold">
																(
																{formatCurrency(
																	application.monthlyRepayment
																)}
																)
															</span>
														</div>
													</div>
												</div>
											</>
										)}
									</div>
								</div>

								{/* Personal Information Section */}
								{application.user && (
									<div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 mb-6">
										<h2 className="text-lg font-medium text-white mb-6">
											Personal Information
										</h2>
										<div className="space-y-4">
											<div className="flex justify-between">
												<span className="text-gray-400">
													Full Name
												</span>
												<span className="text-white font-medium">
													{application.user.fullName}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Email
												</span>
												<span className="text-white font-medium">
													{application.user.email}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Phone Number
												</span>
												<span className="text-white font-medium">
													{
														application.user
															.phoneNumber
													}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-gray-400">
													Employment Status
												</span>
												<span className="text-white font-medium">
													{
														application.user
															.employmentStatus
													}
												</span>
											</div>
											{application.user.employerName && (
												<div className="flex justify-between">
													<span className="text-gray-400">
														Employer
													</span>
													<span className="text-white font-medium">
														{
															application.user
																.employerName
														}
													</span>
												</div>
											)}
											{application.user.monthlyIncome && (
												<div className="flex justify-between">
													<span className="text-gray-400">
														Monthly Income
													</span>
													<span className="text-white font-medium">
														{formatCurrency(
															Number(
																application.user
																	.monthlyIncome
															)
														)}
													</span>
												</div>
											)}
											<div className="pt-4 border-t border-gray-700/50">
												<span className="text-white font-medium block mb-2">
													Address
												</span>
												<span className="text-gray-400 block">
													{application.user.address1}
													{application.user
														.address2 && (
														<>
															<br />
															{
																application.user
																	.address2
															}
														</>
													)}
													<br />
													{
														application.user.city
													}, {application.user.state}{" "}
													{
														application.user
															.postalCode
													}
												</span>
											</div>
										</div>
									</div>
								)}

								{/* Documents Section */}
								<div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl p-6 mb-6">
									<div className="flex justify-between items-center mb-4">
										<h2 className="text-lg font-medium text-white">
											Required Documents
										</h2>
										<button
											onClick={() =>
												setIsDocumentDialogOpen(true)
											}
											className="inline-flex items-center px-4 py-2 border border-blue-600/60 rounded-lg text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
											disabled={
												application.status ===
												"WITHDRAWN"
											}
										>
											<EditIcon className="h-4 w-4 mr-2" />
											Edit Documents
										</button>
									</div>
									<div className="divide-y divide-gray-700/50">
										{application.product
											.requiredDocuments &&
										application.product.requiredDocuments
											.length > 0 ? (
											application.product.requiredDocuments.map(
												(docType) => {
													const uploadedDocs =
														application.documents?.filter(
															(doc) =>
																doc.type ===
																docType
														) || [];
													return (
														<div
															key={docType}
															className="flex flex-col py-3"
														>
															<div className="flex justify-between items-center mb-2">
																<span className="text-sm text-gray-300">
																	{docType}
																</span>
																<span
																	className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
																		uploadedDocs.length >
																		0
																			? "bg-green-500/20 text-green-400"
																			: "bg-yellow-500/20 text-yellow-400"
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
																		(
																			doc
																		) => (
																			<div
																				key={
																					doc.id
																				}
																				className="flex justify-between items-center"
																			>
																				<span className="text-sm text-gray-400">
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
																					className="text-blue-400 hover:text-blue-300 text-sm"
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
											<div className="py-3">
												<p className="text-sm text-gray-400">
													No required documents found
												</p>
											</div>
										)}
									</div>
									{application.status === "WITHDRAWN" && (
										<Typography className="text-sm text-gray-400 mt-4">
											Document uploads are disabled for
											withdrawn applications.
										</Typography>
									)}
								</div>

								{/* Application Timeline */}
								<div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
									<h2 className="text-lg font-medium text-white mb-4">
										Application Timeline
									</h2>
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400" />
											<div className="flex-1">
												<p className="text-sm font-medium text-white">
													Application Started
												</p>
												<p className="text-sm text-gray-400">
													{formatDate(
														application.createdAt
													)}
												</p>
											</div>
										</div>
										{application.status !==
											"INCOMPLETE" && (
											<div className="flex items-center gap-3">
												<div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400" />
												<div className="flex-1">
													<p className="text-sm font-medium text-white">
														Application Submitted
													</p>
													<p className="text-sm text-gray-400">
														{formatDate(
															application.updatedAt
														)}
													</p>
												</div>
											</div>
										)}
										{application.status === "WITHDRAWN" && (
											<div className="flex items-center gap-3">
												<div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400" />
												<div className="flex-1">
													<p className="text-sm font-medium text-white">
														Application Withdrawn
													</p>
													<p className="text-sm text-gray-400">
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
						</div>
					) : (
						<div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-6">
							<p className="text-gray-400">
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
						backgroundColor: "#1F2937",
						borderRadius: "12px",
						border: "1px solid rgba(75, 85, 99, 0.5)",
					},
				}}
			>
				<div className="p-6 bg-gray-800">
					<div className="flex justify-between items-center mb-6">
						<Typography variant="h6" className="text-white">
							Edit Documents
						</Typography>
						<IconButton
							onClick={() => setIsDocumentDialogOpen(false)}
							size="small"
							className="text-gray-400 hover:text-gray-300"
						>
							<CloseIcon />
						</IconButton>
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
