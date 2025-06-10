"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
	WalletIcon,
	ArrowUpIcon,
	ArrowDownIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { checkAuth, fetchWithTokenRefresh } from "@/lib/authUtils";

interface Transaction {
	id: string;
	type: "DEPOSIT" | "WITHDRAWAL" | "LOAN_DISBURSEMENT" | "LOAN_REPAYMENT";
	amount: number;
	status: "PENDING" | "APPROVED" | "REJECTED";
	description: string;
	createdAt: string;
	reference?: string;
}

export default function TransactionsPage() {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [transactionFilter, setTransactionFilter] = useState<string>("ALL");
	const [loading, setLoading] = useState<boolean>(true);

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

				// Load transactions
				fetchTransactions();
			} catch (error) {
				console.error("Auth check error:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndLoadData();
	}, [router]);

	const fetchTransactions = async () => {
		try {
			const data = await fetchWithTokenRefresh<{
				transactions: Transaction[];
			}>("/api/wallet/transactions?limit=50");
			if (data?.transactions) {
				setTransactions(data.transactions);
			}
		} catch (error) {
			console.error("Error fetching transactions:", error);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(Math.abs(amount));
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

	const getTransactionIcon = (type: Transaction["type"]) => {
		switch (type) {
			case "DEPOSIT":
			case "LOAN_DISBURSEMENT":
				return <ArrowDownIcon className="h-5 w-5 text-green-400" />;
			case "WITHDRAWAL":
				return <ArrowUpIcon className="h-5 w-5 text-red-400" />;
			case "LOAN_REPAYMENT":
				return (
					<svg
						className="h-5 w-5 text-purple-400"
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
				return <WalletIcon className="h-5 w-5 text-gray-400" />;
		}
	};

	const getStatusBadge = (status: Transaction["status"]) => {
		switch (status) {
			case "APPROVED":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
						<CheckCircleIcon className="h-3 w-3 mr-1" />
						Approved
					</span>
				);
			case "PENDING":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
						<ClockIcon className="h-3 w-3 mr-1" />
						Pending
					</span>
				);
			case "REJECTED":
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-400/30">
						<ExclamationTriangleIcon className="h-3 w-3 mr-1" />
						Rejected
					</span>
				);
		}
	};

	const getFilteredTransactions = () => {
		if (transactionFilter === "ALL") {
			return transactions;
		}
		return transactions.filter(
			(transaction) => transaction.type === transactionFilter
		);
	};

	const getTransactionTypeLabel = (type: string) => {
		switch (type) {
			case "DEPOSIT":
				return "Deposit";
			case "WITHDRAWAL":
				return "Withdrawal";
			case "LOAN_DISBURSEMENT":
				return "Loan Disbursement";
			case "LOAN_REPAYMENT":
				return "Loan Repayment";
			default:
				return "All";
		}
	};

	if (loading) {
		return (
			<DashboardLayout userName={userName} title="Transactions">
				<div className="flex items-center justify-center h-64">
					<div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userName={userName} title="Transactions">
			<div className="max-w-7xl mx-auto">
				<div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl shadow-xl text-white overflow-hidden border border-gray-700">
					<div className="px-6 py-4 border-b border-gray-700 bg-gray-700/30 backdrop-blur-md">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-white">
								All Transactions
							</h3>
							<span className="text-sm text-gray-300">
								{transactions.length} Total Transaction
								{transactions.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>

					<div className="p-6">
						{/* Transaction Type Filter */}
						{transactions.length > 0 && (
							<div className="mb-6">
								<div className="flex flex-wrap gap-2">
									{[
										"ALL",
										"DEPOSIT",
										"WITHDRAWAL",
										"LOAN_DISBURSEMENT",
										"LOAN_REPAYMENT",
									].map((type) => (
										<button
											key={type}
											onClick={() =>
												setTransactionFilter(type)
											}
											className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors backdrop-blur-md ${
												transactionFilter === type
													? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
													: "bg-gray-600/50 text-gray-300 hover:bg-gray-500/50 border border-gray-500/50"
											}`}
										>
											{getTransactionTypeLabel(type)}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Transactions List */}
						<div className="space-y-4">
							{loading ? (
								<div className="text-center py-8">
									<div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
									<p className="mt-4 text-gray-300">
										Loading transactions...
									</p>
								</div>
							) : getFilteredTransactions().length > 0 ? (
								<div className="space-y-4">
									{getFilteredTransactions().map(
										(transaction) => (
											<div
												key={transaction.id}
												className="flex items-center justify-between p-4 border border-gray-600 rounded-xl hover:bg-gray-700/30 transition-colors bg-gray-800/50 backdrop-blur-md"
											>
												<div className="flex items-center space-x-4 min-w-0 flex-1">
													<div className="p-2 bg-gray-700/50 rounded-xl flex-shrink-0 border border-gray-600/50">
														{getTransactionIcon(
															transaction.type
														)}
													</div>
													<div className="min-w-0 flex-1">
														<p className="font-semibold text-white truncate">
															{
																transaction.description
															}
														</p>
														<p className="text-sm text-gray-400 mt-1">
															{formatDateTime(
																transaction.createdAt
															)}
														</p>
														{transaction.reference && (
															<p className="text-xs text-gray-500 truncate">
																Ref:{" "}
																{
																	transaction.reference
																}
															</p>
														)}
													</div>
												</div>
												<div className="text-right flex-shrink-0 ml-4">
													<p
														className={`font-bold text-lg ${
															transaction.type ===
															"LOAN_REPAYMENT"
																? "text-purple-400"
																: transaction.amount >
																  0
																? "text-green-400"
																: "text-red-400"
														}`}
													>
														{transaction.amount > 0
															? "+"
															: ""}
														{formatCurrency(
															transaction.amount
														)}
													</p>
													<div className="mt-1">
														{getStatusBadge(
															transaction.status
														)}
													</div>
												</div>
											</div>
										)
									)}
								</div>
							) : transactions.length > 0 ? (
								<div className="text-center py-12">
									<WalletIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
									<p className="text-gray-400 mb-2">
										No{" "}
										{getTransactionTypeLabel(
											transactionFilter
										).toLowerCase()}{" "}
										transactions found
									</p>
									<button
										onClick={() =>
											setTransactionFilter("ALL")
										}
										className="text-sm text-blue-400 hover:text-blue-300 font-medium"
									>
										Show all transactions
									</button>
								</div>
							) : (
								<div className="text-center py-12">
									<WalletIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
									<h4 className="text-lg font-medium text-white mb-2">
										No Transactions Yet
									</h4>
									<p className="text-gray-400 mb-4">
										Your transaction history will appear
										here once you start using your wallet.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
