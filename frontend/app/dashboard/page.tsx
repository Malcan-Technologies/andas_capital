"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import PieChart from "@/components/PieChart";
import CreditScoreGauge from "@/components/CreditScoreGauge";
import {
	ArrowRightIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	WalletIcon,
	CreditCardIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
	TokenStorage,
	fetchWithTokenRefresh,
	checkAuth,
} from "@/lib/authUtils";

interface WalletData {
	balance: number;
	availableForWithdrawal: number;
	totalDeposits: number;
	totalWithdrawals: number;
	totalDisbursed: number;
	pendingTransactions: number;
	bankConnected: boolean;
	bankName?: string;
	accountNumber?: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");
	const [walletData, setWalletData] = useState<WalletData>({
		balance: 0,
		availableForWithdrawal: 0,
		totalDeposits: 0,
		totalWithdrawals: 0,
		totalDisbursed: 0,
		pendingTransactions: 0,
		bankConnected: false,
	});
	const [incompleteApplications, setIncompleteApplications] = useState<any[]>(
		[]
	);
	const [loans, setLoans] = useState<any[]>([]);
	const [loanSummary, setLoanSummary] = useState<any>({
		totalOutstanding: 0,
		totalBorrowed: 0,
		nextPaymentDue: null,
		nextPaymentAmount: 0,
	});
	const [transactions, setTransactions] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showActiveLoans, setShowActiveLoans] = useState<boolean>(false);
	const [showApplications, setShowApplications] = useState<boolean>(false);

	useEffect(() => {
		const checkAuthAndLoadData = async () => {
			try {
				// Use the checkAuth utility to verify authentication
				const isAuthenticated = await checkAuth();

				if (!isAuthenticated) {
					console.log(
						"Dashboard - Auth check failed, redirecting to login"
					);
					router.push("/login");
					return;
				}

				// Fetch user data with automatic token refresh
				const data = await fetchWithTokenRefresh<any>("/api/users/me");
				console.log("Dashboard - Auth check data:", data);

				if (!data?.isOnboardingComplete) {
					console.log(
						"Dashboard - User has not completed onboarding, redirecting to onboarding"
					);
					router.push("/onboarding");
					return;
				}

				// Load wallet data
				fetchWalletData();

				// Set user name from the response data
				console.log("User data for name extraction:", {
					firstName: data.firstName,
					fullName: data.fullName,
					allData: data,
				});

				if (data.firstName) {
					setUserName(data.firstName);
					console.log(
						"Setting userName to firstName:",
						data.firstName
					);
				} else if (data.fullName) {
					const firstPart = data.fullName.split(" ")[0];
					setUserName(firstPart);
					console.log(
						"Setting userName to first part of fullName:",
						firstPart
					);
				} else {
					// If no name is available, use a generic greeting
					setUserName("Guest");
					console.log("Setting userName to Guest (no name found)");
				}

				// Fetch incomplete applications and loans
				fetchIncompleteApplications();
				fetchLoans();
				fetchLoanSummary();
				fetchTransactions();
			} catch (error) {
				console.error("Dashboard - Auth check error:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndLoadData();
	}, [router]);

	const fetchWalletData = async () => {
		try {
			const data = await fetchWithTokenRefresh<
				WalletData & { loanSummary: any }
			>("/api/wallet");
			if (data) {
				setWalletData({
					balance: data.balance,
					availableForWithdrawal: data.availableForWithdrawal,
					totalDeposits: data.totalDeposits,
					totalWithdrawals: data.totalWithdrawals,
					totalDisbursed: data.totalDisbursed || 0,
					pendingTransactions: data.pendingTransactions,
					bankConnected: data.bankConnected,
					bankName: data.bankName,
					accountNumber: data.accountNumber,
				});
			}
		} catch (error) {
			console.error("Error fetching wallet data:", error);
		}
	};

	const fetchIncompleteApplications = async () => {
		try {
			// Use fetchWithTokenRefresh for API calls
			const data = await fetchWithTokenRefresh<any[]>(
				"/api/loan-applications"
			);

			// Filter for incomplete and pending applications
			const filteredApps = data.filter((app: any) =>
				[
					"INCOMPLETE",
					"PENDING_APP_FEE",
					"PENDING_KYC",
					"PENDING_APPROVAL",
					"APPROVED",
					"REJECTED",
				].includes(app.status)
			);
			setIncompleteApplications(filteredApps);
		} catch (error) {
			console.error("Error fetching incomplete applications:", error);
		}
	};

	const fetchLoans = async () => {
		try {
			const data = await fetchWithTokenRefresh<{ loans: any[] }>(
				"/api/loans"
			);
			if (data?.loans) {
				setLoans(data.loans);
			}
		} catch (error) {
			console.error("Error fetching loans:", error);
		}
	};

	const fetchLoanSummary = async () => {
		try {
			const data = await fetchWithTokenRefresh<any>("/api/wallet");
			if (data?.loanSummary) {
				setLoanSummary(data.loanSummary);
			}
		} catch (error) {
			console.error("Error fetching loan summary:", error);
		}
	};

	const fetchTransactions = async () => {
		try {
			const data = await fetchWithTokenRefresh<any>(
				"/api/wallet/transactions?limit=3"
			);
			if (data?.transactions) {
				setTransactions(data.transactions);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
		}
	};

	const getApplicationStatusLabel = (status: string) => {
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
			case "CLOSED":
				return "Closed";
			default:
				return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "INCOMPLETE":
				return "bg-yellow-100 text-yellow-800";
			case "PENDING_APP_FEE":
			case "PENDING_KYC":
			case "PENDING_APPROVAL":
				return "bg-blue-100 text-blue-800";
			case "APPROVED":
				return "bg-green-100 text-green-800";
			case "REJECTED":
				return "bg-red-100 text-red-800";
			case "DISBURSED":
				return "bg-purple-100 text-purple-800";
			case "CLOSED":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getTransactionIcon = (type: string) => {
		switch (type) {
			case "DEPOSIT":
			case "LOAN_DISBURSEMENT":
				return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
			case "WITHDRAWAL":
				return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
			case "LOAN_REPAYMENT":
				return (
					<svg
						className="h-5 w-5 text-purple-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M17 8l4 4m0 0l-4 4m4-4H3"
						/>
					</svg>
				);
			default:
				return <WalletIcon className="h-5 w-5 text-gray-600" />;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "APPROVED":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
						<CheckCircleIcon className="h-3 w-3 mr-1" />
						Approved
					</span>
				);
			case "PENDING":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
						<ClockIcon className="h-3 w-3 mr-1" />
						Pending
					</span>
				);
			case "REJECTED":
				return (
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
						<ExclamationTriangleIcon className="h-3 w-3 mr-1" />
						Rejected
					</span>
				);
			default:
				return null;
		}
	};

	const getCreditScoreInfo = (score: number) => {
		if (score >= 744) {
			return {
				range: "744 - 850",
				category: "Excellent",
				description:
					"Excellent! You're viewed very favourably by lenders.",
				color: "text-green-200",
				bgColor: "bg-green-500/15",
				borderColor: "border-green-400/20",
			};
		} else if (score >= 718) {
			return {
				range: "718 - 743",
				category: "Very Good",
				description: "Very Good! You're viewed as a prime customer.",
				color: "text-lime-200",
				bgColor: "bg-lime-500/15",
				borderColor: "border-lime-400/20",
			};
		} else if (score >= 697) {
			return {
				range: "697 - 717",
				category: "Good",
				description:
					"Good! You're above average and viable for new credit.",
				color: "text-yellow-200",
				bgColor: "bg-yellow-500/15",
				borderColor: "border-yellow-400/20",
			};
		} else if (score >= 651) {
			return {
				range: "651 - 696",
				category: "Fair",
				description:
					"Fair. You're below average and less viable for credit.",
				color: "text-orange-200",
				bgColor: "bg-orange-500/15",
				borderColor: "border-orange-400/20",
			};
		} else if (score >= 529) {
			return {
				range: "529 - 650",
				category: "Low",
				description:
					"Low. You may face diﬃculties when applying for credit.",
				color: "text-orange-200",
				bgColor: "bg-orange-500/15",
				borderColor: "border-orange-400/20",
			};
		} else if (score >= 300) {
			return {
				range: "300 - 528",
				category: "Poor",
				description:
					"Poor. Your credit applications will likely be affected.",
				color: "text-red-200",
				bgColor: "bg-red-500/15",
				borderColor: "border-red-400/20",
			};
		} else {
			return {
				range: "No Score",
				category: "No Score",
				description:
					"Your score couldn't be generated due to insufficient information.",
				color: "text-gray-200",
				bgColor: "bg-gray-500/15",
				borderColor: "border-gray-400/20",
			};
		}
	};

	return (
		<DashboardLayout userName={userName}>
			{/* Incomplete Application Announcement Bar */}
			{incompleteApplications.length > 0 && (
				<div className="mb-6">
					{incompleteApplications
						.filter((app) =>
							[
								"INCOMPLETE",
								"PENDING_APP_FEE",
								"APPROVED",
							].includes(app.status)
						)
						.slice(0, 1)
						.map((app) => {
							const getAnnouncementContent = (status: string) => {
								switch (status) {
									case "INCOMPLETE":
										return {
											title: "Complete Your Loan Application",
											description: `You have an incomplete application for ${
												app.product?.name || "loan"
											}${
												app.amount
													? ` of ${formatCurrency(
															parseFloat(
																app.amount
															)
													  )}`
													: ""
											}`,
											buttonText: "Resume Application",
											buttonHref: `/dashboard/apply?applicationId=${
												app.id
											}&step=${app.appStep}&productCode=${
												app.product?.code || ""
											}`,
											gradient:
												"from-gray-900 to-gray-800",
											border: "border-gray-700/30",
										};
									case "PENDING_APP_FEE":
										return {
											title: "Application Fee Payment Required",
											description: `Your loan application is pending fee payment for ${
												app.product?.name || "loan"
											}${
												app.amount
													? ` of ${formatCurrency(
															parseFloat(
																app.amount
															)
													  )}`
													: ""
											}`,
											buttonText: "Pay Application Fee",
											buttonHref: `/dashboard/applications/${app.id}`,
											gradient:
												"from-gray-900 to-gray-800",
											border: "border-gray-700/30",
										};
									case "APPROVED":
										return {
											title: "🎉 Loan Application Approved!",
											description: `Congratulations! Your application for ${
												app.product?.name || "loan"
											}${
												app.amount
													? ` of ${formatCurrency(
															parseFloat(
																app.amount
															)
													  )}`
													: ""
											} has been approved`,
											buttonText: "View Details",
											buttonHref: `/dashboard/applications/${app.id}`,
											gradient:
												"from-gray-900 to-gray-800",
											border: "border-gray-700/30",
										};
									default:
										return {
											title: "Application Update",
											description: `Your loan application requires attention`,
											buttonText: "View Application",
											buttonHref: `/dashboard/applications/${app.id}`,
											gradient:
												"from-gray-900 to-gray-800",
											border: "border-gray-700/30",
										};
								}
							};

							const content = getAnnouncementContent(app.status);

							return (
								<div
									key={app.id}
									className={`bg-gradient-to-r ${content.gradient} backdrop-blur-md border ${content.border} rounded-xl p-4 shadow-lg`}
								>
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
										<div className="flex items-start space-x-4">
											<div className="flex-shrink-0">
												<div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
													{app.status ===
													"APPROVED" ? (
														<CheckCircleIcon className="h-6 w-6 text-white" />
													) : app.status ===
													  "PENDING_APP_FEE" ? (
														<CreditCardIcon className="h-6 w-6 text-white" />
													) : (
														<ClockIcon className="h-6 w-6 text-white" />
													)}
												</div>
											</div>
											<div className="flex-1">
												<h3 className="text-amber-300 font-semibold text-lg">
													{content.title}
												</h3>
												<p className="text-blue-100 text-sm mt-1">
													{content.description}
												</p>
												<p className="text-blue-200 text-xs mt-1">
													{app.status === "APPROVED"
														? "Approved on"
														: "Started on"}{" "}
													{formatDate(
														app.status ===
															"APPROVED"
															? app.approvedAt ||
																	app.updatedAt
															: app.createdAt
													)}
												</p>
											</div>
										</div>
										<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
											<Link
												href={content.buttonHref}
												className="inline-flex items-center justify-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30 hover:border-white/50"
											>
												<svg
													className="h-4 w-4 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d={
															app.status ===
															"PENDING_APP_FEE"
																? "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
																: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														}
													/>
												</svg>
												{content.buttonText}
											</Link>
											<button
												onClick={() => {
													setIncompleteApplications(
														incompleteApplications.filter(
															(a) =>
																a.id !== app.id
														)
													);
												}}
												className="inline-flex items-center justify-center px-3 py-2 text-white/80 hover:text-white text-sm transition-colors"
												title="Dismiss"
											>
												<svg
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									</div>
								</div>
							);
						})}
				</div>
			)}

			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Wallet Card */}
					<div className="break-inside-avoid bg-gradient-to-br from-green-700/70 via-emerald-700/70 to-teal-800/70 rounded-2xl shadow-2xl text-white overflow-hidden mb-6">
						<div className="p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
								<div className="flex items-center space-x-3">
									<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
										<WalletIcon className="h-8 w-8 text-white" />
									</div>
									<div>
										<h2 className="text-xl font-bold text-white">
											Wallet
										</h2>
										<p className="text-emerald-100 text-sm">
											Your financial hub
										</p>
									</div>
								</div>
								<Link
									href="/dashboard/wallet"
									className="text-white/80 hover:text-white text-sm font-medium inline-flex items-center bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 w-fit"
								>
									Manage
									<ArrowRightIcon className="ml-1 h-4 w-4" />
								</Link>
							</div>

							{/* Main Balance */}
							<div className="mb-6">
								<div className="text-center">
									<p className="text-emerald-100 text-sm mb-1">
										Total Balance
									</p>
									<p className="text-4xl font-bold mb-2 text-white">
										{formatCurrency(walletData.balance)}
									</p>
									<p className="text-emerald-100 text-sm">
										Available:{" "}
										{formatCurrency(
											walletData.availableForWithdrawal
										)}
									</p>
								</div>
							</div>

							{/* Quick Stats Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<div className="flex items-center space-x-2 mb-2">
										<ArrowDownIcon className="h-4 w-4 text-emerald-200" />
										<span className="text-xs font-medium text-emerald-100">
											Deposits
										</span>
									</div>
									<p className="text-lg font-bold text-white">
										{formatCurrency(
											walletData.totalDeposits
										)}
									</p>
								</div>
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<div className="flex items-center space-x-2 mb-2">
										<CreditCardIcon className="h-4 w-4 text-cyan-200" />
										<span className="text-xs font-medium text-emerald-100">
											Disbursed
										</span>
									</div>
									<p className="text-lg font-bold text-white">
										{formatCurrency(
											walletData.totalDisbursed
										)}
									</p>
								</div>
							</div>

							{/* Bank Status */}
							<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
									<div className="flex items-center space-x-3">
										<div
											className={`p-2 rounded-lg ${
												walletData.bankConnected
													? "bg-green-500/20"
													: "bg-yellow-500/20"
											} border ${
												walletData.bankConnected
													? "border-green-300/40"
													: "border-yellow-300/40"
											} backdrop-blur-sm`}
										>
											<svg
												className={`h-5 w-5 ${
													walletData.bankConnected
														? "text-green-200"
														: "text-yellow-200"
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
												/>
											</svg>
										</div>
										<div>
											<p className="font-semibold text-sm text-white">
												{walletData.bankConnected
													? "Bank Connected"
													: "Bank Not Connected"}
											</p>
											{walletData.bankConnected &&
											walletData.bankName ? (
												<p className="text-xs text-emerald-100">
													{walletData.bankName} •••
													{walletData.accountNumber?.slice(
														-4
													)}
												</p>
											) : (
												<p className="text-xs text-emerald-100">
													Connect to enable transfers
												</p>
											)}
										</div>
									</div>
									{walletData.pendingTransactions > 0 && (
										<div className="flex items-center space-x-1 bg-orange-500/20 px-2 py-1 rounded-full border border-orange-300/40 backdrop-blur-sm">
											<ClockIcon className="h-3 w-3 text-orange-200" />
											<span className="text-xs font-medium text-orange-200">
												{walletData.pendingTransactions}{" "}
												pending
											</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Credit Score Card */}
					<div className="break-inside-avoid bg-gradient-to-br from-purple-700/70 via-violet-700/70 to-indigo-800/70 rounded-2xl shadow-2xl text-white overflow-hidden mb-6">
						<div className="p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
								<div className="flex items-center space-x-3">
									<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
										<svg
											className="h-8 w-8 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
											/>
										</svg>
									</div>
									<div>
										<h2 className="text-xl font-bold text-white">
											Credit Score
										</h2>
										<p className="text-purple-100 text-sm">
											Your creditworthiness
										</p>
									</div>
								</div>
								<Link
									href="/dashboard/credit-score"
									className="text-white/80 hover:text-white text-sm font-medium inline-flex items-center bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 w-fit"
								>
									View Details
									<ArrowRightIcon className="ml-1 h-4 w-4" />
								</Link>
							</div>

							<div className="space-y-6">
								{/* Gauge Section */}
								<div className="flex flex-col items-center">
									<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20">
										<CreditScoreGauge
											score={600}
											size={240}
										/>
									</div>
								</div>

								{/* Score Info Section */}
								<div className="space-y-4">
									{(() => {
										const scoreInfo =
											getCreditScoreInfo(600);
										return (
											<>
												{/* Current Score Info */}
												<div
													className={`${scoreInfo.bgColor} rounded-xl p-4 backdrop-blur-md border ${scoreInfo.borderColor}`}
												>
													<div className="flex items-center justify-between mb-3">
														<div>
															<h3 className="text-lg font-bold text-white">
																{
																	scoreInfo.category
																}
															</h3>
															<p
																className={`text-sm ${scoreInfo.color}`}
															>
																Score Range:{" "}
																{
																	scoreInfo.range
																}
															</p>
														</div>
														<div className="text-right">
															<p className="text-2xl font-bold text-white">
																600
															</p>
															<p className="text-xs text-purple-100">
																Your Score
															</p>
														</div>
													</div>
													<p className="text-sm text-white leading-relaxed">
														{scoreInfo.description}
													</p>
												</div>

												{/* What This Means */}
												<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
													<h4 className="text-sm font-semibold text-white mb-3">
														What This Means to
														Lenders
													</h4>
													<div className="space-y-2 text-sm text-purple-100">
														{scoreInfo.category ===
															"Excellent" && (
															<>
																<p>
																	• Qualify
																	for the best
																	interest
																	rates
																</p>
																<p>
																	• Access to
																	premium
																	credit
																	products
																</p>
																<p>
																	• Higher
																	credit
																	limits
																	available
																</p>
															</>
														)}
														{scoreInfo.category ===
															"Very Good" && (
															<>
																<p>
																	• Qualify
																	for
																	competitive
																	rates
																</p>
																<p>
																	• Good
																	selection of
																	credit
																	products
																</p>
																<p>
																	• Favorable
																	loan terms
																</p>
															</>
														)}
														{scoreInfo.category ===
															"Good" && (
															<>
																<p>
																	• Qualify
																	for most
																	credit
																	products
																</p>
																<p>
																	• Standard
																	interest
																	rates apply
																</p>
																<p>
																	• Room for
																	improvement
																	exists
																</p>
															</>
														)}
														{scoreInfo.category ===
															"Fair" && (
															<>
																<p>
																	• Limited
																	credit
																	product
																	options
																</p>
																<p>
																	• Higher
																	interest
																	rates likely
																</p>
																<p>
																	• May
																	require
																	additional
																	documentation
																</p>
															</>
														)}
														{scoreInfo.category ===
															"Low" && (
															<>
																<p>
																	• Difficulty
																	qualifying
																	for credit
																</p>
																<p>
																	• High
																	interest
																	rates more
																	likely
																</p>
																<p>
																	• May
																	require
																	secured
																	credit
																	options
																</p>
															</>
														)}
														{scoreInfo.category ===
															"Poor" && (
															<>
																<p>
																	• Your
																	application
																	may be
																	rejected
																	without
																	secured
																	credit
																	options
																</p>
																<p>
																	• Very high
																	interest
																	rates
																</p>
																<p>
																	• May
																	require
																	secured
																	credit
																	options
																</p>
															</>
														)}
													</div>
												</div>

												{/* Last Updated & Action */}
												<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
													<div className="flex items-center justify-between mb-3">
														<span className="text-sm font-medium text-purple-100">
															Last Updated
														</span>
														<span className="text-sm font-bold text-white">
															Never
														</span>
													</div>
													<button className="w-full px-4 py-3 text-sm font-medium text-white bg-white/20 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors backdrop-blur-md border border-white/30">
														Get Latest Report
													</button>
												</div>
											</>
										);
									})()}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Combined Active Loans & Applications Card - Spans 2 columns */}
				<div className="bg-gradient-to-br from-blue-700/70 via-blue-700/70 to-indigo-800/70 rounded-2xl shadow-xl text-white overflow-hidden mb-6">
					<div className="p-6">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
									<CreditCardIcon className="h-8 w-8" />
								</div>
								<div>
									<h2 className="text-xl font-bold">
										Loans & Applications
									</h2>
									<p className="text-blue-100 text-sm">
										Your borrowing overview
									</p>
								</div>
							</div>
							<Link
								href="/dashboard/loans"
								className="text-white/80 hover:text-white text-sm font-medium inline-flex items-center bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 w-fit"
							>
								View All
								<ArrowRightIcon className="ml-1 h-4 w-4" />
							</Link>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
							{/* Left Side - Summary */}
							<div>
								{loans.length > 0 ? (
									<>
										{/* Loan Summary with Pie Chart */}
										<div className="mb-6">
											<div className="bg-white/5 rounded-xl p-6 backdrop-blur-md border border-white/10">
												<div className="flex items-center justify-center gap-8">
													{/* Left Side - Total Outstanding */}
													<div className="text-center">
														<p className="text-blue-100 text-sm mb-2">
															Total Outstanding
														</p>
														<p className="text-4xl font-bold mb-2">
															{formatCurrency(
																loanSummary.totalOutstanding
															)}
														</p>
														<p className="text-blue-200 text-sm">
															of{" "}
															{formatCurrency(
																loanSummary.totalBorrowed
															)}{" "}
															borrowed
														</p>
													</div>

													{/* Right Side - Pie Chart */}
													<div className="relative">
														<svg
															width="120"
															height="120"
															viewBox="0 0 120 120"
															className="transform -rotate-90"
														>
															{/* Background Circle */}
															<circle
																cx="60"
																cy="60"
																r="50"
																fill="none"
																stroke="rgba(255,255,255,0.1)"
																strokeWidth="8"
															/>
															{/* Progress Circle */}
															<circle
																cx="60"
																cy="60"
																r="50"
																fill="none"
																stroke="url(#pieGradient)"
																strokeWidth="8"
																strokeLinecap="round"
																strokeDasharray={`${
																	loanSummary.totalBorrowed >
																	0
																		? ((loanSummary.totalBorrowed -
																				loanSummary.totalOutstanding) /
																				loanSummary.totalBorrowed) *
																		  314
																		: 0
																} 314`}
																className="transition-all duration-1000 ease-out"
															/>
															{/* Gradient Definition */}
															<defs>
																<linearGradient
																	id="pieGradient"
																	x1="0%"
																	y1="0%"
																	x2="100%"
																	y2="100%"
																>
																	<stop
																		offset="0%"
																		stopColor="#60a5fa"
																	/>
																	<stop
																		offset="100%"
																		stopColor="#22d3ee"
																	/>
																</linearGradient>
															</defs>
														</svg>
														{/* Center Text */}
														<div className="absolute inset-0 flex items-center justify-center">
															<div className="text-center">
																<p className="text-2xl font-bold text-white">
																	{loanSummary.totalBorrowed >
																	0
																		? Math.round(
																				((loanSummary.totalBorrowed -
																					loanSummary.totalOutstanding) /
																					loanSummary.totalBorrowed) *
																					100
																		  )
																		: 0}
																	%
																</p>
																<p className="text-xs text-blue-200">
																	Repaid
																</p>
															</div>
														</div>
													</div>
												</div>

												{/* Legend */}
												<div className="flex justify-center gap-6 mt-4 pt-4 border-t border-white/10">
													<div className="flex items-center gap-2">
														<div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
														<span className="text-xs text-blue-200">
															Repaid:{" "}
															{formatCurrency(
																loanSummary.totalBorrowed -
																	loanSummary.totalOutstanding
															)}
														</span>
													</div>
													<div className="flex items-center gap-2">
														<div className="w-3 h-3 rounded-full bg-white/20"></div>
														<span className="text-xs text-blue-200">
															Remaining:{" "}
															{formatCurrency(
																loanSummary.totalOutstanding
															)}
														</span>
													</div>
												</div>
											</div>
										</div>

										{/* Quick Stats Grid */}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
												<div className="flex items-center space-x-2 mb-2">
													<svg
														className="h-4 w-4 text-blue-300"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
														/>
													</svg>
													<span className="text-xs font-medium text-blue-100">
														Next Payment
													</span>
												</div>
												<p className="text-lg font-bold">
													{loanSummary.nextPaymentAmount >
													0
														? formatCurrency(
																loanSummary.nextPaymentAmount
														  )
														: "No payments"}
												</p>
												{loanSummary.nextPaymentDue && (
													<p className="text-xs text-blue-200 mt-1">
														Due{" "}
														{formatDate(
															loanSummary.nextPaymentDue
														)}
													</p>
												)}
											</div>
											<div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
												<div className="flex items-center space-x-2 mb-2">
													<svg
														className="h-4 w-4 text-cyan-300"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
														/>
													</svg>
													<span className="text-xs font-medium text-blue-100">
														Active Loans
													</span>
												</div>
												<p className="text-lg font-bold">
													{loans.length}
												</p>
												<p className="text-xs text-blue-200 mt-1">
													{loans.length === 1
														? "loan"
														: "loans"}{" "}
													active
												</p>
											</div>
										</div>
									</>
								) : (
									<>
										{/* No Loans State */}
										<div className="mb-6">
											<div className="text-center mb-4">
												<p className="text-blue-100 text-sm mb-1">
													Total Outstanding
												</p>
												<p className="text-3xl font-bold mb-2">
													{formatCurrency(0)}
												</p>
												<p className="text-blue-100 text-sm">
													No active loans
												</p>
											</div>

											{/* Empty Progress Bar */}
											<div className="bg-white/5 rounded-xl p-4 backdrop-blur-md border border-white/10">
												<div className="flex items-center justify-between mb-3">
													<span className="text-sm font-medium text-blue-100">
														Repayment Progress
													</span>
													<span className="text-sm font-bold text-blue-200">
														0%
													</span>
												</div>
												<div className="w-full bg-white/15 rounded-full h-3 overflow-hidden border border-white/10">
													<div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg w-0"></div>
												</div>
												<div className="flex justify-between text-xs text-blue-200 mt-2">
													<span>
														Repaid:{" "}
														{formatCurrency(0)}
													</span>
													<span>
														Remaining:{" "}
														{formatCurrency(0)}
													</span>
												</div>
											</div>
										</div>

										{/* Empty State Message */}
										<div className="bg-white/5 rounded-xl p-6 backdrop-blur-md text-center border border-white/10">
											<div className="p-3 bg-white/5 rounded-xl w-fit mx-auto mb-4 border border-white/10">
												<CreditCardIcon className="h-8 w-8 text-blue-200" />
											</div>
											<h3 className="font-semibold text-lg mb-2">
												No Active Loans
											</h3>
											<p className="text-blue-100 text-sm mb-4">
												You don't have any active loans
												at the moment
											</p>
											<Link
												href="/dashboard/apply"
												className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors backdrop-blur-md border border-white/20"
											>
												Apply for a Loan
												<ArrowRightIcon className="ml-2 h-4 w-4" />
											</Link>
										</div>
									</>
								)}
							</div>

							{/* Right Side - Loans & Applications */}
							<div className="space-y-4">
								{/* Active Loans Dropdown */}
								<div className="bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
									<button
										onClick={() =>
											setShowActiveLoans(!showActiveLoans)
										}
										className="flex items-center justify-between w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors"
									>
										<h3 className="font-semibold text-sm">
											Your Active Loans ({loans.length})
										</h3>
										{showActiveLoans ? (
											<ChevronUpIcon className="h-4 w-4 text-blue-200" />
										) : (
											<ChevronDownIcon className="h-4 w-4 text-blue-200" />
										)}
									</button>

									{showActiveLoans && (
										<div className="px-4 pb-4 space-y-3">
											{loans.length > 0 ? (
												loans.map((loan: any) => (
													<div
														key={loan.id}
														className="bg-white/5 rounded-lg p-3 border border-white/10"
													>
														<div className="flex items-center justify-between mb-2">
															<p className="font-medium text-sm">
																{loan
																	.application
																	?.product
																	?.name ||
																	"Loan"}
															</p>
															<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-200 border border-blue-400/20">
																{loan.status}
															</span>
														</div>
														<div className="space-y-1 text-xs text-blue-100">
															<div className="flex justify-between">
																<span>
																	Outstanding:
																</span>
																<span className="font-medium text-red-200">
																	{formatCurrency(
																		loan.outstandingBalance
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span>
																	Monthly
																	Payment:
																</span>
																<span className="font-medium">
																	{formatCurrency(
																		loan.monthlyPayment
																	)}
																</span>
															</div>
														</div>
														{/* Progress Bar */}
														<div className="mt-3">
															<div className="w-full bg-white/15 rounded-full h-2 border border-white/10">
																<div
																	className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
																	style={{
																		width: `${Math.round(
																			((loan.principalAmount -
																				loan.outstandingBalance) /
																				loan.principalAmount) *
																				100
																		)}%`,
																	}}
																></div>
															</div>
															<div className="flex justify-between text-xs text-blue-200 mt-1">
																<span>
																	{Math.round(
																		((loan.principalAmount -
																			loan.outstandingBalance) /
																			loan.principalAmount) *
																			100
																	)}
																	% repaid
																</span>
																<span>
																	Due:{" "}
																	{formatDate(
																		loan.nextPaymentDue
																	)}
																</span>
															</div>
														</div>
													</div>
												))
											) : (
												<div className="text-center py-4">
													<p className="text-blue-200 text-sm">
														No active loans
													</p>
												</div>
											)}
										</div>
									)}
								</div>

								{/* Loan Applications Dropdown */}
								<div className="bg-white/5 rounded-xl backdrop-blur-md border border-white/10">
									<button
										onClick={() =>
											setShowApplications(
												!showApplications
											)
										}
										className="flex items-center justify-between w-full text-left p-4 hover:bg-white/5 rounded-xl transition-colors"
									>
										<h3 className="font-semibold text-sm">
											Loan Applications (
											{incompleteApplications.length})
										</h3>
										{showApplications ? (
											<ChevronUpIcon className="h-4 w-4 text-blue-200" />
										) : (
											<ChevronDownIcon className="h-4 w-4 text-blue-200" />
										)}
									</button>

									{showApplications && (
										<div className="px-4 pb-4 space-y-3">
											{loading ? (
												<div className="text-center py-4">
													<div
														className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
														role="status"
													>
														<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
															Loading...
														</span>
													</div>
												</div>
											) : incompleteApplications.length >
											  0 ? (
												incompleteApplications
													.slice(0, 3)
													.map((app) => (
														<div
															key={app.id}
															className="bg-white/5 rounded-lg p-3 border border-white/10"
														>
															<div className="flex items-center justify-between">
																<div className="flex-1">
																	<p className="font-medium text-white text-sm">
																		{app
																			.product
																			?.name ||
																			"Unnamed Product"}
																	</p>
																	{app.status ===
																	"INCOMPLETE" ? (
																		<p className="text-xs text-blue-200 mt-1">
																			Step{" "}
																			{
																				app.appStep
																			}{" "}
																			of 5
																		</p>
																	) : (
																		<div className="space-y-1 mt-1">
																			<p className="text-xs text-blue-200">
																				{formatCurrency(
																					app.amount
																				)}
																			</p>
																			<p className="text-xs text-blue-300">
																				Updated{" "}
																				{formatDate(
																					app.updatedAt
																				)}
																			</p>
																		</div>
																	)}
																</div>
																<div className="flex items-center gap-3">
																	<span
																		className={`px-2 py-1 text-xs font-medium rounded-full ${
																			app.status ===
																			"INCOMPLETE"
																				? "bg-yellow-500/15 text-yellow-200 border border-yellow-400/20"
																				: app.status ===
																						"PENDING_APPROVAL" ||
																				  app.status ===
																						"PENDING_KYC" ||
																				  app.status ===
																						"PENDING_APP_FEE"
																				? "bg-blue-500/15 text-blue-200 border border-blue-400/20"
																				: app.status ===
																				  "APPROVED"
																				? "bg-green-500/15 text-green-200 border border-green-400/20"
																				: app.status ===
																				  "REJECTED"
																				? "bg-red-500/15 text-red-200 border border-red-400/20"
																				: "bg-gray-500/15 text-gray-200 border border-gray-400/20"
																		}`}
																	>
																		{getApplicationStatusLabel(
																			app.status
																		)}
																	</span>
																	{app.status ===
																		"INCOMPLETE" && (
																		<Link
																			href={`/dashboard/apply?applicationId=${
																				app.id
																			}&step=${
																				app.appStep
																			}&productCode=${
																				app
																					.product
																					?.code ||
																				""
																			}`}
																			className="text-blue-200 hover:text-white text-xs font-medium bg-white/10 px-2 py-1 rounded border border-white/20 hover:bg-white/15 transition-colors"
																		>
																			Resume
																		</Link>
																	)}
																</div>
															</div>
														</div>
													))
											) : (
												<div className="text-center py-4">
													<p className="text-blue-200 text-sm mb-3">
														No active applications
													</p>
													<Link
														href="/dashboard/apply"
														className="inline-flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg transition-colors backdrop-blur-md border border-white/20"
													>
														Start Application
														<ArrowRightIcon className="ml-1 h-3 w-3" />
													</Link>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Recent Transactions Card */}
				{/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-medium text-gray-900">
							Recent Transactions
						</h2>
						<Link
							href="/dashboard/transactions"
							className="text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center"
						>
							View all
							<ArrowRightIcon className="ml-1 h-4 w-4" />
						</Link>
					</div>
					<p className="text-xs text-gray-500 mb-4">
						Showing your 3 most recent transactions.
					</p>
					<div className="space-y-4">
						{loading ? (
							<div className="text-center py-4">
								<div
									className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
									role="status"
								>
									<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
										Loading...
									</span>
								</div>
							</div>
						) : transactions.length > 0 ? (
							<div className="space-y-3">
								{transactions.map((transaction: any) => (
									<div
										key={transaction.id}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div className="flex items-center space-x-3">
											<div className="flex-shrink-0">
												{getTransactionIcon(
													transaction.type
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-gray-900 truncate">
													{transaction.type ===
														"DEPOSIT" && "Deposit"}
													{transaction.type ===
														"WITHDRAWAL" &&
														"Withdrawal"}
													{transaction.type ===
														"LOAN_DISBURSEMENT" &&
														"Loan Disbursement"}
													{transaction.type ===
														"LOAN_REPAYMENT" &&
														"Loan Repayment"}
												</p>
												<p className="text-xs text-gray-500 truncate">
													{formatDateTime(
														transaction.createdAt
													)}
												</p>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<div className="text-right">
												<p
													className={`text-sm font-medium ${
														transaction.type ===
														"LOAN_REPAYMENT"
															? "text-purple-600"
															: transaction.type ===
																	"DEPOSIT" ||
															  transaction.type ===
																	"LOAN_DISBURSEMENT"
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{transaction.type ===
														"WITHDRAWAL" ||
													transaction.type ===
														"LOAN_REPAYMENT"
														? "-"
														: "+"}
													{formatCurrency(
														transaction.amount
													)}
												</p>
											</div>
											{getStatusBadge(transaction.status)}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-gray-500 text-center py-4">
								No transactions yet
							</p>
						)}
					</div>
				</div> */}
			</div>
		</DashboardLayout>
	);
}
