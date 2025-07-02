"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import {
	VideoCameraIcon,
	UserIcon,
	PhoneIcon,
	EnvelopeIcon,
	CheckCircleIcon,
	ClockIcon,
	DocumentTextIcon,
	CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { fetchWithAdminTokenRefresh } from "@/lib/authUtils";

interface LoanApplication {
	id: string;
	status: string;
	amount: number;
	term: number;
	purpose: string;
	createdAt: string;
	updatedAt: string;
	attestationType: string;
	attestationCompleted: boolean;
	attestationDate: string | null;
	attestationNotes: string | null;
	meetingCompletedAt: string | null;
	user: {
		id: string;
		fullName: string;
		email: string;
		phoneNumber: string;
	};
	product: {
		id: string;
		name: string;
		code: string;
	};
}

export default function LiveAttestationsPage() {
	const router = useRouter();
	const [applications, setApplications] = useState<LoanApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [processingId, setProcessingId] = useState<string | null>(null);

	useEffect(() => {
		loadLiveAttestationRequests();
	}, []);

	const loadLiveAttestationRequests = async () => {
		try {
			setLoading(true);
			setError(null);

			const data = await fetchWithAdminTokenRefresh<LoanApplication[]>(
				"/api/admin/applications/live-attestations"
			);

			setApplications(data);
		} catch (error) {
			console.error("Error loading live attestation requests:", error);
			setError("Failed to load live attestation requests");
		} finally {
			setLoading(false);
		}
	};

	const handleCompleteAttestation = async (applicationId: string) => {
		try {
			setProcessingId(applicationId);

			await fetchWithAdminTokenRefresh(
				`/api/admin/applications/${applicationId}/complete-live-attestation`,
				{
					method: "POST",
					body: JSON.stringify({
						notes: "Live video call completed by admin",
						meetingCompletedAt: new Date().toISOString(),
					}),
				}
			);

			// Reload the list
			await loadLiveAttestationRequests();

			alert("Live attestation completed successfully!");
		} catch (error) {
			console.error("Error completing live attestation:", error);
			alert("Failed to complete live attestation. Please try again.");
		} finally {
			setProcessingId(null);
		}
	};

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
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDateOnly = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-MY", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<AdminLayout
				title="Live Video Attestations"
				description="Manage live video call attestation requests"
			>
				<div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
					<div className="flex items-center justify-center h-64">
						<div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (error) {
		return (
			<AdminLayout
				title="Live Video Attestations"
				description="Manage live video call attestation requests"
			>
				<div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
					<div className="bg-red-500/20 border border-red-400/20 rounded-lg p-4">
						<p className="text-red-200">{error}</p>
						<button
							onClick={loadLiveAttestationRequests}
							className="mt-2 text-red-300 hover:text-red-100 underline"
						>
							Try again
						</button>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout
			title="Live Video Attestations"
			description="Manage live video call attestation requests"
		>
			<div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
				<div className="space-y-6">
					{/* Header */}
					<div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
						<div className="flex items-center space-x-3">
							<div className="p-3 bg-purple-500/20 border border-purple-400/20 rounded-lg">
								<VideoCameraIcon className="h-6 w-6 text-purple-400" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-white">
									Live Video Attestations
								</h1>
								<p className="text-gray-400">
									Manage live video call attestation requests
								</p>
							</div>
						</div>
						<button
							onClick={loadLiveAttestationRequests}
							className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg font-medium transition-colors border border-purple-400/20"
						>
							Refresh
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
							<div className="flex items-center">
								<div className="p-2 bg-amber-500/20 border border-amber-400/20 rounded-lg">
									<ClockIcon className="h-5 w-5 text-amber-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-400">
										Pending Calls
									</p>
									<p className="text-2xl font-bold text-white">
										{
											applications.filter(
												(app) =>
													!app.attestationCompleted
											).length
										}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
							<div className="flex items-center">
								<div className="p-2 bg-green-500/20 border border-green-400/20 rounded-lg">
									<CheckCircleIcon className="h-5 w-5 text-green-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-400">
										Completed Calls
									</p>
									<p className="text-2xl font-bold text-white">
										{
											applications.filter(
												(app) =>
													app.attestationCompleted
											).length
										}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-6">
							<div className="flex items-center">
								<div className="p-2 bg-blue-500/20 border border-blue-400/20 rounded-lg">
									<VideoCameraIcon className="h-5 w-5 text-blue-400" />
								</div>
								<div className="ml-3">
									<p className="text-sm font-medium text-gray-400">
										Total Requests
									</p>
									<p className="text-2xl font-bold text-white">
										{applications.length}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Applications List */}
					{applications.length === 0 ? (
						<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg p-12 text-center">
							<VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-white mb-2">
								No Live Attestation Requests
							</h3>
							<p className="text-gray-400">
								When users request live video calls for
								attestation, they will appear here.
							</p>
						</div>
					) : (
						<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md border border-gray-700/30 rounded-xl shadow-lg overflow-hidden">
							<div className="px-6 py-4 border-b border-gray-700/30">
								<h2 className="text-lg font-medium text-white">
									Live Attestation Requests
								</h2>
								<p className="text-sm text-gray-400 mt-1">
									{applications.length} total request
									{applications.length !== 1 ? "s" : ""}
								</p>
							</div>
							<div className="divide-y divide-gray-700/30">
								{applications.map((application) => (
									<div
										key={application.id}
										className="p-6 hover:bg-gray-800/30 transition-colors"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												{/* Customer Info */}
												<div className="flex items-start space-x-4">
													<div className="p-3 bg-purple-500/20 border border-purple-400/20 rounded-lg">
														<UserIcon className="h-6 w-6 text-purple-400" />
													</div>
													<div className="flex-1">
														<div className="flex items-center space-x-2">
															<h3 className="text-lg font-medium text-white">
																{
																	application
																		.user
																		.fullName
																}
															</h3>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
																	application.attestationCompleted
																		? "bg-green-500/20 text-green-300 border-green-400/20"
																		: "bg-amber-500/20 text-amber-300 border-amber-400/20"
																}`}
															>
																{application.attestationCompleted
																	? "Completed"
																	: "Pending"}
															</span>
														</div>
														<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="flex items-center space-x-2 text-sm text-gray-300">
																<EnvelopeIcon className="h-4 w-4 text-gray-400" />
																<span>
																	{
																		application
																			.user
																			.email
																	}
																</span>
															</div>
															<div className="flex items-center space-x-2 text-sm text-gray-300">
																<PhoneIcon className="h-4 w-4 text-gray-400" />
																<span>
																	{
																		application
																			.user
																			.phoneNumber
																	}
																</span>
															</div>
														</div>
													</div>
												</div>

												{/* Application Info */}
												<div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
													<div>
														<span className="font-medium text-gray-300">
															Product:
														</span>
														<span className="ml-1 text-gray-400">
															{
																application
																	.product
																	.name
															}
														</span>
													</div>
													<div>
														<span className="font-medium text-gray-300">
															Amount:
														</span>
														<span className="ml-1 text-gray-400">
															{formatCurrency(
																application.amount
															)}
														</span>
													</div>
													<div>
														<span className="font-medium text-gray-300">
															Term:
														</span>
														<span className="ml-1 text-gray-400">
															{application.term}{" "}
															months
														</span>
													</div>
												</div>

												{/* Timeline */}
												<div className="mt-4 flex items-center space-x-6 text-xs text-gray-400">
													<div className="flex items-center space-x-1">
														<CalendarDaysIcon className="h-4 w-4" />
														<span>
															Requested:{" "}
															{formatDate(
																application.updatedAt
															)}
														</span>
													</div>
													{application.meetingCompletedAt && (
														<div className="flex items-center space-x-1">
															<CheckCircleIcon className="h-4 w-4 text-green-400" />
															<span>
																Completed:{" "}
																{formatDate(
																	application.meetingCompletedAt
																)}
															</span>
														</div>
													)}
												</div>

												{/* Notes */}
												{application.attestationNotes && (
													<div className="mt-3 p-3 bg-gray-800/50 border border-gray-700/30 rounded-lg">
														<div className="flex items-start space-x-2">
															<DocumentTextIcon className="h-4 w-4 text-gray-400 mt-0.5" />
															<div>
																<p className="text-xs font-medium text-gray-300">
																	Admin Notes:
																</p>
																<p className="text-sm text-gray-400 mt-1">
																	{
																		application.attestationNotes
																	}
																</p>
															</div>
														</div>
													</div>
												)}
											</div>

											{/* Action Button */}
											<div className="ml-4">
												{!application.attestationCompleted ? (
													<button
														onClick={() =>
															handleCompleteAttestation(
																application.id
															)
														}
														disabled={
															processingId ===
															application.id
														}
														className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600/20 text-green-300 disabled:text-gray-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 border border-green-400/20 disabled:border-gray-600/20"
													>
														{processingId ===
														application.id ? (
															<>
																<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
																<span>
																	Processing...
																</span>
															</>
														) : (
															<>
																<CheckCircleIcon className="h-4 w-4" />
																<span>
																	Mark
																	Complete
																</span>
															</>
														)}
													</button>
												) : (
													<div className="text-green-400 font-medium text-sm flex items-center space-x-1">
														<CheckCircleIcon className="h-4 w-4" />
														<span>Completed</span>
													</div>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	);
}
