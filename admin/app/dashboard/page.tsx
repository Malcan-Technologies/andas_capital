"use client";

import React from "react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
	UserGroupIcon,
	ClockIcon,
	CurrencyDollarIcon,
	DocumentTextIcon,
	BanknotesIcon,
	CreditCardIcon,
	ChevronRightIcon,
	ArrowTrendingUpIcon,
	ArrowTrendingDownIcon,
	ExclamationTriangleIcon,
	CheckCircleIcon,
	XCircleIcon,
	EyeIcon,
	PlusIcon,
	BellIcon,
	Cog6ToothIcon,
	ChartBarIcon,
	CalendarDaysIcon,
	ArrowTrendingUpIcon as TrendingUpIcon,
	ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { fetchWithAdminTokenRefresh } from "../../lib/authUtils";
import Link from "next/link";
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";

interface DashboardStats {
	totalUsers: number;
	pendingReviewApplications: number;
	approvedLoans: number;
	pendingDisbursementCount?: number;
	disbursedLoans: number;
	totalDisbursedAmount: number;
	totalLoanValue?: number;
	currentLoanValue?: number;
	totalFeesCollected?: number;
	totalLateFeesCollected?: number;
	totalRepayments?: number;
	recentApplications: {
		id: string;
		userId: string;
		status: string;
		createdAt: string;
		user: {
			fullName: string;
			email: string;
		};
	}[];
	// Enhanced stats
	totalApplications?: number;
	rejectedApplications?: number;
	averageLoanAmount?: number;
	monthlyGrowth?: number;
	activeUsers?: number;
	conversionRate?: number;
	totalRevenue?: number;
	monthlyStats?: {
		month: string;
		applications: number;
		approvals: number;
		disbursements: number;
		revenue: number;
		disbursement_amount: number;
		disbursement_count: number;
		users: number;
		kyc_users: number;
		actual_repayments: number;
		scheduled_repayments: number;
		total_loan_value: number;
		current_loan_value: number;
		repayment_count: number;
		scheduled_count: number;
	}[];
	statusBreakdown?: {
		status: string;
		count: number;
		percentage: number;
	}[];
}

export default function AdminDashboardPage() {
	const [stats, setStats] = useState<DashboardStats>({
		totalUsers: 0,
		pendingReviewApplications: 0,
		approvedLoans: 0,
		pendingDisbursementCount: 0,
		disbursedLoans: 0,
		totalDisbursedAmount: 0,
		totalLoanValue: 0,
		currentLoanValue: 0,
		totalFeesCollected: 0,
		totalLateFeesCollected: 0,
		totalRepayments: 0,
		recentApplications: [],
		totalApplications: 0,
		rejectedApplications: 0,
		averageLoanAmount: 0,
		monthlyGrowth: 0,
		activeUsers: 0,
		conversionRate: 0,
		totalRevenue: 0,
		monthlyStats: [],
		statusBreakdown: [],
	});
	const [loading, setLoading] = useState(true);
	const [userName, setUserName] = useState("Admin");
	const [workflowCounts, setWorkflowCounts] = useState({
		PENDING_DECISION: 0,
		PENDING_DISBURSEMENT: 0,
		PENDING_DISCHARGE: 0,
		PENDING_PAYMENTS: 0,
	});

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// Fetch user data with token refresh
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

				// Fetch dashboard stats with token refresh
				const data = await fetchWithAdminTokenRefresh<DashboardStats>(
					"/api/admin/dashboard"
				);

				// Total late fees collected is now included in dashboard API response
				const totalLateFeesCollected = data.totalLateFeesCollected || 0;

				// Fetch real monthly statistics
				let monthlyStats = [];
				try {
					const monthlyData = await fetchWithAdminTokenRefresh<{
						monthlyStats: {
							month: string;
							applications: number;
							approvals: number;
							disbursements: number;
							revenue: number;
							disbursement_amount: number;
							disbursement_count: number;
							users: number;
							kyc_users: number;
						}[];
					}>("/api/admin/monthly-stats");
					monthlyStats = monthlyData.monthlyStats;
				} catch (error) {
					console.error("Error fetching monthly stats:", error);
					// Fallback to mock data if API fails
					monthlyStats = [
						{
							month: "Jan",
							applications: 45,
							approvals: 32,
							disbursements: 28,
							revenue: 14000,
							disbursement_amount: 280000,
							disbursement_count: 28,
							users: 12,
							kyc_users: 8,
							actual_repayments: 14000,
							scheduled_repayments: 15000,
							total_loan_value: 320000,
							current_loan_value: 306000,
							repayment_count: 25,
							scheduled_count: 30,
						},
						{
							month: "Feb",
							applications: 52,
							approvals: 38,
							disbursements: 35,
							revenue: 17500,
							disbursement_amount: 350000,
							disbursement_count: 35,
							users: 15,
							kyc_users: 11,
							actual_repayments: 17500,
							scheduled_repayments: 18500,
							total_loan_value: 400000,
							current_loan_value: 688500,
							repayment_count: 32,
							scheduled_count: 38,
						},
						{
							month: "Mar",
							applications: 48,
							approvals: 35,
							disbursements: 32,
							revenue: 16000,
							disbursement_amount: 320000,
							disbursement_count: 32,
							users: 18,
							kyc_users: 14,
							actual_repayments: 16000,
							scheduled_repayments: 17200,
							total_loan_value: 365000,
							current_loan_value: 1037500,
							repayment_count: 28,
							scheduled_count: 35,
						},
						{
							month: "Apr",
							applications: 61,
							approvals: 44,
							disbursements: 40,
							revenue: 20000,
							disbursement_amount: 400000,
							disbursement_count: 40,
							users: 22,
							kyc_users: 18,
							actual_repayments: 20000,
							scheduled_repayments: 21000,
							total_loan_value: 456000,
							current_loan_value: 1473500,
							repayment_count: 38,
							scheduled_count: 42,
						},
						{
							month: "May",
							applications: 58,
							approvals: 42,
							disbursements: 38,
							revenue: 19000,
							disbursement_amount: 380000,
							disbursement_count: 38,
							users: 19,
							kyc_users: 15,
							actual_repayments: 19000,
							scheduled_repayments: 20500,
							total_loan_value: 432000,
							current_loan_value: 1886500,
							repayment_count: 35,
							scheduled_count: 40,
						},
						{
							month: "Jun",
							applications: 67,
							approvals: 49,
							disbursements: 45,
							revenue: 22500,
							disbursement_amount: 450000,
							disbursement_count: 45,
							users: 25,
							kyc_users: 20,
							actual_repayments: 22500,
							scheduled_repayments: 24000,
							total_loan_value: 513000,
							current_loan_value: 2377000,
							repayment_count: 42,
							scheduled_count: 48,
						},
					];
				}

				// Use totalApplications from API instead of calculating
				const totalApplications = data.totalApplications || 0;

				// Calculate monthly growth from real data
				const currentMonth = monthlyStats[monthlyStats.length - 1];
				const previousMonth = monthlyStats[monthlyStats.length - 2];
				const monthlyGrowth =
					previousMonth && currentMonth
						? ((currentMonth.applications -
								previousMonth.applications) /
								previousMonth.applications) *
						  100
						: 0;

				// Enhance monthlyStats with missing fields if they don't exist
				const enhancedMonthlyStats = monthlyStats.map((stat: any) => ({
					...stat,
					actual_repayments: stat.actual_repayments || 0,
					scheduled_repayments: stat.scheduled_repayments || 0,
					total_loan_value: stat.total_loan_value || 0,
					current_loan_value: stat.current_loan_value || 0,
					repayment_count: stat.repayment_count || 0,
					scheduled_count: stat.scheduled_count || 0,
				}));

				const enhancedData = {
					...data,
					totalApplications,
					totalLateFeesCollected,
					averageLoanAmount:
						data.disbursedLoans > 0
							? (data.totalLoanValue ||
									data.totalDisbursedAmount ||
									0) / data.disbursedLoans
							: 0,
					conversionRate:
						totalApplications > 0
							? ((data.approvedLoans || 0) / totalApplications) *
							  100
							: 0,
					monthlyGrowth,
					activeUsers: Math.floor((data.totalUsers || 0) * 0.7), // Mock data
					totalRevenue: (data.totalDisbursedAmount || 0) * 0.05, // Assuming 5% fee
					monthlyStats: enhancedMonthlyStats,
					statusBreakdown: [
						{
							status: "Disbursed",
							count: data.disbursedLoans || 0,
							percentage: 0,
						},
						{
							status: "Pending Disbursement",
							count: data.pendingDisbursementCount || 0,
							percentage: 0,
						},
						{
							status: "Pending Review",
							count: data.pendingReviewApplications || 0,
							percentage: 0,
						},
						{
							status: "Rejected",
							count: data.rejectedApplications || 0,
							percentage: 0,
						},
					],
				};

				// Calculate percentages for status breakdown
				const total = enhancedData.totalApplications || 1;
				enhancedData.statusBreakdown = enhancedData.statusBreakdown.map(
					(item) => ({
						...item,
						percentage: (item.count / total) * 100,
					})
				);

				setStats(enhancedData);

				// Try to fetch application counts for workflow
				try {
					const countsData = await fetchWithAdminTokenRefresh<any>(
						"/api/admin/applications/counts"
					);

					// Fetch pending discharge loans count
					let pendingDischargeCount = 0;
					try {
						const loansResponse = await fetchWithAdminTokenRefresh<{
							success: boolean;
							data: any[];
						}>("/api/admin/loans");

						if (loansResponse.success && loansResponse.data) {
							pendingDischargeCount = loansResponse.data.filter(
								(loan: any) =>
									loan.status === "PENDING_DISCHARGE"
							).length;
						}
					} catch (loansError) {
						console.error(
							"Error fetching loans for discharge count:",
							loansError
						);
					}

					// Fetch pending payments count
					let pendingPaymentsCount = 0;
					try {
						const paymentsResponse =
							await fetchWithAdminTokenRefresh<{
								success: boolean;
								data: any[];
							}>("/api/admin/repayments/pending");

						if (paymentsResponse.success && paymentsResponse.data) {
							pendingPaymentsCount = paymentsResponse.data.length;
						}
					} catch (paymentsError) {
						console.error(
							"Error fetching pending payments count:",
							paymentsError
						);
					}

					setWorkflowCounts({
						PENDING_DECISION:
							countsData.PENDING_DECISION ||
							data.pendingReviewApplications ||
							0,
						PENDING_DISBURSEMENT:
							countsData.PENDING_DISBURSEMENT ||
							data.pendingDisbursementCount ||
							0,
						PENDING_DISCHARGE: pendingDischargeCount,
						PENDING_PAYMENTS: pendingPaymentsCount,
					});
				} catch (countsError) {
					console.error(
						"Error fetching application counts, using dashboard stats:",
						countsError
					);

					setWorkflowCounts({
						PENDING_DECISION: data.pendingReviewApplications || 0,
						PENDING_DISBURSEMENT:
							data.pendingDisbursementCount || 0,
						PENDING_DISCHARGE: 0,
						PENDING_PAYMENTS: 0,
					});
				}
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-MY", {
			style: "currency",
			currency: "MYR",
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PENDING":
			case "PENDING_APPROVAL":
			case "Pending Review":
				return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/20";
			case "APPROVED":
			case "Disbursed":
				return "bg-green-500/20 text-green-200 border border-green-400/20";
			case "REJECTED":
			case "Rejected":
				return "bg-red-500/20 text-red-200 border border-red-400/20";
			case "DISBURSED":
			case "Pending Disbursement":
				return "bg-blue-500/20 text-blue-200 border border-blue-400/20";
			case "WITHDRAWN":
				return "bg-gray-500/20 text-gray-200 border border-gray-400/20";
			default:
				return "bg-gray-500/20 text-gray-200 border border-gray-400/20";
		}
	};

	const formatNumber = (num: number) => {
		if (num >= 1000000000) {
			return (num / 1000000000).toFixed(1) + "B";
		}
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + "M";
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + "K";
		}
		return num.toString();
	};

	const formatCurrencyCompact = (amount: number) => {
		if (amount >= 1000000000) {
			return `RM${(amount / 1000000000).toFixed(1)}B`;
		}
		if (amount >= 1000000) {
			return `RM${(amount / 1000000).toFixed(1)}M`;
		}
		if (amount >= 1000) {
			return `RM${(amount / 1000).toFixed(1)}K`;
		}
		return formatCurrency(amount);
	};

	// Helper function to calculate totals and growth
	const calculateMetrics = (data: any[], key: string) => {
		const total = data.reduce((sum, item) => sum + (item[key] || 0), 0);
		const currentMonth = data[data.length - 1]?.[key] || 0;
		const previousMonth = data[data.length - 2]?.[key] || 0;
		const growth =
			previousMonth > 0
				? ((currentMonth - previousMonth) / previousMonth) * 100
				: 0;

		return { total, currentMonth, growth };
	};

	if (loading) {
		return (
			<AdminLayout
				title="Dashboard"
				description="Overview of your platform's performance"
			>
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout
			title="Dashboard"
			description="Overview of your platform's performance"
		>
			{/* Quick Actions */}
			<div className="mb-8">
				<h2 className="text-lg font-medium text-white mb-5 flex items-center">
					<ClockIcon className="h-6 w-6 mr-2 text-amber-400" />
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{/* Pending Decisions */}
					<Link
						href="/dashboard/applications/pending-decision"
						className="group bg-gradient-to-br from-amber-600/20 to-amber-800/20 backdrop-blur-md border border-amber-500/30 rounded-xl shadow-lg p-5 transition-all hover:scale-[1.02] hover:border-amber-400/50"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-amber-500/30 rounded-lg">
								<ExclamationTriangleIcon className="h-6 w-6 text-amber-300" />
							</div>
							{workflowCounts.PENDING_DECISION > 0 && (
								<span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
									{formatNumber(
										workflowCounts.PENDING_DECISION
									)}
								</span>
							)}
						</div>
						<h3 className="text-white font-medium mb-1">
							Review Applications
						</h3>
						<p className="text-sm text-amber-200 mb-3">
							{workflowCounts.PENDING_DECISION > 0
								? `${formatNumber(
										workflowCounts.PENDING_DECISION
								  )} applications need review`
								: "No pending applications"}
						</p>
						<div className="flex items-center text-amber-300 text-sm font-medium group-hover:text-amber-200">
							Review now
							<ChevronRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</Link>

					{/* Pending Disbursements */}
					<Link
						href="/dashboard/applications/pending-disbursement"
						className="group bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-md border border-green-500/30 rounded-xl shadow-lg p-5 transition-all hover:scale-[1.02] hover:border-green-400/50"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-green-500/30 rounded-lg">
								<CheckCircleIcon className="h-6 w-6 text-green-300" />
							</div>
							{workflowCounts.PENDING_DISBURSEMENT > 0 && (
								<span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
									{formatNumber(
										workflowCounts.PENDING_DISBURSEMENT
									)}
								</span>
							)}
						</div>
						<h3 className="text-white font-medium mb-1">
							Process Disbursements
						</h3>
						<p className="text-sm text-green-200 mb-3">
							{workflowCounts.PENDING_DISBURSEMENT > 0
								? `${formatNumber(
										workflowCounts.PENDING_DISBURSEMENT
								  )} loans ready to disburse`
								: "No pending disbursements"}
						</p>
						<div className="flex items-center text-green-300 text-sm font-medium group-hover:text-green-200">
							Process now
							<ChevronRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</Link>

					{/* Pending Discharge */}
					<Link
						href="/dashboard/loans?filter=pending_discharge"
						className="group bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-md border border-orange-500/30 rounded-xl shadow-lg p-5 transition-all hover:scale-[1.02] hover:border-orange-400/50"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-orange-500/30 rounded-lg">
								<ClockIcon className="h-6 w-6 text-orange-300" />
							</div>
							{workflowCounts.PENDING_DISCHARGE > 0 && (
								<span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
									{formatNumber(
										workflowCounts.PENDING_DISCHARGE
									)}
								</span>
							)}
						</div>
						<h3 className="text-white font-medium mb-1">
							Pending Discharge
						</h3>
						<p className="text-sm text-orange-200 mb-3">
							{workflowCounts.PENDING_DISCHARGE > 0
								? `${formatNumber(
										workflowCounts.PENDING_DISCHARGE
								  )} loans ready for discharge`
								: "No loans pending discharge"}
						</p>
						<div className="flex items-center text-orange-300 text-sm font-medium group-hover:text-orange-200">
							Review now
							<ChevronRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</Link>

					{/* Review Payments */}
					<Link
						href="/dashboard/payments"
						className="group bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-lg p-5 transition-all hover:scale-[1.02] hover:border-purple-400/50"
					>
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-purple-500/30 rounded-lg">
								<ReceiptPercentIcon className="h-6 w-6 text-purple-300" />
							</div>
							{workflowCounts.PENDING_PAYMENTS > 0 && (
								<span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
									{formatNumber(
										workflowCounts.PENDING_PAYMENTS
									)}
								</span>
							)}
						</div>
						<h3 className="text-white font-medium mb-1">
							Review Payments
						</h3>
						<p className="text-sm text-purple-200 mb-3">
							{workflowCounts.PENDING_PAYMENTS > 0
								? `${formatNumber(
										workflowCounts.PENDING_PAYMENTS
								  )} payments need review`
								: "No pending payments"}
						</p>
						<div className="flex items-center text-purple-300 text-sm font-medium group-hover:text-purple-200">
							Review now
							<ChevronRightIcon className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</div>
					</Link>
				</div>
			</div>

			{/* Key Metrics */}
			<div className="mb-8">
				<h2 className="text-lg font-medium text-white mb-5 flex items-center">
					<ChartBarIcon className="h-6 w-6 mr-2 text-blue-400" />
					Key Metrics
				</h2>
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{/* Total Users */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Users
									</p>
									<p className="text-3xl font-bold text-blue-400">
										{formatNumber(stats.totalUsers)}
									</p>
									<div className="flex items-center mt-2">
										<TrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
										<span className="text-sm text-green-400">
											+{stats.monthlyGrowth?.toFixed(1)}%
										</span>
										<span className="text-xs text-gray-400 ml-1">
											this month
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<UserGroupIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Total Applications */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Applications
									</p>
									<p className="text-3xl font-bold text-purple-400">
										{formatNumber(
											stats.totalApplications || 0
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-purple-400">
											{stats.conversionRate?.toFixed(1)}%
										</span>
										<span className="text-xs text-gray-400 ml-1">
											approval rate
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<DocumentTextIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Current Loan Value */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Current Loan Value
									</p>
									<p className="text-3xl font-bold text-green-400">
										{formatCurrencyCompact(
											stats.currentLoanValue || 0
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-green-400">
											{formatNumber(stats.disbursedLoans)}
										</span>
										<span className="text-xs text-gray-400 ml-1">
											active loans
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<BanknotesIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Total Disbursed */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Disbursed
									</p>
									<p className="text-3xl font-bold text-indigo-400">
										{formatCurrencyCompact(
											stats.totalDisbursedAmount
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-indigo-400">
											{formatCurrencyCompact(
												stats.totalDisbursedAmount /
													(stats.disbursedLoans || 1)
											)}
										</span>
										<span className="text-xs text-gray-400 ml-1">
											avg disbursed
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<CreditCardIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Total Repayments */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Repayments
									</p>
									<p className="text-3xl font-bold text-amber-400">
										{formatCurrencyCompact(
											stats.totalRepayments || 0
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-amber-400">
											{stats.monthlyStats &&
											stats.monthlyStats.length > 0
												? formatCurrencyCompact(
														stats.monthlyStats.reduce(
															(sum, month) =>
																sum +
																month.actual_repayments,
															0
														) /
															stats.monthlyStats.reduce(
																(sum, month) =>
																	sum +
																	month.repayment_count,
																0
															) || 0
												  )
												: "RM0"}
										</span>
										<span className="text-xs text-gray-400 ml-1">
											avg repayment amount
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Total Fees Collected */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Fees Deducted
									</p>
									<p className="text-3xl font-bold text-emerald-400">
										{formatCurrencyCompact(
											stats.totalFeesCollected || 0
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-emerald-400">
											{stats.disbursedLoans > 0
												? formatCurrencyCompact(
														(stats.totalFeesCollected ||
															0) /
															stats.disbursedLoans
												  )
												: "RM0"}
										</span>
										<span className="text-xs text-gray-400 ml-1">
											avg fee per loan
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<BanknotesIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>

					{/* Total Late Fees Collected */}
					<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 overflow-hidden shadow-lg rounded-xl">
						<div className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-300">
										Total Late Fees Collected
									</p>
									<p className="text-3xl font-bold text-red-400">
										{formatCurrencyCompact(
											stats.totalLateFeesCollected || 0
										)}
									</p>
									<div className="flex items-center mt-2">
										<span className="text-sm text-red-400">
											{stats.totalLateFeesCollected &&
											stats.totalLateFeesCollected > 0
												? `${(
														(stats.totalLateFeesCollected /
															(stats.totalRepayments ||
																1)) *
														100
												  ).toFixed(1)}%`
												: "0%"}
										</span>
										<span className="text-xs text-gray-400 ml-1">
											of total repayments
										</span>
									</div>
								</div>
								<div className="p-3 bg-gray-700/50 rounded-xl">
									<ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				{/* Monthly Trends Chart */}
				<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-white">
							Monthly Application Trends
						</h3>
						<ChartBarIcon className="h-6 w-6 text-blue-400" />
					</div>

					{/* Application Headlines */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-blue-400">
								{formatNumber(
									calculateMetrics(
										stats.monthlyStats || [],
										"applications"
									).total
								)}
							</p>
							<p className="text-xs text-gray-400">
								Total Applications
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-white">
								{formatNumber(
									calculateMetrics(
										stats.monthlyStats || [],
										"applications"
									).currentMonth
								)}
							</p>
							<p className="text-xs text-gray-400">This Month</p>
						</div>
						<div className="text-center">
							<p
								className={`text-2xl font-bold ${
									calculateMetrics(
										stats.monthlyStats || [],
										"applications"
									).growth >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{calculateMetrics(
									stats.monthlyStats || [],
									"applications"
								).growth >= 0
									? "+"
									: ""}
								{calculateMetrics(
									stats.monthlyStats || [],
									"applications"
								).growth.toFixed(1)}
								%
							</p>
							<p className="text-xs text-gray-400">MoM Growth</p>
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={stats.monthlyStats}>
								<defs>
									<linearGradient
										id="colorApplications"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#3B82F6"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="#3B82F6"
											stopOpacity={0.1}
										/>
									</linearGradient>
									<linearGradient
										id="colorApprovals"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#10B981"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="#10B981"
											stopOpacity={0.1}
										/>
									</linearGradient>
									<linearGradient
										id="colorDisbursements"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#F59E0B"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="#F59E0B"
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#374151"
								/>
								<XAxis
									dataKey="month"
									stroke="#9CA3AF"
									fontSize={12}
								/>
								<YAxis stroke="#9CA3AF" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#1F2937",
										border: "1px solid #374151",
										borderRadius: "8px",
										color: "#F9FAFB",
									}}
								/>
								<Legend wrapperStyle={{ color: "#9CA3AF" }} />
								<Area
									type="monotone"
									dataKey="applications"
									stroke="#3B82F6"
									fillOpacity={1}
									fill="url(#colorApplications)"
									name="Applications"
								/>
								<Area
									type="monotone"
									dataKey="approvals"
									stroke="#10B981"
									fillOpacity={1}
									fill="url(#colorApprovals)"
									name="Approvals"
								/>
								<Area
									type="monotone"
									dataKey="disbursements"
									stroke="#F59E0B"
									fillOpacity={1}
									fill="url(#colorDisbursements)"
									name="Disbursements"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Application Status Breakdown */}
				<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-white">
							Application Status Distribution
						</h3>
						<DocumentTextIcon className="h-6 w-6 text-purple-400" />
					</div>

					{/* Status Headlines */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-green-400">
								{formatNumber(stats.disbursedLoans || 0)}
							</p>
							<p className="text-xs text-gray-400">
								Total Disbursed
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-yellow-400">
								{formatNumber(
									stats.pendingReviewApplications || 0
								)}
							</p>
							<p className="text-xs text-gray-400">
								Pending Review
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-purple-400">
								{stats.conversionRate?.toFixed(1) || 0}%
							</p>
							<p className="text-xs text-gray-400">
								Approval Rate
							</p>
						</div>
					</div>
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={stats.statusBreakdown}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={120}
									paddingAngle={5}
									dataKey="count"
									nameKey="status"
								>
									{stats.statusBreakdown?.map(
										(entry, index) => {
											const colors = [
												"#10B981",
												"#F59E0B",
												"#EF4444",
												"#3B82F6",
											];
											return (
												<Cell
													key={`cell-${index}`}
													fill={
														colors[
															index %
																colors.length
														]
													}
												/>
											);
										}
									)}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: "#1F2937",
										border: "1px solid #374151",
										borderRadius: "8px",
										color: "#F9FAFB",
									}}
									labelStyle={{ color: "#F9FAFB" }}
									itemStyle={{ color: "#F9FAFB" }}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-4">
						{stats.statusBreakdown?.map((status, index) => {
							const colors = [
								"#10B981",
								"#F59E0B",
								"#EF4444",
								"#3B82F6",
							];
							return (
								<div
									key={status.status}
									className="flex items-center space-x-2"
								>
									<div
										className="w-3 h-3 rounded-full"
										style={{
											backgroundColor:
												colors[index % colors.length],
										}}
									></div>
									<span className="text-sm text-gray-300">
										{status.status}
									</span>
									<span className="text-sm font-medium text-white">
										({status.count})
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Additional Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				{/* Monthly Repayments vs Scheduled */}
				<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-white">
							Monthly Collections vs Scheduled
						</h3>
						<CurrencyDollarIcon className="h-6 w-6 text-green-400" />
					</div>

					{/* Repayments Headlines */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-green-400">
								{formatCurrencyCompact(
									calculateMetrics(
										stats.monthlyStats || [],
										"actual_repayments"
									).total
								)}
							</p>
							<p className="text-xs text-gray-400">
								Total Collections
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-white">
								{formatCurrencyCompact(
									calculateMetrics(
										stats.monthlyStats || [],
										"actual_repayments"
									).currentMonth
								)}
							</p>
							<p className="text-xs text-gray-400">This Month</p>
						</div>
						<div className="text-center">
							<p
								className={`text-2xl font-bold ${
									calculateMetrics(
										stats.monthlyStats || [],
										"actual_repayments"
									).growth >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{calculateMetrics(
									stats.monthlyStats || [],
									"actual_repayments"
								).growth >= 0
									? "+"
									: ""}
								{calculateMetrics(
									stats.monthlyStats || [],
									"actual_repayments"
								).growth.toFixed(1)}
								%
							</p>
							<p className="text-xs text-gray-400">MoM Growth</p>
						</div>
					</div>

					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.monthlyStats}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#374151"
								/>
								<XAxis
									dataKey="month"
									stroke="#9CA3AF"
									fontSize={12}
								/>
								<YAxis
									stroke="#9CA3AF"
									fontSize={12}
									tickFormatter={(value) =>
										`RM${(value / 1000).toFixed(0)}K`
									}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#1F2937",
										border: "1px solid #374151",
										borderRadius: "8px",
										color: "#F9FAFB",
									}}
									formatter={(
										value: number,
										name: string
									) => [
										formatCurrencyCompact(value),
										name === "actual_repayments"
											? "Collections (Actual)"
											: "Scheduled Repayments",
									]}
								/>
								<Legend
									wrapperStyle={{ color: "#9CA3AF" }}
									formatter={(value: string) =>
										value === "actual_repayments"
											? "Collections (Actual)"
											: "Scheduled Repayments"
									}
								/>
								<Bar
									dataKey="actual_repayments"
									fill="#10B981"
									radius={[4, 4, 0, 0]}
									name="actual_repayments"
								/>
								<Bar
									dataKey="scheduled_repayments"
									fill="#F59E0B"
									radius={[4, 4, 0, 0]}
									name="scheduled_repayments"
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Total Loan Value (TLV) Trends */}
				<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-white">
							Monthly Current Loan Value
						</h3>
						<BanknotesIcon className="h-6 w-6 text-blue-400" />
					</div>

					{/* TLV Headlines */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-blue-400">
								{formatCurrencyCompact(
									calculateMetrics(
										stats.monthlyStats || [],
										"current_loan_value"
									).total
								)}
							</p>
							<p className="text-xs text-gray-400">
								Current Loan Value
							</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-white">
								{formatCurrencyCompact(
									calculateMetrics(
										stats.monthlyStats || [],
										"current_loan_value"
									).currentMonth
								)}
							</p>
							<p className="text-xs text-gray-400">This Month</p>
						</div>
						<div className="text-center">
							<p
								className={`text-2xl font-bold ${
									calculateMetrics(
										stats.monthlyStats || [],
										"current_loan_value"
									).growth >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{calculateMetrics(
									stats.monthlyStats || [],
									"current_loan_value"
								).growth >= 0
									? "+"
									: ""}
								{calculateMetrics(
									stats.monthlyStats || [],
									"current_loan_value"
								).growth.toFixed(1)}
								%
							</p>
							<p className="text-xs text-gray-400">MoM Growth</p>
						</div>
					</div>

					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={stats.monthlyStats}>
								<defs>
									<linearGradient
										id="colorTLV"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="5%"
											stopColor="#3B82F6"
											stopOpacity={0.8}
										/>
										<stop
											offset="95%"
											stopColor="#3B82F6"
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#374151"
								/>
								<XAxis
									dataKey="month"
									stroke="#9CA3AF"
									fontSize={12}
								/>
								<YAxis
									stroke="#9CA3AF"
									fontSize={12}
									tickFormatter={(value) =>
										`RM${(value / 1000).toFixed(0)}K`
									}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "#1F2937",
										border: "1px solid #374151",
										borderRadius: "8px",
										color: "#F9FAFB",
									}}
									formatter={(value: number) => [
										formatCurrencyCompact(value),
										"Current Loan Value",
									]}
								/>
								<Area
									type="monotone"
									dataKey="current_loan_value"
									stroke="#3B82F6"
									fillOpacity={1}
									fill="url(#colorTLV)"
									name="Current Loan Value"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* User Growth */}
				<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-medium text-white">
							User Growth & KYC Completion
						</h3>
						<UserGroupIcon className="h-6 w-6 text-blue-400" />
					</div>

					{/* User Growth Headlines */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-blue-400">
								{formatNumber(
									calculateMetrics(
										stats.monthlyStats || [],
										"users"
									).total
								)}
							</p>
							<p className="text-xs text-gray-400">Total Users</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-white">
								{formatNumber(
									calculateMetrics(
										stats.monthlyStats || [],
										"users"
									).currentMonth
								)}
							</p>
							<p className="text-xs text-gray-400">This Month</p>
						</div>
						<div className="text-center">
							<p
								className={`text-2xl font-bold ${
									calculateMetrics(
										stats.monthlyStats || [],
										"users"
									).growth >= 0
										? "text-green-400"
										: "text-red-400"
								}`}
							>
								{calculateMetrics(
									stats.monthlyStats || [],
									"users"
								).growth >= 0
									? "+"
									: ""}
								{calculateMetrics(
									stats.monthlyStats || [],
									"users"
								).growth.toFixed(1)}
								%
							</p>
							<p className="text-xs text-gray-400">MoM Growth</p>
						</div>
					</div>

					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={stats.monthlyStats}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#374151"
								/>
								<XAxis
									dataKey="month"
									stroke="#9CA3AF"
									fontSize={12}
								/>
								<YAxis stroke="#9CA3AF" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "#1F2937",
										border: "1px solid #374151",
										borderRadius: "8px",
										color: "#F9FAFB",
									}}
								/>
								<Legend wrapperStyle={{ color: "#9CA3AF" }} />
								<Line
									type="monotone"
									dataKey="users"
									stroke="#3B82F6"
									strokeWidth={3}
									dot={{
										fill: "#3B82F6",
										strokeWidth: 2,
										r: 6,
									}}
									activeDot={{
										r: 8,
										stroke: "#3B82F6",
										strokeWidth: 2,
									}}
									name="Total Users"
								/>
								<Line
									type="monotone"
									dataKey="kyc_users"
									stroke="#10B981"
									strokeWidth={3}
									dot={{
										fill: "#10B981",
										strokeWidth: 2,
										r: 6,
									}}
									activeDot={{
										r: 8,
										stroke: "#10B981",
										strokeWidth: 2,
									}}
									name="KYC Users"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
