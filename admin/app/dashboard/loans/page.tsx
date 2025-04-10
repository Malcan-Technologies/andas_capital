"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { fetchWithAdminTokenRefresh } from "../../../lib/authUtils";
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Chip,
	Paper,
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TableContainer,
	CircularProgress,
	Grid,
} from "@mui/material";

interface Loan {
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
	disbursementDate?: string;
	nextPaymentDate?: string;
	totalPaid?: number;
	outstandingBalance?: number;
	dueAmount?: number;
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

export default function AdminLoansPage() {
	const [loans, setLoans] = useState<Loan[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [userName, setUserName] = useState("Admin");
	const [error, setError] = useState<string | null>(null);

	// Dialog states
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

	// Status filters - only for active loans
	const [selectedFilters, setSelectedFilters] = useState<string[]>([
		"APPROVED",
		"DISBURSED",
	]);

	// Status colors for badges
	const statusColors: Record<string, { bg: string; text: string }> = {
		APPROVED: { bg: "bg-green-100", text: "text-green-800" },
		DISBURSED: { bg: "bg-purple-100", text: "text-purple-800" },
	};

	useEffect(() => {
		const fetchLoans = async () => {
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

				// Fetch all applications and filter for approved/disbursed
				try {
					const applicationsData = await fetchWithAdminTokenRefresh<
						Loan[]
					>("/api/admin/applications");

					// Filter applications to only keep approved and disbursed (loans)
					const activeLoans = applicationsData.filter(
						(app) =>
							app.status === "APPROVED" ||
							app.status === "DISBURSED"
					);

					setLoans(activeLoans);
				} catch (appError) {
					console.error("Error fetching loans:", appError);
					setError(
						"Failed to load loans. Please check API implementation."
					);
				}
			} catch (error) {
				console.error("Error in loans page:", error);
				setError("An unexpected error occurred.");
			} finally {
				setLoading(false);
			}
		};

		fetchLoans();
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

	// Calculate total fees
	const calculateTotalFees = (loan: Loan) => {
		if (!loan.amount) return "N/A";
		const originationFee = loan.amount * 0.02;
		const legalFee = loan.amount * 0.03;
		const applicationFee = 50;
		return formatCurrency(originationFee + legalFee + applicationFee);
	};

	// Filter loans by search term and status
	const filteredLoans = loans.filter((loan) => {
		// Filter by search term
		const searchTerm = search.toLowerCase();
		const matchesSearch =
			(loan.user?.fullName?.toLowerCase() || "").includes(searchTerm) ||
			(loan.purpose?.toLowerCase() || "").includes(searchTerm) ||
			(loan.product?.name?.toLowerCase() || "").includes(searchTerm) ||
			(loan.status?.toLowerCase() || "").includes(searchTerm);

		// Filter by statuses - if no filters selected, show all
		const matchesStatus =
			selectedFilters.length === 0 ||
			selectedFilters.includes(loan.status || "");

		return matchesSearch && matchesStatus;
	});

	// Toggle status filter
	const toggleFilter = (status: string) => {
		if (selectedFilters.includes(status)) {
			setSelectedFilters(selectedFilters.filter((s) => s !== status));
		} else {
			setSelectedFilters([...selectedFilters, status]);
		}
	};

	// Handle view loan details
	const handleViewClick = (loan: Loan) => {
		setSelectedLoan(loan);
		setViewDialogOpen(true);
	};

	const handleViewClose = () => {
		setViewDialogOpen(false);
		setSelectedLoan(null);
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
			title="Active Loans"
			description="View and manage approved and disbursed loans"
		>
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex justify-between items-center">
						<h2 className="text-xl font-semibold text-gray-900">
							Active Loans
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
								placeholder="Search loans..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
							/>
						</div>
						<div className="flex flex-wrap gap-2">
							<span className="text-xs font-medium text-gray-500 flex items-center mr-2">
								Filter by:
							</span>
							{["APPROVED", "DISBURSED"].map((status) => (
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

				{/* Loans Table */}
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
									Monthly Repayment
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Fees
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
									Date
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
							{filteredLoans.length > 0 ? (
								filteredLoans.map((loan) => (
									<tr key={loan.id}>
										<td className="px-6 py-4">
											<div className="text-sm font-medium text-gray-900">
												{loan.user?.fullName ||
													"Unknown"}
											</div>
											<div className="text-xs text-gray-500">
												{loan.user?.email || "N/A"}
											</div>
											<div className="text-xs text-gray-500">
												{loan.user?.phoneNumber ||
													"N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{loan.product?.name ||
													"Unknown Product"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatCurrency(
													loan.amount || 0
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{loan.term
													? `${loan.term} months`
													: "N/A"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{formatCurrency(
													loan.monthlyRepayment || 0
												)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{calculateTotalFees(loan)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
													statusColors[loan.status]
														?.bg || "bg-gray-100"
												} ${
													statusColors[loan.status]
														?.text ||
													"text-gray-800"
												}`}
											>
												{loan.status?.replace(
													/_/g,
													" "
												) || "Unknown"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{formatDate(loan.updatedAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<div className="flex items-center gap-2">
												<button
													onClick={() =>
														handleViewClick(loan)
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
										colSpan={9}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
									>
										No loans found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Loan Details Dialog */}
			{selectedLoan && (
				<Dialog
					open={viewDialogOpen}
					onClose={handleViewClose}
					aria-labelledby="view-dialog-title"
					maxWidth="md"
					fullWidth
				>
					<DialogTitle
						id="view-dialog-title"
						className="flex justify-between items-center"
					>
						<span>
							Loan Details - {selectedLoan.id.substring(0, 8)}
						</span>
						<Button onClick={handleViewClose} color="primary">
							Close
						</Button>
					</DialogTitle>
					<DialogContent>
						<div className="space-y-6 mt-2">
							{/* Loan Information */}
							<Paper elevation={1}>
								<Box p={3}>
									<Typography
										variant="h6"
										component="h3"
										gutterBottom
									>
										Loan Information
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Amount
												</p>
												<p className="text-md text-gray-900">
													{formatCurrency(
														selectedLoan.amount || 0
													)}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Term
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.term
														? `${selectedLoan.term} months`
														: "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Product
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.product
														?.name ||
														"Unknown Product"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Purpose
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.purpose ||
														"N/A"}
												</p>
											</div>
										</div>
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Status
												</p>
												<p className="text-md text-gray-900">
													<span
														className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
															statusColors[
																selectedLoan
																	.status
															]?.bg ||
															"bg-gray-100"
														} ${
															statusColors[
																selectedLoan
																	.status
															]?.text ||
															"text-gray-800"
														}`}
													>
														{selectedLoan.status?.replace(
															/_/g,
															" "
														) || "Unknown"}
													</span>
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Created
												</p>
												<p className="text-md text-gray-900">
													{formatDate(
														selectedLoan.createdAt
													)}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Monthly Repayment
												</p>
												<p className="text-md text-gray-900 font-medium">
													{formatCurrency(
														selectedLoan.monthlyRepayment ||
															0
													)}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Total Fees
												</p>
												<p className="text-md text-gray-90">
													{calculateTotalFees(
														selectedLoan
													)}
												</p>
											</div>
										</div>
									</div>
								</Box>
							</Paper>

							{/* Borrower Information */}
							<Paper elevation={1}>
								<Box p={3}>
									<Typography
										variant="h6"
										component="h3"
										gutterBottom
									>
										Borrower Information
									</Typography>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Name
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user
														?.fullName || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Phone
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user
														?.phoneNumber || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Email
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user?.email ||
														"N/A"}
												</p>
											</div>
										</div>
										<div className="space-y-2">
											<div>
												<p className="text-sm font-medium text-gray-500">
													Employment
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user
														?.employmentStatus ||
														"N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Employer
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user
														?.employerName || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-500">
													Monthly Income
												</p>
												<p className="text-md text-gray-900">
													{selectedLoan.user
														?.monthlyIncome
														? formatCurrency(
																Number(
																	selectedLoan
																		.user
																		.monthlyIncome
																)
														  )
														: "N/A"}
												</p>
											</div>
										</div>
									</div>
								</Box>
							</Paper>

							{/* Loan Documents */}
							<Paper elevation={1}>
								<Box p={3}>
									<Typography
										variant="h6"
										component="h3"
										gutterBottom
									>
										Loan Documents
									</Typography>
									{selectedLoan.documents &&
									selectedLoan.documents.length > 0 ? (
										<div className="space-y-4">
											{selectedLoan.documents.map(
												(doc) => (
													<div
														key={doc.id}
														className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
													>
														<div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
															<div className="flex items-center">
																<div>
																	<h4 className="text-sm font-medium text-gray-900">
																		{doc.type ===
																		"ID"
																			? "Identification Document"
																			: doc.type ===
																			  "BANK_STATEMENT"
																			? "Bank Statement"
																			: doc.type ===
																			  "PAYSLIP"
																			? "Pay Slip"
																			: doc.type ===
																			  "UTILITY_BILL"
																			? "Utility Bill"
																			: doc.type ===
																			  "EMPLOYMENT_LETTER"
																			? "Employment Letter"
																			: doc.type}
																	</h4>
																	<p className="text-xs text-gray-500">
																		Uploaded
																		on{" "}
																		{formatDate(
																			doc.createdAt
																		)}
																	</p>
																</div>
															</div>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
														${
															doc.status ===
															"APPROVED"
																? "bg-green-100 text-green-800"
																: doc.status ===
																  "REJECTED"
																? "bg-red-100 text-red-800"
																: "bg-yellow-100 text-yellow-800"
														}`}
															>
																{doc.status}
															</span>
														</div>
														<div className="p-3 flex flex-wrap gap-2">
															<a
																href={
																	doc.fileUrl.startsWith(
																		"http"
																	)
																		? doc.fileUrl
																		: `${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${selectedLoan.id}/documents/${doc.id}`
																}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
															>
																View Document
															</a>
															<a
																href={
																	doc.fileUrl.startsWith(
																		"http"
																	)
																		? doc.fileUrl
																		: `${process.env.NEXT_PUBLIC_API_URL}/api/loan-applications/${selectedLoan.id}/documents/${doc.id}`
																}
																download
																className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
															>
																Download
															</a>
														</div>
													</div>
												)
											)}
										</div>
									) : (
										<Box
											sx={{
												textAlign: "center",
												py: 2,
												color: "text.secondary",
											}}
										>
											No documents found
										</Box>
									)}
								</Box>
							</Paper>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</AdminLayout>
	);
}
