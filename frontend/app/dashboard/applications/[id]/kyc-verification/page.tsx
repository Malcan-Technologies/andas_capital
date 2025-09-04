"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchWithTokenRefresh } from "@/lib/authUtils";
import { fetchKycImages, KycImages } from "@/lib/kycUtils";
import KycImageDisplay from "@/components/KycImageDisplay";
import { ArrowLeftIcon, EyeIcon, CheckCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

interface LoanApplication {
	id: string;
	status: string;
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
	product: {
		name: string;
		code: string;
		originationFee: number;
		legalFee: number;
		applicationFee: number;
		interestRate: number;
	};
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
		idNumber?: string;
		icNumber?: string;
		icType?: string;
		kycStatus?: boolean;
	};
}

export default function KycVerificationPage() {
	const router = useRouter();
	const params = useParams();
	const [application, setApplication] = useState<LoanApplication | null>(null);
	const [kycImages, setKycImages] = useState<KycImages | null>(null);
	const [loading, setLoading] = useState(true);
	const [kycImagesLoading, setKycImagesLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
	const [imageViewerOpen, setImageViewerOpen] = useState(false);
	const [processingAccept, setProcessingAccept] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch application data
				const appData = await fetchWithTokenRefresh<LoanApplication>(
					`/api/loan-applications/${params.id}`
				);
				setApplication(appData);

				// Fetch KYC images for this user (KYC is tied to user profile, not specific application)
				const kycData = await fetchKycImages();
				setKycImages(kycData);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
				setKycImagesLoading(false);
			}
		};

		if (params.id) {
			fetchData();
		}
	}, [params.id]);

	const handleStartKyc = async (forceRedo: boolean = false) => {
		try {
			// Start KYC process linked to this application
			// Only use redo=true if explicitly forcing a redo
			const apiUrl = forceRedo ? `/api/kyc/start?redo=true` : `/api/kyc/start`;
			const response = await fetchWithTokenRefresh<{ kycId: string; kycToken: string; ttlMinutes: number }>(
				apiUrl,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ applicationId: params.id }),
				}
			);

			// Use router.replace to avoid adding to history stack and potential navigation issues
			// Add redo=true parameter only if forcing a redo to bypass the redirect logic in the KYC page
			const kycUrl = forceRedo ? `/dashboard/kyc?applicationId=${params.id}&redo=true` : `/dashboard/kyc?applicationId=${params.id}`;
			router.replace(kycUrl);
		} catch (err) {
			console.error("KYC start error:", err);
			setError(err instanceof Error ? err.message : "Failed to start KYC verification");
		}
	};

	const handleAcceptKyc = async () => {
		if (!kycImages) return;

		try {
			setProcessingAccept(true);
			
			// In the new flow, we just need to update the application status
			// The KYC images are already approved and available
			console.log("New flow: Accepting existing KYC images and proceeding to profile confirmation");

			// Update application status to next step - profile confirmation
			await fetchWithTokenRefresh(
				`/api/loan-applications/${params.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: "PENDING_PROFILE_CONFIRMATION",
					}),
				}
			);

			// Redirect to profile confirmation
			router.push(`/dashboard/applications/${params.id}/profile-confirmation`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to accept KYC verification");
		} finally {
			setProcessingAccept(false);
		}
	};

	const handleKycImageView = (imageId: string) => {
		setSelectedImageId(imageId);
		setImageViewerOpen(true);
	};

	const closeImageViewer = () => {
		setImageViewerOpen(false);
		setSelectedImageId(null);
	};

	const handleBack = () => {
		// Go back to loans dashboard - attestation is already completed and cannot be reversed
		router.push("/dashboard/loans?tab=applications");
	};

	if (loading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center min-h-96">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (error || !application) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<h2 className="text-2xl font-heading font-bold text-gray-700 mb-4">
						Error Loading Application
					</h2>
					<p className="text-gray-600 mb-6">{error || "Application not found"}</p>
					<button
						onClick={() => router.push("/dashboard/loans")}
						className="inline-flex items-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Applications
					</button>
				</div>
			</DashboardLayout>
		);
	}

	// Only show KYC verification for applications in PENDING_KYC status
	if (application.status !== "PENDING_KYC") {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<h2 className="text-2xl font-heading font-bold text-gray-700 mb-4">
						KYC Verification Not Required
					</h2>
					<p className="text-gray-600 mb-6">
						This application is not in the correct status for KYC verification.
					</p>
					<button
						onClick={() => router.push("/dashboard/loans")}
						className="inline-flex items-center px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-700 transition-colors"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Applications
					</button>
				</div>
			</DashboardLayout>
		);
	}

	const formatCurrency = (amount: number) => `RM ${amount.toFixed(2)}`;

	return (
		<DashboardLayout>
			<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
				{/* Back Button */}
				<div className="mb-6">
					<button
						onClick={handleBack}
						className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors font-body"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Applications
					</button>
				</div>

				{/* KYC Verification Content */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="mb-6">
						<h1 className="text-3xl font-heading font-bold text-gray-700">
							Identity Verification (KYC)
						</h1>
						<p className="text-gray-600 mt-2">
							Complete your identity verification to proceed with your loan application for{" "}
							<span className="font-semibold text-purple-primary">
								{formatCurrency(application.amount)}
							</span>.
						</p>
					</div>

					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center">
								<div className="w-8 h-8 bg-purple-primary text-white rounded-full flex items-center justify-center">
									<span className="text-xs font-bold">1</span>
								</div>
								<span className="ml-2 text-purple-primary font-medium">KYC Verification</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center">
									<span className="text-xs font-bold">2</span>
								</div>
								<span className="ml-2 text-gray-500 font-medium">Profile Confirmation</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center">
									<span className="text-xs font-bold">3</span>
								</div>
								<span className="ml-2 text-gray-500 font-medium">Certificate Request</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center">
									<span className="text-xs font-bold">4</span>
								</div>
								<span className="ml-2 text-gray-500 font-medium">Document Signing</span>
							</div>
						</div>
					</div>

					{kycImagesLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-primary"></div>
							<span className="ml-3 text-gray-600 font-body">Checking KYC status...</span>
						</div>
					) : kycImages ? (
						// Show existing KYC images
						<div className="space-y-6">
							<div className="bg-green-50 border border-green-200 rounded-xl p-6">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
										<CheckCircleIcon className="w-6 h-6 text-green-600" />
									</div>
									<div className="flex-1">
										<h3 className="text-lg font-heading font-bold text-green-800 mb-2">
											KYC Documents Found
										</h3>
										<p className="text-green-700 font-body">
											We found your previously uploaded KYC documents. Please review them below and accept to continue, or redo the verification if needed.
										</p>
									</div>
								</div>
							</div>

							{/* KYC Images Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{kycImages.images?.front && (
									<div className="bg-gray-50 p-4 lg:p-5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
										<div className="flex flex-col items-center space-y-3">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<rect x="3" y="3" width="18" height="14" rx="2" ry="2"/>
												</svg>
											</div>
											<div className="text-center">
												<h4 className="text-sm lg:text-base font-semibold text-gray-700 font-body mb-1">
													{kycImages.images?.front?.type}
												</h4>
												<p className="text-xs text-gray-500 font-body mb-3">
													MyKad Front Side
												</p>
												<button
													onClick={() => handleKycImageView(kycImages.images?.front?.id!)}
													className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300 w-full"
												>
													<EyeIcon className="h-4 w-4 mr-1" />
													View
												</button>
											</div>
										</div>
									</div>
								)}
								{kycImages.images?.back && (
									<div className="bg-gray-50 p-4 lg:p-5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
										<div className="flex flex-col items-center space-y-3">
											<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
												<svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<rect x="3" y="3" width="18" height="14" rx="2" ry="2"/>
												</svg>
											</div>
											<div className="text-center">
												<h4 className="text-sm lg:text-base font-semibold text-gray-700 font-body mb-1">
													{kycImages.images?.back?.type}
												</h4>
												<p className="text-xs text-gray-500 font-body mb-3">
													MyKad Back Side
												</p>
												<button
													onClick={() => handleKycImageView(kycImages.images?.back?.id!)}
													className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300 w-full"
												>
													<EyeIcon className="h-4 w-4 mr-1" />
													View
												</button>
											</div>
										</div>
									</div>
								)}
								{kycImages.images?.selfie && (
									<div className="bg-gray-50 p-4 lg:p-5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
										<div className="flex flex-col items-center space-y-3">
											<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
												<svg className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<circle cx="12" cy="12" r="4"/>
												</svg>
											</div>
											<div className="text-center">
												<h4 className="text-sm lg:text-base font-semibold text-gray-700 font-body mb-1">
													{kycImages.images?.selfie?.type}
												</h4>
												<p className="text-xs text-gray-500 font-body mb-3">
													Identity Verification Photo
												</p>
												<button
													onClick={() => handleKycImageView(kycImages.images?.selfie?.id!)}
													className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300 w-full"
												>
													<EyeIcon className="h-4 w-4 mr-1" />
													View
												</button>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
								<button
									onClick={handleAcceptKyc}
									disabled={processingAccept}
									className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{processingAccept ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Accepting...
										</>
									) : (
										<>
											<CheckCircleIcon className="w-5 h-5 mr-2" />
											Accept & Continue
										</>
									)}
								</button>
								<button
									onClick={() => handleStartKyc(true)}
									className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200 text-base font-medium"
								>
									<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									Redo KYC
								</button>
							</div>
						</div>
					) : (
						// No existing KYC - start new
						<div className="text-center py-12">
							<div className="w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
								<ShieldCheckIcon className="w-10 h-10 text-purple-600" />
							</div>
							<h3 className="text-2xl font-heading font-bold text-gray-700 mb-4">
								Identity Verification Required
							</h3>
							<p className="text-gray-600 font-body mb-8 max-w-md mx-auto">
								To proceed with your loan application, we need to verify your identity by scanning your MyKad and taking a selfie.
							</p>
							<button
								onClick={() => handleStartKyc(false)}
								className="inline-flex items-center px-8 py-4 bg-purple-primary text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-lg font-medium"
							>
								<ShieldCheckIcon className="w-6 h-6 mr-3" />
								Start KYC Verification
							</button>
						</div>
					)}
				</div>
			</div>

			{/* KYC Image Viewer Modal */}
			{imageViewerOpen && selectedImageId && (
				<div 
					className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							closeImageViewer();
						}
					}}
				>
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 relative">
						<div className="flex items-center justify-between p-6 border-b border-gray-100">
							<h3 className="text-xl font-heading font-bold text-gray-700">
								KYC Document
							</h3>
							<button
								onClick={closeImageViewer}
								className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="p-6">
							<KycImageDisplay imageId={selectedImageId} />
						</div>
					</div>
				</div>
			)}
		</DashboardLayout>
	);
}
