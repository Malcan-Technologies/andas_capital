"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import CreditScoreGauge from "@/components/CreditScoreGauge";
import {
	ArrowDownIcon,
	ArrowRightIcon,
	DocumentArrowDownIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { fetchWithTokenRefresh, checkAuth } from "@/lib/authUtils";

interface CreditReport {
	id: string;
	score: number;
	reportDate: string;
	status: "PENDING" | "COMPLETED" | "FAILED";
	downloadUrl?: string;
}

export default function CreditScorePage() {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(true);
	const [creditReports, setCreditReports] = useState<CreditReport[]>([]);
	const [latestReport, setLatestReport] = useState<CreditReport | null>(null);

	useEffect(() => {
		const checkAuthAndLoadData = async () => {
			try {
				const isAuthenticated = await checkAuth();

				if (!isAuthenticated) {
					console.log(
						"Credit Score - Auth check failed, redirecting to login"
					);
					router.push("/login");
					return;
				}

				// Fetch user data
				const data = await fetchWithTokenRefresh<any>("/api/users/me");
				if (data.firstName) {
					setUserName(data.firstName);
				} else if (data.fullName) {
					setUserName(data.fullName.split(" ")[0]);
				} else {
					setUserName("Guest");
				}

				// Load credit reports
				await loadCreditReports();
			} catch (error) {
				console.error("Credit Score - Auth check error:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		checkAuthAndLoadData();
	}, [router]);

	const loadCreditReports = async () => {
		try {
			const data = await fetchWithTokenRefresh<{
				reports: CreditReport[];
			}>("/api/credit-score/reports");
			if (data?.reports) {
				const sortedReports = data.reports.sort(
					(a, b) =>
						new Date(b.reportDate).getTime() -
						new Date(a.reportDate).getTime()
				);
				setCreditReports(sortedReports);
				setLatestReport(sortedReports[0] || null);
			}
		} catch (error) {
			console.error("Error loading credit reports:", error);
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
				recommendations: [
					"You're in a great position to negotiate better loan terms",
					"Consider consolidating any existing debts",
					"Maintain your excellent credit habits",
				],
			};
		} else if (score >= 718) {
			return {
				range: "718 - 743",
				category: "Very Good",
				description: "Very Good! You're viewed as a prime customer.",
				color: "text-lime-200",
				bgColor: "bg-lime-500/15",
				borderColor: "border-lime-400/20",
				recommendations: [
					"You qualify for favorable interest rates",
					"Consider refinancing existing loans",
					"Keep your credit utilization low",
				],
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
				recommendations: [
					"Focus on paying bills on time",
					"Reduce credit card balances",
					"Avoid applying for new credit",
				],
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
				recommendations: [
					"Set up automatic payments for bills",
					"Work on reducing outstanding debts",
					"Check your credit report for errors",
				],
			};
		} else if (score >= 529) {
			return {
				range: "529 - 650",
				category: "Low",
				description:
					"Low. You may face difficulties when applying for credit.",
				color: "text-orange-200",
				bgColor: "bg-orange-500/15",
				borderColor: "border-orange-400/20",
				recommendations: [
					"Focus on paying overdue accounts",
					"Consider credit counseling",
					"Build an emergency fund",
				],
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
				recommendations: [
					"Address any collections accounts",
					"Consider a secured credit card",
					"Create a debt repayment plan",
				],
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
				recommendations: [
					"Build credit history with a secured card",
					"Become an authorized user on someone's credit card",
					"Consider credit-builder loans",
				],
			};
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const handlePurchaseReport = async () => {
		try {
			// Redirect to the purchase flow
			router.push("/dashboard/credit-score/purchase");
		} catch (error) {
			console.error("Error initiating report purchase:", error);
		}
	};

	const handleDownloadReport = async (reportId: string) => {
		try {
			const response = await fetchWithTokenRefresh<{
				downloadUrl: string;
			}>(`/api/credit-score/reports/${reportId}/download`);
			if (response?.downloadUrl) {
				window.open(response.downloadUrl, "_blank");
			}
		} catch (error) {
			console.error("Error downloading report:", error);
		}
	};

	return (
		<DashboardLayout userName={userName}>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Main Credit Score Card */}
				<div className="bg-gradient-to-br from-purple-700/70 via-violet-700/70 to-indigo-800/70 rounded-2xl shadow-2xl text-white overflow-hidden">
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
										CTOS Credit Score
									</h2>
									<p className="text-purple-100 text-sm">
										Your creditworthiness profile
									</p>
								</div>
							</div>
							<button
								onClick={handlePurchaseReport}
								className="text-white text-sm font-medium inline-flex items-center bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20"
							>
								Get Latest Report
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</button>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Left Column - Score Display */}
							<div className="space-y-6">
								{latestReport ? (
									<>
										{/* Score Gauge */}
										<div className="flex flex-col items-center">
											<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20">
												<CreditScoreGauge
													score={latestReport.score}
													size={240}
												/>
											</div>
										</div>

										{/* Score Info */}
										{(() => {
											const scoreInfo =
												getCreditScoreInfo(
													latestReport.score
												);
											return (
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
																{
																	latestReport.score
																}
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
											);
										})()}

										{/* Last Updated Info */}
										<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
											<div className="flex items-center justify-between">
												<span className="text-sm text-purple-100">
													Last Updated
												</span>
												<span className="text-sm font-bold text-white">
													{formatDate(
														latestReport.reportDate
													)}
												</span>
											</div>
										</div>
									</>
								) : (
									<div className="text-center py-8">
										<div className="bg-white/10 rounded-xl p-6 backdrop-blur-md border border-white/20">
											<ExclamationTriangleIcon className="h-12 w-12 text-purple-200 mx-auto mb-4" />
											<h3 className="text-lg font-semibold mb-2">
												No Credit Score Available
											</h3>
											<p className="text-purple-100 text-sm mb-4">
												Purchase your first CTOS credit
												report to view your score
											</p>
											<button
												onClick={handlePurchaseReport}
												className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
											>
												Get Your Score
												<ArrowRightIcon className="ml-2 h-4 w-4" />
											</button>
										</div>
									</div>
								)}
							</div>

							{/* Right Column - Recommendations & History */}
							<div className="space-y-6">
								{/* Recommendations */}
								{latestReport && (
									<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
										<h3 className="text-lg font-semibold mb-4">
											Recommendations
										</h3>
										<div className="space-y-3">
											{getCreditScoreInfo(
												latestReport.score
											).recommendations.map(
												(rec, index) => (
													<div
														key={index}
														className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg border border-white/10"
													>
														<div className="flex-shrink-0">
															<InformationCircleIcon className="h-5 w-5 text-purple-200" />
														</div>
														<p className="text-sm text-purple-100">
															{rec}
														</p>
													</div>
												)
											)}
										</div>
									</div>
								)}

								{/* Report History */}
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<h3 className="text-lg font-semibold mb-4">
										Report History
									</h3>
									<div className="space-y-3">
										{creditReports.length > 0 ? (
											creditReports.map((report) => (
												<div
													key={report.id}
													className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"
												>
													<div className="flex items-center space-x-3">
														<DocumentTextIcon className="h-5 w-5 text-purple-200" />
														<div>
															<p className="text-sm font-medium text-white">
																CTOS Report
															</p>
															<p className="text-xs text-purple-100">
																{formatDate(
																	report.reportDate
																)}
															</p>
														</div>
													</div>
													{report.status ===
														"COMPLETED" && (
														<button
															onClick={() =>
																handleDownloadReport(
																	report.id
																)
															}
															className="inline-flex items-center px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
														>
															<DocumentArrowDownIcon className="h-4 w-4 mr-1" />
															Download
														</button>
													)}
												</div>
											))
										) : (
											<div className="text-center py-4">
												<p className="text-purple-100 text-sm">
													No reports available
												</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* CTOS Information Card */}
				<div className="bg-gradient-to-br from-blue-700/70 via-blue-700/70 to-indigo-800/70 rounded-2xl shadow-xl text-white overflow-hidden">
					<div className="p-6">
						<h3 className="text-lg font-semibold mb-4">
							About CTOS Credit Score
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<h4 className="font-medium mb-2">
										What is CTOS?
									</h4>
									<p className="text-sm text-blue-100">
										CTOS is Malaysia's leading credit
										reporting agency, providing
										comprehensive credit information and
										risk management services.
									</p>
								</div>
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<h4 className="font-medium mb-2">
										Score Range
									</h4>
									<p className="text-sm text-blue-100">
										CTOS scores range from 300 to 850. A
										higher score indicates better
										creditworthiness and increases your
										chances of loan approval.
									</p>
								</div>
							</div>
							<div className="space-y-4">
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<h4 className="font-medium mb-2">
										Report Contents
									</h4>
									<ul className="text-sm text-blue-100 space-y-2">
										<li>
											• Detailed credit score analysis
										</li>
										<li>• Credit payment history</li>
										<li>• Outstanding credit facilities</li>
										<li>
											• Legal actions and bankruptcy
											records
										</li>
										<li>
											• Directorship and business
											interests
										</li>
									</ul>
								</div>
								<div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20">
									<h4 className="font-medium mb-2">
										Report Validity
									</h4>
									<p className="text-sm text-blue-100">
										CTOS credit reports are valid for 12
										months from the date of purchase.
										Regular monitoring helps you stay
										informed about your credit health.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
