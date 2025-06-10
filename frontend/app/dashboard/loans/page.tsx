"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import PieChart from "@/components/PieChart";
import {
	CreditCardIcon,
	ArrowRightIcon,
	CalendarIcon,
	BanknotesIcon,
	ChartBarIcon,
	ClockIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	PlusIcon,
	DocumentTextIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { checkAuth, fetchWithTokenRefresh } from "@/lib/authUtils";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import BankTransferModal from "@/components/modals/BankTransferModal";

interface LoanSummary {
	totalOutstanding: number;
	nextPaymentDue: string | null;
	nextPaymentAmount: number;
	totalBorrowed: number;
	totalRepaid: number;
}

interface Loan {
	id: string;
	principalAmount: number;
	outstandingBalance: number;
	interestRate: number;
	term: number;
	monthlyPayment: number;
	nextPaymentDue: string;
	status: string;
	disbursedAt: string;
	application: {
		id: string;
		product: {
			name: string;
			code: string;
		};
		createdAt: string;
	};
}

interface LoanRepayment {
	id: string;
	amount: number;
	principalAmount: number;
	interestAmount: number;
	status: string;
	dueDate: string;
	paidAt: string | null;
	createdAt: string;
}

interface LoanApplication {
	id: string;
	status: string;
	appStep: number;
	amount: number;
	term: number;
	purpose: string;
	createdAt: string;
	updatedAt: string;
	product: {
		name: string;
		code: string;
		requiredDocuments?: string[];
	};
	documents?: Array<{
		id: string;
		name: string;
		type: string;
		status: string;
	}>;
}

function LoansPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [userName, setUserName] = useState<string>("");
	const [loans, setLoans] = useState<Loan[]>([]);
	const [applications, setApplications] = useState<LoanApplication[]>([]);
	const [activeTab, setActiveTab] = useState<"loans" | "applications">(
		"loans"
	);
	const [loanSummary, setLoanSummary] = useState<LoanSummary>({
		totalOutstanding: 0,
		nextPaymentDue: null,
		nextPaymentAmount: 0,
		totalBorrowed: 0,
		totalRepaid: 0,
	});
	const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
	const [loanRepayments, setLoanRepayments] = useState<{
		[key: string]: LoanRepayment[];
	}>({});
	const [loadingRepayments, setLoadingRepayments] = useState<{
		[key: string]: boolean;
	}>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [showLoanDetails, setShowLoanDetails] = useState<{
		[key: string]: boolean;
	}>({});

	// Loan repayment modal states
	const [showLoanRepayModal, setShowLoanRepayModal] =
		useState<boolean>(false);
	const [showPaymentMethodModal, setShowPaymentMethodModal] =
		useState<boolean>(false);
	const [showBankTransferModal, setShowBankTransferModal] =
		useState<boolean>(false);
	const [repaymentAmount, setRepaymentAmount] = useState<string>("");
	const [paymentMethod, setPaymentMethod] = useState<
		"WALLET_BALANCE" | "FRESH_FUNDS"
	>("WALLET_BALANCE");
	const [walletBalance, setWalletBalance] = useState<number>(0);
	const [repaymentError, setRepaymentError] = useState<string>("");

	// Application withdrawal modal states
	const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
	const [selectedApplication, setSelectedApplication] =
		useState<LoanApplication | null>(null);
	const [withdrawing, setWithdrawing] = useState<boolean>(false);

	useEffect(() => {
		const checkAuthAndLoadData = async () => {
			try {
				const isAuthenticated = await checkAuth();
				if (!isAuthenticated) {
					router.push("/login");
					return;
				}

				// Fetch user data
				const userData = await fetchWithTokenRefresh<any>(
					"/api/users/me"
				);
				if (!userData?.isOnboardingComplete) {
					router.push("/onboarding");
					return;
				}

				// Set user name
				if (userData.firstName) {
					setUserName(userData.firstName);
				} else if (userData.fullName) {
					setUserName(userData.fullName.split(" ")[0]);
				} else {
					setUserName("User");
				}

				// Load loan data
				await Promise.all([
					loadLoans(),
					loadLoanSummary(),
					loadApplications(),
				]);
			} catch (error) {
				console.error("Auth check error:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndLoadData();
	}, [router]);

	// Handle tab query parameter
	useEffect(() => {
		const tab = searchParams.get("tab");
		if (tab === "applications") {
			setActiveTab("applications");
		}
	}, [searchParams]);

	const loadLoans = async () => {
		try {
			const data = await fetchWithTokenRefresh<{ loans: Loan[] }>(
				"/api/loans"
			);
			if (data?.loans) {
				setLoans(data.loans);
			}
		} catch (error) {
			console.error("Error loading loans:", error);
		}
	};

	const loadLoanSummary = async () => {
		try {
			const data = await fetchWithTokenRefresh<any>("/api/wallet");
			if (data?.loanSummary) {
				setLoanSummary(data.loanSummary);
			}
		} catch (error) {
			console.error("Error loading loan summary:", error);
		}
	};

	const loadApplications = async () => {
		try {
			const data = await fetchWithTokenRefresh<LoanApplication[]>(
				"/api/loan-applications"
			);
			if (data) {
				setApplications(data);
			}
		} catch (error) {
			console.error("Error loading applications:", error);
		}
	};

	const loadLoanRepayments = async (loanId: string) => {
		// Don't reload if already loaded
		if (loanRepayments[loanId]) {
			return;
		}

		setLoadingRepayments((prev) => ({
			...prev,
			[loanId]: true,
		}));

		try {
			const data = await fetchWithTokenRefresh<{
				repayments: LoanRepayment[];
			}>(`/api/loans/${loanId}/repayments`);

			if (data?.repayments) {
				setLoanRepayments((prev) => ({
					...prev,
					[loanId]: data.repayments,
				}));
			} else {
				// If no repayments data, set empty array
				setLoanRepayments((prev) => ({
					...prev,
					[loanId]: [],
				}));
			}
		} catch (error) {
			console.error("Error loading loan repayments:", error);
			// Set empty array on error to show "No payment history" message
			setLoanRepayments((prev) => ({
				...prev,
				[loanId]: [],
			}));
		} finally {
			setLoadingRepayments((prev) => ({
				...prev,
				[loanId]: false,
			}));
		}
	};

	const loadWalletBalance = async () => {
		try {
			const data = await fetchWithTokenRefresh<any>("/api/wallet");
			if (data?.balance) {
				setWalletBalance(data.balance);
			}
		} catch (error) {
			console.error("Error loading wallet balance:", error);
		}
	};

	const handleLoanRepayClick = () => {
		if (loans.length === 1) {
			// If only one loan, select it automatically
			setSelectedLoan(loans[0]);
		}
		loadWalletBalance();
		setShowLoanRepayModal(true);
	};

	const handleConfirmRepayment = async () => {
		if (!selectedLoan || !repaymentAmount) return;

		if (paymentMethod === "FRESH_FUNDS") {
			setShowLoanRepayModal(false);
			setShowPaymentMethodModal(true);
		} else {
			try {
				const amount = parseFloat(repaymentAmount);

				const response = await fetchWithTokenRefresh(
					"/api/wallet/repay-loan",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							loanId: selectedLoan.id,
							amount,
							paymentMethod,
						}),
					}
				);

				if (response) {
					// Wallet balance payment - reload data
					await Promise.all([
						loadLoans(),
						loadLoanSummary(),
						loadWalletBalance(),
					]);
					setShowLoanRepayModal(false);
					setRepaymentAmount("");
					setSelectedLoan(null);
				}
			} catch (error) {
				console.error("Error processing repayment:", error);
			}
		}
	};

	const handleFPXSelect = () => {
		// Handle FPX payment flow
		console.log("FPX payment selected");
	};

	const handleBankTransferSelect = () => {
		setShowPaymentMethodModal(false);
		setShowBankTransferModal(true);
	};

	const handleBankTransferConfirm = () => {
		setShowBankTransferModal(false);
		setRepaymentAmount("");
		setSelectedLoan(null);
		// Reload data to show pending transaction
		Promise.all([loadLoans(), loadLoanSummary()]);
	};

	const handleAutoFillMonthlyPayment = () => {
		if (selectedLoan) {
			setRepaymentAmount(selectedLoan.monthlyPayment.toString());
			validateRepaymentAmount(
				selectedLoan.monthlyPayment.toString(),
				selectedLoan
			);
		}
	};

	const handleLoanSelection = (loan: Loan) => {
		setSelectedLoan(loan);
		setRepaymentError("");
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Math.abs(amount));
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

	const getStatusBadge = (status: string) => {
		switch (status.toUpperCase()) {
			case "ACTIVE":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
						<CheckCircleIcon className="h-3 w-3 mr-1" />
						Active
					</span>
				);
			case "PENDING":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
						<ClockIcon className="h-3 w-3 mr-1" />
						Pending
					</span>
				);
			case "COMPLETED":
			case "PAID":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
						<CheckCircleIcon className="h-3 w-3 mr-1" />
						{status.toUpperCase() === "PAID" ? "Paid" : "Completed"}
					</span>
				);
			case "DEFAULTED":
			case "FAILED":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30">
						<ExclamationTriangleIcon className="h-3 w-3 mr-1" />
						{status.toUpperCase() === "FAILED"
							? "Failed"
							: "Defaulted"}
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600/50 text-gray-300 border border-gray-500/50">
						{status}
					</span>
				);
		}
	};

	const toggleLoanDetails = (loanId: string) => {
		setShowLoanDetails((prev) => ({
			...prev,
			[loanId]: !prev[loanId],
		}));

		if (!showLoanDetails[loanId]) {
			loadLoanRepayments(loanId);
		}
	};

	const calculateDaysUntilDue = (dueDate: string) => {
		const today = new Date();
		const due = new Date(dueDate);
		const diffTime = due.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const getPaymentUrgency = (daysUntilDue: number) => {
		if (daysUntilDue < 0) return { color: "text-red-600", text: "Overdue" };
		if (daysUntilDue <= 7)
			return { color: "text-orange-600", text: "Due Soon" };
		if (daysUntilDue <= 14)
			return { color: "text-yellow-600", text: "Due This Month" };
		return { color: "text-gray-600", text: "On Track" };
	};

	const validateRepaymentAmount = (amount: string, loan: Loan) => {
		const numAmount = parseFloat(amount);

		if (!amount || amount.trim() === "") {
			setRepaymentError("");
			return;
		}

		if (isNaN(numAmount) || numAmount <= 0) {
			setRepaymentError("Please enter a valid amount greater than 0");
			return;
		}

		if (numAmount > loan.outstandingBalance) {
			setRepaymentError(
				`Amount cannot exceed outstanding balance of ${formatCurrency(
					loan.outstandingBalance
				)}`
			);
			return;
		}

		if (paymentMethod === "WALLET_BALANCE" && numAmount > walletBalance) {
			setRepaymentError(
				`Insufficient wallet balance. Available: ${formatCurrency(
					walletBalance
				)}`
			);
			return;
		}

		setRepaymentError("");
	};

	const handleRepaymentAmountChange = (value: string) => {
		setRepaymentAmount(value);
		if (selectedLoan) {
			validateRepaymentAmount(value, selectedLoan);
		}
	};

	// Application utility functions
	const getApplicationStatusColor = (status: string) => {
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
			case "WITHDRAWN":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
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
			case "WITHDRAWN":
				return "Withdrawn";
			default:
				return status;
		}
	};

	const handleWithdrawApplication = async () => {
		if (!selectedApplication) return;

		try {
			setWithdrawing(true);
			await fetchWithTokenRefresh(
				`/api/loan-applications/${selectedApplication.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: "WITHDRAWN",
					}),
				}
			);

			// Update local state
			setApplications(
				applications.map((app) =>
					app.id === selectedApplication.id
						? { ...app, status: "WITHDRAWN" }
						: app
				)
			);

			setShowWithdrawModal(false);
			setSelectedApplication(null);
		} catch (error) {
			console.error("Error withdrawing application:", error);
		} finally {
			setWithdrawing(false);
		}
	};

	const handleViewApplicationDetails = (appId: string) => {
		router.push(`/dashboard/applications/${appId}`);
	};

	if (loading) {
		return (
			<DashboardLayout userName={userName} title="Loans">
				<div className="flex items-center justify-center h-64">
					<div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userName={userName} title="Loans & Applications">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Summary Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Payment Status Card */}
					<div className="bg-gradient-to-br from-blue-600/70 via-blue-700/70 to-indigo-800/70 rounded-2xl shadow-xl text-white overflow-hidden lg:col-span-2">
						<div className="p-6">
							{loanSummary.nextPaymentDue ? (
								<div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6 backdrop-blur-md">
									<div className="flex items-center">
										<div className="p-3 bg-orange-500/20 rounded-xl mr-4 backdrop-blur-md border border-orange-400/30">
											<ExclamationTriangleIcon className="h-8 w-8 text-orange-300" />
										</div>
										<div className="flex-1">
											<p className="text-lg font-semibold text-orange-200">
												Payment Due Soon
											</p>
											<p className="text-sm text-orange-100 mb-2">
												Next payment of{" "}
												{formatCurrency(
													loanSummary.nextPaymentAmount
												)}{" "}
												due on{" "}
												{formatDate(
													loanSummary.nextPaymentDue
												)}
											</p>
										</div>
										<button
											onClick={handleLoanRepayClick}
											className="inline-flex items-center px-4 py-2 border border-orange-300/30 text-sm font-medium rounded-md text-orange-200 bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md"
										>
											Make Payment
											<ArrowRightIcon className="ml-2 h-4 w-4" />
										</button>
									</div>
								</div>
							) : (
								<div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6 backdrop-blur-md">
									<div className="flex items-center">
										<div className="p-3 bg-green-500/20 rounded-xl mr-4 backdrop-blur-md border border-green-400/30">
											<CheckCircleIcon className="h-8 w-8 text-green-300" />
										</div>
										<div>
											<p className="text-lg font-semibold text-green-200">
												All payments up to date
											</p>
											<p className="text-sm text-green-100">
												No immediate payments required
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Other Stats - Smaller and less prominent */}
							<div className="grid grid-cols-3 gap-4 mb-8">
								<div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
									<p className="text-xs font-medium text-blue-200 mb-1">
										Total Borrowed
									</p>
									<p className="text-lg font-semibold text-white">
										{formatCurrency(
											loanSummary.totalBorrowed
										)}
									</p>
								</div>
								<div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
									<p className="text-xs font-medium text-blue-200 mb-1">
										Outstanding
									</p>
									<p className="text-lg font-semibold text-red-300">
										{formatCurrency(
											loanSummary.totalOutstanding
										)}
									</p>
								</div>
								<div className="text-center p-4 bg-white/5 rounded-lg backdrop-blur-md border border-white/10">
									<p className="text-xs font-medium text-blue-200 mb-1">
										Total Repaid
									</p>
									<p className="text-lg font-semibold text-green-300">
										{formatCurrency(
											loanSummary.totalRepaid
										)}
									</p>
								</div>
							</div>

							{/* Quick Actions */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<button
									onClick={handleLoanRepayClick}
									className="flex items-center p-4 border border-white/20 rounded-xl hover:border-white/30 hover:bg-white/10 transition-colors w-full text-left backdrop-blur-md"
								>
									<div className="p-3 bg-purple-500/20 rounded-xl mr-4 border border-purple-400/30">
										<CreditCardIcon className="h-6 w-6 text-purple-300" />
									</div>
									<div className="text-left">
										<p className="font-semibold text-white">
											Make Payment
										</p>
										<p className="text-sm text-blue-200">
											Pay loan installment
										</p>
									</div>
								</button>

								<Link
									href="/dashboard/transactions"
									className="flex items-center p-4 border border-white/20 rounded-xl hover:border-white/30 hover:bg-white/10 transition-colors backdrop-blur-md"
								>
									<div className="p-3 bg-cyan-500/20 rounded-xl mr-4 border border-cyan-400/30">
										<ChartBarIcon className="h-6 w-6 text-cyan-300" />
									</div>
									<div className="text-left">
										<p className="font-semibold text-white">
											View History
										</p>
										<p className="text-sm text-blue-200">
											Payment transactions
										</p>
									</div>
								</Link>

								<Link
									href="/dashboard/apply"
									className="flex items-center p-4 border border-white/20 rounded-xl hover:border-white/30 hover:bg-white/10 transition-colors backdrop-blur-md"
								>
									<div className="p-3 bg-green-500/20 rounded-xl mr-4 border border-green-400/30">
										<PlusIcon className="h-6 w-6 text-green-300" />
									</div>
									<div className="text-left">
										<p className="font-semibold text-white">
											Apply for Loan
										</p>
										<p className="text-sm text-blue-200">
											Get additional funding
										</p>
									</div>
								</Link>
							</div>
						</div>
					</div>

					{/* Repayment Progress Chart */}
					<div className="bg-gradient-to-br from-blue-600/70 via-blue-700/70 to-indigo-800/70 rounded-2xl shadow-xl text-white overflow-hidden">
						<div className="p-6">
							<h3 className="text-lg font-semibold text-white mb-6">
								Repayment Progress
							</h3>
							<div className="flex justify-center mb-6">
								<div className="relative">
									<svg
										width="160"
										height="160"
										viewBox="0 0 160 160"
										className="transform -rotate-90"
									>
										{/* Background Circle */}
										<circle
											cx="80"
											cy="80"
											r="65"
											fill="none"
											stroke="rgba(255,255,255,0.1)"
											strokeWidth="10"
										/>
										{/* Progress Circle */}
										<circle
											cx="80"
											cy="80"
											r="65"
											fill="none"
											stroke="url(#progressGradient)"
											strokeWidth="10"
											strokeLinecap="round"
											strokeDasharray={`${
												loanSummary.totalBorrowed > 0
													? ((loanSummary.totalBorrowed -
															loanSummary.totalOutstanding) /
															loanSummary.totalBorrowed) *
													  408
													: 0
											} 408`}
											className="transition-all duration-1000 ease-out"
										/>
										{/* Gradient Definition */}
										<defs>
											<linearGradient
												id="progressGradient"
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
												{loanSummary.totalBorrowed > 0
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
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-blue-200">
										Progress
									</span>
									<span className="font-medium text-white">
										{loanSummary.totalBorrowed > 0
											? Math.round(
													((loanSummary.totalBorrowed -
														loanSummary.totalOutstanding) /
														loanSummary.totalBorrowed) *
														100
											  )
											: 0}
										%
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-blue-200">
										Remaining
									</span>
									<span className="font-medium text-red-300">
										{formatCurrency(
											loanSummary.totalOutstanding
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-blue-200">
										Active Loans
									</span>
									<span className="font-medium text-white">
										{loans.length}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Loans and Applications Tabs */}
				<div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl shadow-xl text-white overflow-hidden border border-gray-700">
					{/* Tab Navigation */}
					<div className="border-b border-gray-700">
						<nav className="flex space-x-8 px-6" aria-label="Tabs">
							<button
								onClick={() => setActiveTab("loans")}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === "loans"
										? "border-blue-400 text-blue-400"
										: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
								}`}
							>
								<div className="flex items-center space-x-2">
									<CreditCardIcon className="h-5 w-5" />
									<span>Active Loans</span>
									{loans.length > 0 && (
										<span className="bg-blue-500/20 text-blue-300 py-0.5 px-2 rounded-full text-xs font-medium border border-blue-400/30">
											{loans.length}
										</span>
									)}
								</div>
							</button>
							<button
								onClick={() => setActiveTab("applications")}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === "applications"
										? "border-blue-400 text-blue-400"
										: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
								}`}
							>
								<div className="flex items-center space-x-2">
									<DocumentTextIcon className="h-5 w-5" />
									<span>Applications</span>
									{applications.length > 0 && (
										<span className="bg-gray-600/50 text-gray-300 py-0.5 px-2 rounded-full text-xs font-medium border border-gray-500/50">
											{applications.length}
										</span>
									)}
								</div>
							</button>
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === "loans" ? (
							// Active Loans Content
							loans.length > 0 ? (
								<div className="space-y-6">
									{loans.map((loan) => {
										const daysUntilDue =
											calculateDaysUntilDue(
												loan.nextPaymentDue
											);
										const urgency =
											getPaymentUrgency(daysUntilDue);
										const isExpanded =
											showLoanDetails[loan.id];

										return (
											<div
												key={loan.id}
												className="border border-gray-600 rounded-xl overflow-hidden hover:border-blue-400 transition-colors bg-gray-800/50 backdrop-blur-md"
											>
												{/* Loan Header */}
												<div className="p-6 bg-gray-700/30 backdrop-blur-md">
													<div className="flex items-center justify-between mb-4">
														<div className="flex items-center space-x-3">
															<div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
																<CreditCardIcon className="h-6 w-6 text-blue-400" />
															</div>
															<div>
																<h4 className="text-lg font-semibold text-white">
																	{
																		loan
																			.application
																			.product
																			.name
																	}
																</h4>
																<p className="text-sm text-gray-300">
																	Loan ID:{" "}
																	{loan.id
																		.slice(
																			-8
																		)
																		.toUpperCase()}
																</p>
															</div>
														</div>
														<div className="text-right">
															{getStatusBadge(
																loan.status
															)}
														</div>
													</div>

													{/* Loan Summary Stats */}
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
														<div>
															<p className="text-sm text-gray-400 mb-1">
																Outstanding
																Balance
															</p>
															<p className="text-lg font-semibold text-red-300">
																{formatCurrency(
																	loan.outstandingBalance
																)}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-400 mb-1">
																Monthly Payment
															</p>
															<p className="text-lg font-semibold text-white">
																{formatCurrency(
																	loan.monthlyPayment
																)}
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-400 mb-1">
																Interest Rate
															</p>
															<p className="text-lg font-semibold text-white">
																{
																	loan.interestRate
																}
																% p.a.
															</p>
														</div>
														<div>
															<p className="text-sm text-gray-400 mb-1">
																Next Payment Due
															</p>
															<p
																className={`text-lg font-semibold ${urgency.color
																	.replace(
																		"text-",
																		"text-"
																	)
																	.replace(
																		"-600",
																		"-300"
																	)
																	.replace(
																		"-800",
																		"-400"
																	)}`}
															>
																{formatDate(
																	loan.nextPaymentDue
																)}
															</p>
															<p
																className={`text-xs ${urgency.color
																	.replace(
																		"text-",
																		"text-"
																	)
																	.replace(
																		"-600",
																		"-300"
																	)
																	.replace(
																		"-800",
																		"-400"
																	)}`}
															>
																{urgency.text}
															</p>
														</div>
													</div>

													{/* Progress Bar */}
													<div className="mb-4">
														<div className="flex justify-between text-sm text-gray-400 mb-2">
															<span>
																Repayment
																Progress
															</span>
															<span>
																{Math.round(
																	((loan.principalAmount -
																		loan.outstandingBalance) /
																		loan.principalAmount) *
																		100
																)}
																%
															</span>
														</div>
														<div className="w-full bg-gray-600/50 rounded-full h-2">
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
														<div className="flex justify-between text-xs text-gray-400 mt-1">
															<span>
																Paid:{" "}
																{formatCurrency(
																	loan.principalAmount -
																		loan.outstandingBalance
																)}
															</span>
															<span>
																Total:{" "}
																{formatCurrency(
																	loan.principalAmount
																)}
															</span>
														</div>
													</div>

													{/* Action Buttons */}
													<div className="flex items-center justify-between">
														<button
															onClick={() =>
																toggleLoanDetails(
																	loan.id
																)
															}
															className="flex items-center text-sm text-blue-400 hover:text-blue-300 font-medium"
														>
															{isExpanded
																? "Hide Details"
																: "View Details"}
															{isExpanded ? (
																<ChevronUpIcon className="ml-1 h-4 w-4" />
															) : (
																<ChevronDownIcon className="ml-1 h-4 w-4" />
															)}
														</button>
														<button
															onClick={() => {
																setSelectedLoan(
																	loan
																);
																loadWalletBalance();
																setShowLoanRepayModal(
																	true
																);
															}}
															className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
														>
															Make Payment
															<ArrowRightIcon className="ml-2 h-4 w-4" />
														</button>
													</div>
												</div>

												{/* Expanded Loan Details */}
												{isExpanded && (
													<div className="p-6 border-t border-gray-600 bg-gray-800/30 backdrop-blur-md">
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															{/* Loan Information */}
															<div>
																<h5 className="text-md font-semibold text-white mb-4">
																	Loan
																	Information
																</h5>
																<div className="space-y-3 text-sm">
																	<div className="flex justify-between">
																		<span className="text-gray-400">
																			Principal
																			Amount
																		</span>
																		<span className="font-medium text-white">
																			{formatCurrency(
																				loan.principalAmount
																			)}
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-400">
																			Loan
																			Term
																		</span>
																		<span className="font-medium text-white">
																			{
																				loan.term
																			}{" "}
																			months
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-400">
																			Disbursed
																			Date
																		</span>
																		<span className="font-medium text-white">
																			{formatDate(
																				loan.disbursedAt
																			)}
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-400">
																			Application
																			Date
																		</span>
																		<span className="font-medium text-white">
																			{formatDate(
																				loan
																					.application
																					.createdAt
																			)}
																		</span>
																	</div>
																</div>
															</div>

															{/* Recent Payments */}
															<div>
																<h5 className="text-md font-semibold text-white mb-4">
																	Recent
																	Payments
																</h5>
																{loadingRepayments[
																	loan.id
																] ? (
																	<div className="flex items-center justify-center py-4">
																		<div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
																		<span className="ml-2 text-sm text-gray-400">
																			Loading
																			payments...
																		</span>
																	</div>
																) : loanRepayments[
																		loan.id
																  ] &&
																  loanRepayments[
																		loan.id
																  ].length >
																		0 ? (
																	<div className="space-y-2">
																		{loanRepayments[
																			loan
																				.id
																		]
																			.slice(
																				0,
																				3
																			)
																			.map(
																				(
																					repayment: LoanRepayment
																				) => (
																					<div
																						key={
																							repayment.id
																						}
																						className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg backdrop-blur-md border border-gray-600/50"
																					>
																						<div>
																							<p className="text-sm font-medium text-white">
																								{formatCurrency(
																									repayment.amount
																								)}
																							</p>
																							<p className="text-xs text-gray-400">
																								{repayment.paidAt
																									? formatDate(
																											repayment.paidAt
																									  )
																									: formatDate(
																											repayment.dueDate
																									  )}
																							</p>
																						</div>
																						{getStatusBadge(
																							repayment.status
																						)}
																					</div>
																				)
																			)}
																		{loanRepayments[
																			loan
																				.id
																		]
																			.length >
																			3 && (
																			<p className="text-xs text-gray-400 text-center mt-2">
																				Showing
																				latest
																				3
																				payments
																			</p>
																		)}
																	</div>
																) : (
																	<div className="text-center py-4">
																		<p className="text-sm text-gray-400 mb-2">
																			No
																			payment
																			history
																			available
																		</p>
																		<p className="text-xs text-gray-500">
																			Payment
																			history
																			will
																			appear
																			here
																			once
																			you
																			make
																			your
																			first
																			payment
																		</p>
																	</div>
																)}
															</div>
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							) : (
								<div className="text-center py-12">
									<CreditCardIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
									<h4 className="text-xl font-medium text-white mb-2">
										No Active Loans
									</h4>
									<p className="text-gray-400 mb-6">
										You don't have any active loans at the
										moment.
									</p>
									<Link
										href="/dashboard/apply"
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
									>
										<PlusIcon className="h-5 w-5 mr-2" />
										Apply for Your First Loan
									</Link>
								</div>
							)
						) : // Applications Content
						applications.length > 0 ? (
							<div className="space-y-4">
								{applications.map((app) => (
									<div
										key={app.id}
										className="border border-gray-600 rounded-xl p-6 hover:border-blue-400 transition-colors bg-gray-800/50 backdrop-blur-md"
									>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center space-x-3">
												<div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
													<DocumentTextIcon className="h-6 w-6 text-blue-400" />
												</div>
												<div>
													<h4 className="text-lg font-semibold text-white">
														{app.product?.name ||
															"Unknown Product"}
													</h4>
													<p className="text-sm text-gray-300">
														Application ID:{" "}
														{app.id
															.slice(-8)
															.toUpperCase()}
													</p>
												</div>
											</div>
											<span
												className={`px-3 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(
													app.status
												)}`}
											>
												{getApplicationStatusLabel(
													app.status
												)}
											</span>
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
											<div>
												<p className="text-sm text-gray-400 mb-1">
													Amount
												</p>
												<p className="text-lg font-semibold text-white">
													{app.amount
														? formatCurrency(
																app.amount
														  )
														: "-"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-400 mb-1">
													Term
												</p>
												<p className="text-lg font-semibold text-white">
													{app.term
														? `${app.term} months`
														: "-"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-400 mb-1">
													Purpose
												</p>
												<p className="text-lg font-semibold text-white">
													{app.purpose || "-"}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-400 mb-1">
													Applied On
												</p>
												<p className="text-lg font-semibold text-white">
													{app.status === "INCOMPLETE"
														? "-"
														: formatDate(
																app.updatedAt
														  )}
												</p>
											</div>
										</div>

										<div className="flex items-center justify-between">
											<div className="text-sm text-gray-400">
												{app.status ===
													"INCOMPLETE" && (
													<span className="text-orange-300 font-medium">
														Complete your
														application to proceed
													</span>
												)}
											</div>
											<div className="flex items-center space-x-3">
												{app.status === "INCOMPLETE" ? (
													<Link
														href={`/dashboard/apply?applicationId=${
															app.id
														}&step=${
															app.appStep
														}&productCode=${
															app.product?.code ||
															""
														}`}
														className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
													>
														Resume Application
														<ArrowRightIcon className="ml-2 h-4 w-4" />
													</Link>
												) : (
													<>
														<button
															onClick={() =>
																handleViewApplicationDetails(
																	app.id
																)
															}
															className="inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 transition-colors backdrop-blur-md"
														>
															View Details
														</button>
														{[
															"PENDING_APP_FEE",
															"PENDING_KYC",
															"PENDING_APPROVAL",
														].includes(
															app.status
														) && (
															<button
																onClick={() => {
																	setSelectedApplication(
																		app
																	);
																	setShowWithdrawModal(
																		true
																	);
																}}
																className="inline-flex items-center px-4 py-2 border border-red-400/50 text-sm font-medium rounded-md text-red-300 bg-red-500/20 hover:bg-red-500/30 transition-colors backdrop-blur-md"
															>
																Withdraw
															</button>
														)}
													</>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<DocumentTextIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
								<h4 className="text-xl font-medium text-white mb-2">
									No Applications Found
								</h4>
								<p className="text-gray-400 mb-6">
									You haven't submitted any loan applications
									yet.
								</p>
								<Link
									href="/dashboard/apply"
									className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
								>
									<PlusIcon className="h-5 w-5 mr-2" />
									Apply for a Loan
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Loan Repayment Modal */}
			{showLoanRepayModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
					<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-white">
									Loan Repayment
								</h2>
								<button
									onClick={() => {
										setShowLoanRepayModal(false);
										setSelectedLoan(null);
										setRepaymentAmount("");
									}}
									className="text-gray-400 hover:text-gray-200 transition-colors"
								>
									<svg
										className="w-6 h-6"
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

							{/* Loan Selection */}
							{!selectedLoan ? (
								<div>
									<h3 className="text-lg font-semibold text-white mb-4">
										Select a Loan to Repay
									</h3>
									<div className="space-y-4">
										{loans.map((loan) => (
											<button
												key={loan.id}
												onClick={() =>
													handleLoanSelection(loan)
												}
												className="w-full p-4 border border-gray-600 rounded-xl hover:border-blue-400 hover:bg-gray-700/50 transition-colors text-left bg-gray-800/50 backdrop-blur-md"
											>
												<div className="flex items-center justify-between">
													<div>
														<p className="font-semibold text-white">
															{
																loan.application
																	.product
																	.name
															}
														</p>
														<p className="text-sm text-gray-400">
															Outstanding:{" "}
															{formatCurrency(
																loan.outstandingBalance
															)}
														</p>
														<p className="text-sm text-gray-400">
															Monthly Payment:{" "}
															{formatCurrency(
																loan.monthlyPayment
															)}
														</p>
														<p className="text-sm text-gray-400">
															Next Due:{" "}
															{formatDate(
																loan.nextPaymentDue
															)}
														</p>
													</div>
													<div className="text-right">
														<span
															className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
																loan.status ===
																"ACTIVE"
																	? "bg-green-500/20 text-green-300 border border-green-400/30"
																	: "bg-gray-600/50 text-gray-300 border border-gray-500/50"
															}`}
														>
															{loan.status}
														</span>
													</div>
												</div>
											</button>
										))}
									</div>
									{loans.length === 0 && (
										<div className="text-center py-12">
											<CreditCardIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
											<p className="text-gray-400">
												No active loans found
											</p>
										</div>
									)}
								</div>
							) : (
								<div>
									{/* Selected Loan Details */}
									<div className="bg-gray-700/50 rounded-xl p-4 mb-6 backdrop-blur-md border border-gray-600/50">
										<h3 className="text-lg font-semibold text-white mb-2">
											{
												selectedLoan.application.product
													.name
											}
										</h3>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<p className="text-gray-400">
													Outstanding Amount
												</p>
												<p className="font-semibold text-white">
													{formatCurrency(
														selectedLoan.outstandingBalance
													)}
												</p>
											</div>
											<div>
												<p className="text-gray-400">
													Monthly Payment
												</p>
												<p className="font-semibold text-white">
													{formatCurrency(
														selectedLoan.monthlyPayment
													)}
												</p>
											</div>
											<div>
												<p className="text-gray-400">
													Interest Rate
												</p>
												<p className="font-semibold text-white">
													{selectedLoan.interestRate}%
													p.a.
												</p>
											</div>
											<div>
												<p className="text-gray-400">
													Next Due Date
												</p>
												<p className="font-semibold text-white">
													{formatDate(
														selectedLoan.nextPaymentDue
													)}
												</p>
											</div>
										</div>
									</div>

									{/* Payment Method Selection */}
									<div className="mb-6">
										<h4 className="text-lg font-semibold text-white mb-4">
											Payment Method
										</h4>
										<div className="space-y-3">
											<label className="flex items-center p-4 border border-gray-600 rounded-xl hover:bg-gray-700/50 cursor-pointer bg-gray-800/50 backdrop-blur-md">
												<input
													type="radio"
													name="paymentMethod"
													value="WALLET_BALANCE"
													checked={
														paymentMethod ===
														"WALLET_BALANCE"
													}
													onChange={(e) => {
														const newMethod = e
															.target.value as
															| "WALLET_BALANCE"
															| "FRESH_FUNDS";
														setPaymentMethod(
															newMethod
														);
														if (
															selectedLoan &&
															repaymentAmount
														) {
															validateRepaymentAmount(
																repaymentAmount,
																selectedLoan
															);
														}
													}}
													className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-gray-500 bg-gray-700"
												/>
												<div className="ml-3 flex-1">
													<div className="flex items-center justify-between">
														<div>
															<p className="font-semibold text-white">
																Wallet Balance
															</p>
															<p className="text-sm text-gray-400">
																Pay from your
																current wallet
																balance
															</p>
														</div>
														<div className="text-right">
															<p className="font-semibold text-white">
																{formatCurrency(
																	walletBalance
																)}
															</p>
															<p className="text-xs text-gray-400">
																Available
															</p>
														</div>
													</div>
												</div>
											</label>

											<label className="flex items-center p-4 border border-gray-600 rounded-xl hover:bg-gray-700/50 cursor-pointer bg-gray-800/50 backdrop-blur-md">
												<input
													type="radio"
													name="paymentMethod"
													value="FRESH_FUNDS"
													checked={
														paymentMethod ===
														"FRESH_FUNDS"
													}
													onChange={(e) => {
														const newMethod = e
															.target.value as
															| "WALLET_BALANCE"
															| "FRESH_FUNDS";
														setPaymentMethod(
															newMethod
														);
														if (
															selectedLoan &&
															repaymentAmount
														) {
															validateRepaymentAmount(
																repaymentAmount,
																selectedLoan
															);
														}
													}}
													className="h-4 w-4 text-blue-400 focus:ring-blue-400 border-gray-500 bg-gray-700"
												/>
												<div className="ml-3 flex-1">
													<div>
														<p className="font-semibold text-white">
															Fresh Funds Transfer
														</p>
														<p className="text-sm text-gray-400">
															Transfer directly
															from your bank
															account
														</p>
													</div>
												</div>
											</label>
										</div>
									</div>

									{/* Repayment Amount */}
									<div className="mb-6">
										<div className="flex items-center justify-between mb-2">
											<label className="block text-sm font-medium text-gray-300">
												Repayment Amount (MYR)
											</label>
											<div className="flex items-center space-x-3">
												<button
													onClick={
														handleAutoFillMonthlyPayment
													}
													className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
												>
													Monthly Payment
												</button>
												{selectedLoan &&
													selectedLoan.outstandingBalance >
														0 && (
														<button
															onClick={() => {
																setRepaymentAmount(
																	selectedLoan.outstandingBalance.toString()
																);
																validateRepaymentAmount(
																	selectedLoan.outstandingBalance.toString(),
																	selectedLoan
																);
															}}
															className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
														>
															All
														</button>
													)}
											</div>
										</div>
										<input
											type="number"
											value={repaymentAmount}
											onChange={(e) =>
												handleRepaymentAmountChange(
													e.target.value
												)
											}
											placeholder="0.00"
											className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-500 bg-gray-700/50 backdrop-blur-md ${
												repaymentError
													? "border-red-400 focus:border-red-400 focus:ring-red-400"
													: "border-gray-600"
											}`}
											min="1"
											step="0.01"
											max={
												selectedLoan.outstandingBalance
											}
										/>
										{repaymentError && (
											<p className="mt-2 text-sm text-red-400">
												{repaymentError}
											</p>
										)}
										<div className="flex justify-between text-sm text-gray-400 mt-2">
											<span>Minimum Payment</span>
											<span className="font-medium text-white">
												{formatCurrency(
													selectedLoan.monthlyPayment
												)}
											</span>
										</div>
										<div className="flex justify-between text-sm text-gray-400">
											<span>Outstanding Amount</span>
											<span className="font-medium text-white">
												{formatCurrency(
													selectedLoan.outstandingBalance
												)}
											</span>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="flex space-x-3">
										<button
											onClick={() => {
												setSelectedLoan(null);
												setRepaymentAmount("");
												setRepaymentError("");
											}}
											className="flex-1 bg-gray-600/50 text-gray-300 py-3 px-4 rounded-xl font-semibold hover:bg-gray-500/50 transition-colors backdrop-blur-md border border-gray-500/50"
										>
											Back
										</button>
										<button
											onClick={handleConfirmRepayment}
											disabled={
												!repaymentAmount ||
												parseFloat(repaymentAmount) <=
													0 ||
												parseFloat(repaymentAmount) >
													selectedLoan.outstandingBalance ||
												(paymentMethod ===
													"WALLET_BALANCE" &&
													parseFloat(
														repaymentAmount
													) > walletBalance)
											}
											className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
										>
											{paymentMethod === "WALLET_BALANCE"
												? "Pay Now"
												: "Continue"}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Payment Method Selection Modal */}
			{showPaymentMethodModal && (
				<PaymentMethodModal
					onClose={() => setShowPaymentMethodModal(false)}
					onFPXSelect={handleFPXSelect}
					onBankTransferSelect={handleBankTransferSelect}
					amount={repaymentAmount}
					title="How would you like to pay?"
				/>
			)}

			{/* Bank Transfer Details Modal */}
			{showBankTransferModal && selectedLoan && (
				<BankTransferModal
					onClose={() => setShowBankTransferModal(false)}
					onConfirm={handleBankTransferConfirm}
					amount={repaymentAmount}
					reference={`LOAN-${selectedLoan.id
						.slice(-8)
						.toUpperCase()}`}
					userName={userName}
				/>
			)}

			{/* Application Withdrawal Modal */}
			{showWithdrawModal && selectedApplication && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-white">
									Withdraw Application
								</h2>
								<button
									onClick={() => {
										setShowWithdrawModal(false);
										setSelectedApplication(null);
									}}
									className="text-gray-400 hover:text-gray-200 transition-colors"
								>
									<XMarkIcon className="w-6 h-6" />
								</button>
							</div>

							<div className="mb-6">
								<div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md">
									<div className="flex items-center">
										<ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
										<div>
											<h3 className="text-sm font-medium text-red-300">
												Warning
											</h3>
											<p className="text-sm text-red-200 mt-1">
												This action cannot be undone.
												Your application fee will not be
												refunded.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-gray-700/50 rounded-xl p-4 backdrop-blur-md border border-gray-600/50">
									<h4 className="font-semibold text-white mb-2">
										{selectedApplication.product?.name ||
											"Unknown Product"}
									</h4>
									<div className="text-sm text-gray-400 space-y-1">
										<p>
											Application ID:{" "}
											{selectedApplication.id
												.slice(-8)
												.toUpperCase()}
										</p>
										<p>
											Amount:{" "}
											{selectedApplication.amount
												? formatCurrency(
														selectedApplication.amount
												  )
												: "-"}
										</p>
										<p>
											Status:{" "}
											{getApplicationStatusLabel(
												selectedApplication.status
											)}
										</p>
									</div>
								</div>
							</div>

							<p className="text-gray-300 mb-6">
								Are you sure you want to withdraw this loan
								application?
							</p>

							<div className="flex space-x-3">
								<button
									onClick={() => {
										setShowWithdrawModal(false);
										setSelectedApplication(null);
									}}
									className="flex-1 bg-gray-600/50 text-gray-300 py-3 px-4 rounded-xl font-semibold hover:bg-gray-500/50 transition-colors backdrop-blur-md border border-gray-500/50"
								>
									Cancel
								</button>
								<button
									onClick={handleWithdrawApplication}
									disabled={withdrawing}
									className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
								>
									{withdrawing
										? "Withdrawing..."
										: "Withdraw Application"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}

export default function LoansPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoansPageContent />
		</Suspense>
	);
}
