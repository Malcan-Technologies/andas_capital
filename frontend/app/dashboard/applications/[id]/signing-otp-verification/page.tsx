"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { fetchWithTokenRefresh } from "@/lib/authUtils";
import { ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

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

export default function SigningOTPVerificationPage() {
	const router = useRouter();
	const params = useParams();
	const [application, setApplication] = useState<LoanApplication | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [certCheckLoading, setCertCheckLoading] = useState(false);
	const [certStatus, setCertStatus] = useState<"checking" | "new_user" | "existing_user" | null>(null);
	const [otpStep, setOtpStep] = useState<"check_cert" | "request_otp" | "verify_otp">("check_cert");
	const [otpCode, setOtpCode] = useState("");
	const [otpSending, setOtpSending] = useState(false);
	const [otpVerifying, setOtpVerifying] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		const fetchApplication = async () => {
			try {
				const data = await fetchWithTokenRefresh<LoanApplication>(
					`/api/loan-applications/${params.id}`
				);
				setApplication(data);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
			}
		};

		if (params.id) {
			fetchApplication();
		}
	}, [params.id]);

	// Countdown timer for OTP resend
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const checkCertificateStatus = async () => {
		if (!application?.user?.icNumber) {
			setError("IC number not found. Please complete your profile first.");
			return;
		}

		setCertCheckLoading(true);
		try {
			
			setCertStatus("new_user");
			setOtpStep("request_otp");
		} catch (err) {
			console.error("Certificate check failed:", err);
			// Fallback to new user flow if check fails
			setCertStatus("new_user");
			setOtpStep("request_otp");
		} finally {
			setCertCheckLoading(false);
		}
	};

	const requestOTP = async () => {
		if (!application?.user?.icNumber) {
			setError("IC number not found");
			return;
		}

		setOtpSending(true);
		try {
			
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			setOtpSent(true);
			setOtpStep("verify_otp");
			setCountdown(60); // 60 second countdown for resend
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to request OTP");
		} finally {
			setOtpSending(false);
		}
	};

	const verifyOTP = async () => {
		if (!otpCode.trim()) {
			setError("Please enter the OTP code");
			return;
		}

		setOtpVerifying(true);
		try {
			
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Always proceed to signing for UI testing
			handleProceedToSigning();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to verify OTP");
		} finally {
			setOtpVerifying(false);
		}
	};

	const handleProceedToSigning = async () => {
		try {
			// Update application status to PENDING_SIGNATURE
			await fetchWithTokenRefresh(
				`/api/loan-applications/${params.id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: "PENDING_SIGNATURE",
					}),
				}
			);

			// Initiate DocuSeal signing
			const signingResponse = await fetchWithTokenRefresh<{ signingUrl: string }>(
				`/api/loan-applications/${params.id}/initiate-signing`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const { signingUrl } = signingResponse;
			
			// Redirect to DocuSeal for signing
			window.location.href = signingUrl;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to proceed with signing");
		}
	};

	const handleBack = () => {
		router.push("/dashboard/loans");
	};

	const handleBackToProfileConfirmation = async () => {
		try {
			// Update application status back to PENDING_PROFILE_CONFIRMATION
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

			// Navigate back to profile confirmation
			router.push(`/dashboard/applications/${params.id}/profile-confirmation`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to go back to profile confirmation");
		}
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

	// Only show signing OTP for applications in PENDING_SIGNING_OTP_DS status
	if (application.status !== "PENDING_SIGNING_OTP_DS") {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<h2 className="text-2xl font-heading font-bold text-gray-700 mb-4">
						Signing OTP Not Required
					</h2>
					<p className="text-gray-600 mb-6">
						This application is not in the correct status for signing OTP verification.
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
						onClick={handleBackToProfileConfirmation}
						className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors font-body"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back to Profile Confirmation
					</button>
				</div>

				{/* Signing OTP Content */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="mb-6">
						<h1 className="text-3xl font-heading font-bold text-gray-700">
							Digital Signature Verification
						</h1>
						<p className="text-gray-600 mt-2">
							Verify your identity for digital signing of your loan agreement for{" "}
							<span className="font-semibold text-purple-primary">
								{formatCurrency(application.amount)}
							</span>.
						</p>
					</div>

					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center">
								<div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
									<CheckCircleIcon className="w-4 h-4" />
								</div>
								<span className="ml-2 text-green-600 font-medium">KYC Verified</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
									<CheckCircleIcon className="w-4 h-4" />
								</div>
								<span className="ml-2 text-green-600 font-medium">Profile Confirmed</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
									<CheckCircleIcon className="w-4 h-4" />
								</div>
								<span className="ml-2 text-green-600 font-medium">Certificate Enrolled</span>
							</div>
							<div className="flex-1 h-px bg-gray-300 mx-4"></div>
							<div className="flex items-center">
								<div className="w-8 h-8 bg-purple-primary text-white rounded-full flex items-center justify-center">
									<span className="text-xs font-bold">4</span>
								</div>
								<span className="ml-2 text-purple-primary font-medium">Document Signing</span>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className="space-y-6">
						{otpStep === "check_cert" && (
							<div className="text-center py-12">
								<div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
									<ShieldCheckIcon className="w-10 h-10 text-blue-600" />
								</div>
								<h3 className="text-2xl font-heading font-bold text-gray-700 mb-4">
									Checking Digital Certificate
								</h3>
								<p className="text-gray-600 font-body mb-8 max-w-md mx-auto">
									We're checking if you have an existing digital certificate for faster signing.
								</p>
								<button
									onClick={checkCertificateStatus}
									disabled={certCheckLoading}
									className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{certCheckLoading ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
											Checking Certificate...
										</>
									) : (
										<>
											<ShieldCheckIcon className="w-6 h-6 mr-3" />
											Start Certificate Check
										</>
									)}
								</button>
							</div>
						)}

						{otpStep === "request_otp" && certStatus === "new_user" && (
							<div className="space-y-6">
								<div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
									<div className="flex items-start space-x-4">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
											<ShieldCheckIcon className="w-6 h-6 text-blue-600" />
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-heading font-bold text-blue-800 mb-2">
												Digital Signing Verification Required
											</h3>
											<p className="text-blue-700 font-body">
												We need to verify your identity for digital signing. An OTP will be sent to your registered contact for verification.
											</p>
										</div>
									</div>
								</div>

								<div className="text-center py-8">
									<h3 className="text-xl font-heading font-bold text-gray-700 mb-4">
										Request Signing OTP
									</h3>
									<p className="text-gray-600 font-body mb-8">
										Click below to receive an OTP for digital signature verification.
									</p>
									<button
										onClick={requestOTP}
										disabled={otpSending}
										className="inline-flex items-center px-8 py-4 bg-purple-primary text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{otpSending ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
												Sending OTP...
											</>
										) : (
											<>
												<svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
												</svg>
												Request OTP
											</>
										)}
									</button>
								</div>
							</div>
						)}

						{otpStep === "verify_otp" && (
							<div className="space-y-6">
								{certStatus === "existing_user" ? (
									<div className="bg-green-50 border border-green-200 rounded-xl p-6">
										<div className="flex items-start space-x-4">
											<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
												<CheckCircleIcon className="w-6 h-6 text-green-600" />
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-heading font-bold text-green-800 mb-2">
													Valid Certificate Found
												</h3>
												<p className="text-green-700 font-body">
													You have a valid digital certificate. You can proceed directly to document signing.
												</p>
											</div>
										</div>
									</div>
								) : (
									<div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
										<div className="flex items-start space-x-4">
											<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
												<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
												</svg>
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-heading font-bold text-purple-800 mb-2">
													Enter Verification Code
												</h3>
												<p className="text-purple-700 font-body">
													Please enter the OTP code sent to your registered contact to proceed with signing.
												</p>
											</div>
										</div>
									</div>
								)}

								{certStatus === "new_user" && (
									<div className="max-w-md mx-auto">
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 font-body mb-2">
													Enter OTP Code
												</label>
												<input
													type="text"
													value={otpCode}
													onChange={(e) => {
														setOtpCode(e.target.value);
														if (error) setError("");
													}}
													className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-purple-primary font-mono text-lg text-center tracking-widest text-gray-900 placeholder-gray-400"
													placeholder="Enter 6-digit code"
													maxLength={6}
												/>
											</div>

											{error && (
												<div className="bg-red-50 border border-red-200 rounded-lg p-3">
													<p className="text-sm text-red-700 font-body">
														{error}
													</p>
												</div>
											)}

											<button
												onClick={verifyOTP}
												disabled={otpVerifying || otpCode.length !== 6}
												className="w-full flex items-center justify-center px-6 py-3 bg-purple-primary text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{otpVerifying ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
														Verifying...
													</>
												) : (
													<>
														<CheckCircleIcon className="w-5 h-5 mr-2" />
														Verify & Sign
													</>
												)}
											</button>

											{countdown > 0 ? (
												<p className="text-center text-sm text-gray-500 font-body">
													Resend OTP in {countdown} seconds
												</p>
											) : otpSent && (
												<button
													onClick={requestOTP}
													disabled={otpSending}
													className="w-full text-center text-sm text-purple-primary hover:text-purple-700 font-body underline disabled:opacity-50"
												>
													{otpSending ? "Sending..." : "Resend OTP"}
												</button>
											)}
										</div>
									</div>
								)}

								{certStatus === "existing_user" && (
									<div className="text-center py-8">
										<button
											onClick={handleProceedToSigning}
											className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-lg font-medium"
										>
											<CheckCircleIcon className="w-6 h-6 mr-3" />
											Proceed to Signing
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
