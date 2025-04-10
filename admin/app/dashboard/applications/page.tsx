"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { fetchWithAdminTokenRefresh } from "../../../lib/authUtils";
import Link from "next/link";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	SelectChangeEvent,
	Chip,
} from "@mui/material";

interface LoanApplication {
	id: string;
	userId: string;
	productId: string;
	amount?: number;
	term?: number;
	purpose?: string;
	status: string;
	createdAt: string;
	updatedAt: string;
	monthlyRepayment?: number;
	interestRate?: number;
	netDisbursement?: number;
	user?: {
		fullName?: string;
		phoneNumber?: string;
		email?: string;
		employmentStatus?: string;
		employerName?: string;
		monthlyIncome?: string;
		bankName?: string;
		accountNumber?: string;
		address1?: string;
		address2?: string;
		city?: string;
		state?: string;
		zipCode?: string;
	};
	product?: {
		name?: string;
		code?: string;
		description?: string;
		interestRate?: number;
		repaymentTerms?: any;
	};
	documents?: Document[];
}

interface Document {
	id: string;
	type: string;
	status: string;
	fileUrl: string;
	createdAt: string;
	updatedAt: string;
}

interface DashboardStats {
	totalUsers: number;
	totalApplications: number;
	totalLoans: number;
	totalLoanAmount: number;
	recentApplications: {
		id: string;
		userId: string;
		status: string;
		createdAt: string;
		user: {
			fullName?: string;
			email?: string;
		};
	}[];
}

export default function AdminApplicationsPage() {
	const [applications, setApplications] = useState<LoanApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [userName, setUserName] = useState("Admin");
	const [error, setError] = useState<string | null>(null);

	// Dialog states
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [selectedApplication, setSelectedApplication] =
		useState<LoanApplication | null>(null);
	const [selectedDocument, setSelectedDocument] = useState<Document | null>(
		null
	);

	// Replace single status filter with multiple filters
	const [selectedFilters, setSelectedFilters] = useState<string[]>([
		"PENDING_APPROVAL",
		"PENDING_APP_FEE",
		"PENDING_KYC",
	]);

	// Status colors for badges
	const statusColors: Record<string, { bg: string; text: string }> = {
		INCOMPLETE: { bg: "bg-gray-100", text: "text-gray-800" },
		PENDING_APP_FEE: { bg: "bg-blue-100", text: "text-blue-800" },
		PENDING_KYC: { bg: "bg-indigo-100", text: "text-indigo-800" },
		PENDING_APPROVAL: { bg: "bg-yellow-100", text: "text-yellow-800" },
		REJECTED: { bg: "bg-red-100", text: "text-red-800" },
		WITHDRAWN: { bg: "bg-gray-100", text: "text-gray-800" },
	};

	useEffect(() => {
		const fetchApplications = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch user data
				try {
					const userData = await fetchWithAdminTokenRefresh<any>(
						"/api/users/me"
					);
					if (userData.fullName) {
						setUserName(userData.fullName);
					}
				} catch (error) {
					console.error("Error fetching user data:", error);
				}

				// Try fetching applications from applications endpoint
				try {
					const applicationsData = await fetchWithAdminTokenRefresh<
						LoanApplication[]
					>("/api/admin/applications");
					setApplications(applicationsData);
				} catch (appError) {
					console.error("Error fetching applications:", appError);

					// Fallback to dashboard data
					console.log(
						"Falling back to dashboard data for applications"
					);
					try {
						const dashboardData =
							await fetchWithAdminTokenRefresh<DashboardStats>(
								"/api/admin/dashboard"
							);

						// Convert dashboard recent applications to full application format
						const recentApps = dashboardData.recentApplications.map(
							(app) => ({
								...app,
								productId: "",
								updatedAt: app.createdAt,
							})
						);

						setApplications(recentApps);
					} catch (dashboardError) {
						console.error(
							"Error fetching dashboard data:",
							dashboardError
						);
						setError(
							"Failed to load applications. Please check API implementation."
						);
					}
				}

				// Check for application ID in URL query params
				const params = new URLSearchParams(window.location.search);
				const applicationId = params.get("id");

				if (applicationId && applications.length > 0) {
					const selectedApp = applications.find(
						(app) => app.id === applicationId
					);
					if (selectedApp) {
						setSelectedApplication(selectedApp);
						setViewDialogOpen(true);
					}
				}
			} catch (error) {
				console.error("Error in applications page:", error);
				setError("An unexpected error occurred.");
			} finally {
				setLoading(false);
			}
		};

		fetchApplications();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const formatCurrency = (amount?: number) => {
		if (!amount) return "N/A";
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	// Filter applications to exclude approved and disbursed ones
	const filteredApplications = applications.filter((app) => {
		// Exclude approved and disbursed applications
		if (app.status === "APPROVED" || app.status === "DISBURSED") {
			return false;
		}

		// Filter by search term
		const searchTerm = search.toLowerCase();
		const matchesSearch =
			(app.user?.fullName?.toLowerCase() || "").includes(searchTerm) ||
			(app.purpose?.toLowerCase() || "").includes(searchTerm) ||
			(app.product?.name?.toLowerCase() || "").includes(searchTerm) ||
			(app.status?.toLowerCase() || "").includes(searchTerm);

		// Filter by statuses - if no filters selected, show all
		const matchesStatus =
			selectedFilters.length === 0 ||
			selectedFilters.includes(app.status || "");

		return matchesSearch && matchesStatus;
	});

	// Handle filter toggle
	const toggleFilter = (status: string) => {
		if (selectedFilters.includes(status)) {
			setSelectedFilters(selectedFilters.filter((s) => s !== status));
		} else {
			setSelectedFilters([...selectedFilters, status]);
		}
	};

	// Handle view application details
	const handleViewClick = (application: LoanApplication) => {
		setSelectedApplication(application);
		setViewDialogOpen(true);
	};

	const handleViewClose = () => {
		setViewDialogOpen(false);
		setSelectedApplication(null);
	};

	// Handle status change
	const handleStatusChange = async (
		applicationId: string,
		newStatus: string
	) => {
		try {
			const updatedApplication =
				await fetchWithAdminTokenRefresh<LoanApplication>(
					`/api/admin/applications/${applicationId}/status`,
					{
						method: "PATCH",
						body: JSON.stringify({ status: newStatus }),
					}
				);

			setApplications(
				applications.map((app) =>
					app.id === applicationId ? updatedApplication : app
				)
			);

			if (selectedApplication?.id === applicationId) {
				setSelectedApplication(updatedApplication);
			}
		} catch (error) {
			console.error("Error updating application status:", error);
			alert(
				"Failed to update status. API endpoint may not be implemented yet."
			);
		}
	};

	const getDocumentTypeName = (type: string): string => {
		const documentTypeMap: Record<string, string> = {
			ID: "Identification Document",
			PAYSLIP: "Pay Slip",
			BANK_STATEMENT: "Bank Statement",
			UTILITY_BILL: "Utility Bill",
			EMPLOYMENT_LETTER: "Employment Letter",
			OTHER: "Other Document",
		};

		return documentTypeMap[type] || type;
	};

	const getDocumentStatusColor = (
		status: string
	): { bg: string; text: string } => {
		const statusMap: Record<string, { bg: string; text: string }> = {
			PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
			APPROVED: { bg: "bg-green-100", text: "text-green-800" },
			REJECTED: { bg: "bg-red-100", text: "text-red-800" },
		};

		return (
			statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800" }
		);
	};

	// Format document URL by prepending backend URL if it's a relative path
	const formatDocumentUrl = (fileUrl: string): string => {
		if (!fileUrl) return "";

		// If the URL already includes http(s), it's already an absolute URL
		if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
			return fileUrl;
		}

		// For relative URLs, use the loan-applications API endpoint instead of direct file access
		if (selectedApplication) {
			return `${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${selectedApplication.id}/documents/${selectedDocument?.id}`;
		}

		// Fallback to old method if no application is selected (this shouldn't happen in normal usage)
		const backendUrl = process.env.NEXT_PUBLIC_API_URL;
		const cleanFileUrl = fileUrl.startsWith("/")
			? fileUrl.substring(1)
			: fileUrl;
		return `${backendUrl}/${cleanFileUrl}`;
	};

	// Handle document status change
	const handleDocumentStatusChange = async (
		documentId: string,
		newStatus: string
	) => {
		try {
			if (!selectedApplication) return;

			// Call the API to update document status
			const updatedDocument = await fetchWithAdminTokenRefresh<any>(
				`/api/admin/documents/${documentId}/status`,
				{
					method: "PATCH",
					body: JSON.stringify({ status: newStatus }),
				}
			);

			// Update the application in state with the new document status
			if (selectedApplication && selectedApplication.documents) {
				const updatedDocuments = selectedApplication.documents.map(
					(doc) =>
						doc.id === documentId
							? { ...doc, status: newStatus }
							: doc
				);

				setSelectedApplication({
					...selectedApplication,
					documents: updatedDocuments,
				});

				// Also update in the applications list
				setApplications(
					applications.map((app) =>
						app.id === selectedApplication.id
							? { ...app, documents: updatedDocuments }
							: app
					)
				);
			}

			console.log(
				`Document ${documentId} status updated to ${newStatus}`
			);
		} catch (error) {
			console.error("Error updating document status:", error);
			alert(
				"Failed to update document status. API endpoint may not be implemented yet."
			);
		}
	};

	if (loading) {
		return (
			<AdminLayout userName={userName}>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout
			title="Loan Applications"
			description="View and manage pending loan applications"
		>
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-gray-900">
							Pending Applications
						</h2>
					</div>

					{error && (
						<div className="mt-4 p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
							<p className="flex items-center">
								<svg
									className="h-5 w-5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								{error}
							</p>
						</div>
					)}

					{/* Filters */}
					<div className="mt-4 space-y-4">
						<div className="max-w-full">
							<input
								type="text"
								placeholder="Search applications..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<span className="text-xs font-medium text-gray-500 flex items-center mr-2">
								Filter by:
							</span>
							{[
								"INCOMPLETE",
								"PENDING_APP_FEE",
								"PENDING_KYC",
								"PENDING_APPROVAL",
								"REJECTED",
								"WITHDRAWN",
							].map((status) => (
								<button
									key={status}
									onClick={() => toggleFilter(status)}
									className={`px-3 py-1 text-xs rounded-full flex items-center transition-colors ${
										selectedFilters.includes(status)
											? `${
													statusColors[status]?.bg ||
													"bg-gray-100"
											  } ${
													statusColors[status]
														?.text ||
													"text-gray-800"
											  } border-2 border-gray-400`
											: "bg-gray-50 text-gray-500 border border-gray-200"
									}`}
								>
									{status.replace(/_/g, " ")}
									{selectedFilters.includes(status) && (
										<svg
											className="ml-1 h-3 w-3"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</button>
							))}
							{selectedFilters.length > 0 && (
								<button
									onClick={() => setSelectedFilters([])}
									className="px-3 py-1 text-xs rounded-full text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100"
								>
									Clear All
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Applications Table */}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Customer
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Product
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Loan Amount
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Term
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Status
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Applied
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredApplications.length > 0 ? (
								filteredApplications.map((application) => (
									<tr key={application.id}>
										<td className="px-6 py-4">
											<div className="text-sm font-medium text-gray-900">
												{application.user?.fullName ||
													"Unknown"}
											</div>
											<div className="text-xs text-gray-500">
												{application.user?.email ||
													"N/A"}
											</div>
											<div className="text-xs text-gray-500">
												{application.user
													?.phoneNumber || "N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{application.product?.name ||
													"N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{application.amount
													? formatCurrency(
															application.amount
													  )
													: "N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{application.term
													? `${application.term} months`
													: "N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													statusColors[
														application.status
													]?.bg || "bg-gray-100"
												} ${
													statusColors[
														application.status
													]?.text || "text-gray-800"
												}`}
											>
												{application.status?.replace(
													/_/g,
													" "
												) || "Unknown"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(application.createdAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														handleViewClick(
															application
														)
													}
													className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
												>
													View Details
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={7}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
									>
										No applications found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* View Application Dialog */}
			{selectedApplication && (
				<Dialog
					open={viewDialogOpen}
					onClose={handleViewClose}
					aria-labelledby="view-dialog-title"
					maxWidth="lg"
					fullWidth
				>
					<DialogTitle
						id="view-dialog-title"
						className="flex justify-between items-center"
					>
						<span>Application Details</span>
						<Button onClick={handleViewClose} color="primary">
							Close
						</Button>
					</DialogTitle>
					<DialogContent>
						<div className="mt-4 space-y-6">
							{/* Application ID and Status Section */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-md">
								<div className="space-y-4">
									<div>
										<h3 className="text-sm font-medium text-gray-500">
											Application ID
										</h3>
										<p className="mt-1 text-sm text-gray-900 font-mono">
											{selectedApplication.id}
										</p>
									</div>
									<div>
										<h3 className="text-sm font-medium text-gray-500">
											Current Status
										</h3>
										<div className="mt-1">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													statusColors[
														selectedApplication
															.status
													]?.bg || "bg-gray-100"
												} ${
													statusColors[
														selectedApplication
															.status
													]?.text || "text-gray-800"
												}`}
											>
												{selectedApplication.status?.replace(
													/_/g,
													" "
												) || "Unknown"}
											</span>
										</div>
									</div>
								</div>

								<div className="space-y-4">
									{selectedApplication.product && (
										<div>
											<h3 className="text-sm font-medium text-gray-500">
												Product
											</h3>
											<p className="mt-1 text-sm text-gray-900 font-medium">
												{selectedApplication.product
													?.name || "Unknown Product"}
											</p>
										</div>
									)}

									<div>
										<h3 className="text-sm font-medium text-gray-500">
											Applied On
										</h3>
										<p className="mt-1 text-sm text-gray-900">
											{formatDate(
												selectedApplication.createdAt
											)}
										</p>
									</div>
								</div>
							</div>

							{/* Customer Details Section */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-base font-medium text-gray-800 mb-4">
									Customer Information
								</h3>

								{/* Personal Information Section */}
								<div className="mb-6">
									<h4 className="text-lg font-semibold text-gray-700 mb-3">
										Personal Information
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Full Name
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.fullName || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Email
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.email || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Phone Number
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.phoneNumber || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Employment Status
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.employmentStatus ||
														"N/A"}
												</p>
											</div>
										</div>
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Employer
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.employerName || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Monthly Income
												</p>
												<p className="text-md text-gray-900">
													{selectedApplication.user
														?.monthlyIncome
														? formatCurrency(
																parseInt(
																	selectedApplication
																		.user
																		.monthlyIncome
																)
														  )
														: "N/A"}
												</p>
											</div>
										</div>
									</div>
								</div>

								{/* Address Section */}
								{selectedApplication.user?.address1 && (
									<div className="mb-6">
										<h4 className="text-lg font-semibold text-gray-700 mb-3">
											Address
										</h4>
										<div className="bg-gray-50 p-4 rounded-md">
											<p className="text-md">
												{
													selectedApplication.user
														.address1
												}
												{selectedApplication.user
													.address2 && (
													<>
														<br />
														{
															selectedApplication
																.user.address2
														}
													</>
												)}
											</p>
											<p className="text-md mt-2">
												{[
													selectedApplication.user
														.city,
													selectedApplication.user
														.state,
													selectedApplication.user
														.zipCode,
												]
													.filter(Boolean)
													.join(", ")}
											</p>
										</div>
									</div>
								)}

								{/* Banking Information */}
								{(selectedApplication.user?.bankName ||
									selectedApplication.user
										?.accountNumber) && (
									<div>
										<h4 className="text-lg font-semibold text-gray-700 mb-3">
											Banking Details
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{selectedApplication.user
												.bankName && (
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Bank Name
													</p>
													<p className="text-md text-gray-900">
														{
															selectedApplication
																.user.bankName
														}
													</p>
												</div>
											)}
											{selectedApplication.user
												.accountNumber && (
												<div className="space-y-1">
													<p className="text-sm font-medium text-gray-500">
														Account Number
													</p>
													<p className="text-md text-gray-900">
														{
															selectedApplication
																.user
																.accountNumber
														}
													</p>
												</div>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Loan Details Section - Enhanced */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-base font-medium text-gray-800 mb-4">
									Loan Details
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Product
										</p>
										<p className="text-md text-gray-900 font-medium">
											{selectedApplication.product
												?.name || "N/A"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Loan Amount
										</p>
										<p className="text-md text-gray-900 font-medium">
											{formatCurrency(
												selectedApplication.amount || 0
											)}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Loan Purpose
										</p>
										<p className="text-md text-gray-900">
											{selectedApplication.purpose ||
												"N/A"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Loan Term
										</p>
										<p className="text-md text-gray-900">
											{selectedApplication.term
												? `${selectedApplication.term} months`
												: "N/A"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Interest Rate
										</p>
										<p className="text-md text-gray-900">
											{selectedApplication.interestRate
												? `${selectedApplication.interestRate}% monthly`
												: "N/A"}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium text-gray-500">
											Monthly Repayment
										</p>
										<p className="text-md text-gray-900 font-medium">
											{formatCurrency(
												selectedApplication.monthlyRepayment ||
													0
											)}
										</p>
									</div>

									{/* Fees section */}
									<div className="col-span-2 md:col-span-3 mt-3 pt-3 border-t border-gray-200">
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
											<div className="space-y-1">
												<p className="text-sm font-medium text-gray-500">
													Origination Fee (2%)
												</p>
												<p className="text-md text-red-600">
													{selectedApplication.amount
														? `(${formatCurrency(
																selectedApplication.amount *
																	0.02
														  )})`
														: "N/A"}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium text-gray-500">
													Legal Fee (3%)
												</p>
												<p className="text-md text-red-600">
													{selectedApplication.amount
														? `(${formatCurrency(
																selectedApplication.amount *
																	0.03
														  )})`
														: "N/A"}
												</p>
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium text-gray-500">
													Application Fee
												</p>
												<p className="text-md text-red-600">
													(RM 50.00)
												</p>
											</div>
										</div>
									</div>

									{/* Net disbursement */}
									<div className="col-span-2 md:col-span-3 mt-3 pt-3 border-t border-gray-200">
										<div className="flex justify-between items-center">
											<p className="text-md font-bold text-gray-700">
												Net Loan Disbursement
											</p>
											<p className="text-lg font-bold text-green-600">
												{formatCurrency(
													selectedApplication.netDisbursement ||
														0
												)}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Documents Section - Redesigned - MOVED ABOVE STATUS */}
							{selectedApplication.documents &&
								selectedApplication.documents.length > 0 && (
									<div className="border border-gray-200 rounded-md p-4">
										<h3 className="text-base font-medium text-gray-800 mb-4">
											Documents
										</h3>
										<p className="text-sm text-gray-600 mb-4">
											Documents uploaded by the customer
											for verification purposes.
										</p>

										<div className="space-y-4">
											{selectedApplication.documents.map(
												(doc) => {
													// Determine file type for icon
													const fileExtension =
														doc.fileUrl
															.split(".")
															.pop()
															?.toLowerCase();
													const isImage = [
														"jpg",
														"jpeg",
														"png",
														"gif",
														"webp",
													].includes(
														fileExtension || ""
													);
													const isPdf =
														fileExtension === "pdf";

													return (
														<div
															key={doc.id}
															className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
														>
															<div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
																<div className="flex items-center">
																	<div className="flex-shrink-0 mr-3">
																		{isImage ? (
																			<svg
																				className="h-6 w-6 text-blue-500"
																				fill="currentColor"
																				viewBox="0 0 20 20"
																			>
																				<path
																					fillRule="evenodd"
																					d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
																					clipRule="evenodd"
																				/>
																			</svg>
																		) : isPdf ? (
																			<svg
																				className="h-6 w-6 text-red-500"
																				fill="currentColor"
																				viewBox="0 0 20 20"
																			>
																				<path
																					fillRule="evenodd"
																					d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
																					clipRule="evenodd"
																				/>
																				<path d="M8 11a1 1 0 100-2 1 1 0 000 2zm0 0a1 1 0 100-2 1 1 0 000 2zm.82 3H7v-1h1.82C9.44 13 10 12.44 10 11.82c0-.62-.56-1.18-1.18-1.18h-1.64v4.72h-1V9h2.64c1.3 0 2.36 1.06 2.36 2.36 0 1.3-1.06 2.37-2.36 2.37z" />
																			</svg>
																		) : (
																			<svg
																				className="h-6 w-6 text-gray-400"
																				fill="currentColor"
																				viewBox="0 0 20 20"
																			>
																				<path
																					fillRule="evenodd"
																					d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
																					clipRule="evenodd"
																				/>
																			</svg>
																		)}
																	</div>
																	<div>
																		<h4 className="text-sm font-medium text-gray-900">
																			{getDocumentTypeName(
																				doc.type
																			)}
																		</h4>
																		<p className="text-xs text-gray-500">
																			Uploaded
																			on{" "}
																			{new Date(
																				doc.createdAt
																			).toLocaleDateString()}
																		</p>
																	</div>
																</div>
																<span
																	className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
															${getDocumentStatusColor(doc.status).bg} 
															${getDocumentStatusColor(doc.status).text}`}
																>
																	{doc.status}
																</span>
															</div>

															{/* Document actions */}
															<div className="p-4 flex flex-wrap gap-2">
																<a
																	href={formatDocumentUrl(
																		doc.fileUrl
																	)}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
																	onClick={() =>
																		setSelectedDocument(
																			doc
																		)
																	}
																>
																	<svg
																		className="h-4 w-4 mr-2"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={
																				2
																			}
																			d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
																		/>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={
																				2
																			}
																			d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
																		/>
																	</svg>
																	View
																	Document
																</a>
																<a
																	href={formatDocumentUrl(
																		doc.fileUrl
																	)}
																	download
																	className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
																	onClick={() =>
																		setSelectedDocument(
																			doc
																		)
																	}
																>
																	<svg
																		className="h-4 w-4 mr-2"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={
																				2
																			}
																			d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
																		/>
																	</svg>
																	Download
																</a>

																{/* Document approval actions */}
																<div className="ml-auto flex gap-2">
																	<button
																		onClick={() =>
																			handleDocumentStatusChange(
																				doc.id,
																				"APPROVED"
																			)
																		}
																		disabled={
																			doc.status ===
																			"APPROVED"
																		}
																		className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md ${
																			doc.status ===
																			"APPROVED"
																				? "bg-gray-100 text-gray-400 cursor-not-allowed"
																				: "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
																		}`}
																	>
																		<svg
																			className="h-4 w-4 mr-2"
																			fill="none"
																			viewBox="0 0 24 24"
																			stroke="currentColor"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={
																					2
																				}
																				d="M5 13l4 4L19 7"
																			/>
																		</svg>
																		Approve
																	</button>

																	<button
																		onClick={() =>
																			handleDocumentStatusChange(
																				doc.id,
																				"REJECTED"
																			)
																		}
																		disabled={
																			doc.status ===
																			"REJECTED"
																		}
																		className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm font-medium rounded-md ${
																			doc.status ===
																			"REJECTED"
																				? "bg-gray-100 text-gray-400 cursor-not-allowed"
																				: "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
																		}`}
																	>
																		<svg
																			className="h-4 w-4 mr-2"
																			fill="none"
																			viewBox="0 0 24 24"
																			stroke="currentColor"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth={
																					2
																				}
																				d="M6 18L18 6M6 6l12 12"
																			/>
																		</svg>
																		Reject
																	</button>
																</div>
															</div>
														</div>
													);
												}
											)}
										</div>

										{/* Document status summary */}
										<div className="mt-4 bg-gray-50 rounded-md p-4">
											<div className="flex justify-between items-center">
												<div className="text-sm text-gray-500">
													<span className="font-medium">
														Total documents:
													</span>{" "}
													{
														selectedApplication
															.documents.length
													}
												</div>
												<div className="flex gap-2">
													<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
														{
															selectedApplication.documents.filter(
																(d) =>
																	d.status ===
																	"PENDING"
															).length
														}{" "}
														Pending
													</span>
													<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
														{
															selectedApplication.documents.filter(
																(d) =>
																	d.status ===
																	"APPROVED"
															).length
														}{" "}
														Approved
													</span>
													<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
														{
															selectedApplication.documents.filter(
																(d) =>
																	d.status ===
																	"REJECTED"
															).length
														}{" "}
														Rejected
													</span>
												</div>
											</div>
										</div>
									</div>
								)}

							{/* Missing documents notification */}
							{(!selectedApplication.documents ||
								selectedApplication.documents.length === 0) && (
								<div className="border border-gray-200 rounded-md p-4 bg-yellow-50">
									<div className="flex items-center">
										<svg
											className="h-6 w-6 text-yellow-600 mr-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
											/>
										</svg>
										<h3 className="text-base font-medium text-yellow-800">
											No Documents Uploaded
										</h3>
									</div>
									<p className="mt-2 text-sm text-yellow-700 ml-9">
										This application does not have any
										uploaded documents yet. Documents are
										required for verification purposes.
									</p>
								</div>
							)}

							{/* Status Update Section - Improved - WITH PENDING_APP_FEE ADDED */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-base font-medium text-gray-800 mb-4">
									Application Status
								</h3>
								<div className="flex items-center mb-4">
									<span className="mr-2 text-sm font-medium text-gray-500">
										Current status:
									</span>
									<span
										className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
											statusColors[
												selectedApplication.status
											]?.bg || "bg-gray-100"
										} ${
											statusColors[
												selectedApplication.status
											]?.text || "text-gray-800"
										}`}
									>
										{selectedApplication.status?.replace(
											/_/g,
											" "
										) || "Unknown"}
									</span>
								</div>
								<div className="bg-gray-50 p-4 rounded-md">
									<p className="text-sm font-medium text-gray-600 mb-3">
										Update application status to:
									</p>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
										{[
											"PENDING_APP_FEE",
											"PENDING_KYC",
											"PENDING_APPROVAL",
											"REJECTED",
										].map((status) => (
											<button
												key={status}
												onClick={() =>
													handleStatusChange(
														selectedApplication.id,
														status
													)
												}
												disabled={
													selectedApplication.status ===
													status
												}
												className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 
													${
														selectedApplication.status ===
														status
															? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
															: `${
																	statusColors[
																		status
																	]?.bg ||
																	"bg-gray-100"
															  } ${
																	statusColors[
																		status
																	]?.text ||
																	"text-gray-800"
															  } hover:bg-opacity-80 border border-gray-200 hover:shadow-sm`
													}`}
											>
												{status.replace(/_/g, " ")}
											</button>
										))}
									</div>

									{/* Add the "Approve" option with notification */}
									<div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
										<h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
											<svg
												className="h-5 w-5 mr-2"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Approve Application
										</h4>
										<p className="text-xs text-green-700 mb-3">
											Approving this application will move
											it to the "Active Loans" section.
										</p>
										<button
											onClick={() =>
												handleStatusChange(
													selectedApplication.id,
													"APPROVED"
												)
											}
											disabled={
												selectedApplication.status ===
												"APPROVED"
											}
											className="w-full px-4 py-2 text-sm font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 border border-green-200"
										>
											Approve & Move to Loans
										</button>
									</div>
								</div>
							</div>

							{/* Application Timeline Section */}
							<div className="border border-gray-200 rounded-md p-4">
								<h3 className="text-base font-medium text-gray-800 mb-2">
									Application Timeline
								</h3>
								<div className="mt-2 flex justify-between items-center text-sm">
									<p className="text-gray-600">
										<span className="font-medium">
											Created:
										</span>{" "}
										{formatDate(
											selectedApplication.createdAt
										)}
									</p>
									<p className="text-gray-600">
										<span className="font-medium">
											Last Updated:
										</span>{" "}
										{formatDate(
											selectedApplication.updatedAt
										)}
									</p>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</AdminLayout>
	);
}
