"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCw, Shield, CheckCircle, AlertCircle, Phone } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface LoanApplication {
	id: string;
	status: string;
	amount: number;
	term: number;
	user?: {
		fullName: string;
		email: string;
		phoneNumber: string;
		idNumber?: string;
		icNumber?: string;
		icType?: string;
	};
}

interface OTPVerificationFormProps {
	onSubmit: (otp: string) => Promise<void>;
	onBack?: () => void; // Optional since attestation is already complete
	application: LoanApplication;
	formatCurrency: (amount: number) => string;
}

interface CertificateStatus {
	exists: boolean;
	status?: string;
	validFrom?: string;
	validTo?: string;
}

export default function OTPVerificationForm({
	onSubmit,
	onBack,
	application,
	formatCurrency,
}: OTPVerificationFormProps) {
	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [otpRequested, setOtpRequested] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [certificateStatus, setCertificateStatus] = useState<CertificateStatus | null>(null);
	const [checkingCertificate, setCheckingCertificate] = useState(true);
	const [requestingOtp, setRequestingOtp] = useState(false);

	// Check certificate status on component mount
	useEffect(() => {
		checkCertificateStatus();
	}, []);

	// Countdown timer for resend OTP
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const checkCertificateStatus = async () => {
		const userIdNumber = application.user?.idNumber || application.user?.icNumber;
		if (!userIdNumber) {
			setError("User ID number (IC/NRIC) is required for certificate verification");
			setCheckingCertificate(false);
			return;
		}

		try {
			setCheckingCertificate(true);
			
			// For UI testing - simulate certificate check
			console.log("UI Testing: Simulating certificate check");
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
			
			// Simulate no existing certificate to show the enrollment flow
			setCertificateStatus({
				exists: false,
			});
		} catch (error) {
			console.error('Error checking certificate status:', error);
			setCertificateStatus({
				exists: false,
			});
		} finally {
			setCheckingCertificate(false);
		}
	};

	const requestOTP = async () => {
		const userIdNumber = application.user?.idNumber || application.user?.icNumber;
		if (!userIdNumber || !application.user?.email) {
			setError("User information is incomplete (missing IC/NRIC or email)");
			return;
		}

		try {
			setRequestingOtp(true);
			setError(null);

			// For UI testing - simulate OTP request
			console.log("UI Testing: Simulating OTP request");
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

			// Always succeed for UI testing
			setOtpRequested(true);
			setCountdown(300); // 5 minutes countdown
			setSuccess(
				certificateStatus?.exists 
					? "OTP sent for digital signing verification" 
					: "OTP sent for certificate enrollment"
			);
		} catch (error) {
			console.error('Error requesting OTP:', error);
			setError('Failed to send OTP. Please try again.');
		} finally {
			setRequestingOtp(false);
		}
	};

	const handleSubmit = async () => {
		if (!otp || otp.length !== 6) {
			setError("Please enter a valid 6-digit OTP");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await onSubmit(otp);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "OTP verification failed"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleOtpChange = (value: string) => {
		const numericValue = value.replace(/\D/g, '').slice(0, 6);
		setOtp(numericValue);
		setError(null);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getCertificateStatusDisplay = () => {
		if (!certificateStatus) return null;

		if (certificateStatus.exists && certificateStatus.status === 'Valid') {
			return (
				<div className="bg-green-50 rounded-xl p-4 border border-green-200">
					<div className="flex items-start">
						<CheckCircle className="text-green-600 mr-3 mt-0.5 flex-shrink-0 w-5 h-5" />
						<div>
							<p className="text-sm text-green-800 font-body">
								<strong>Digital Certificate Found:</strong> You have a valid digital certificate. We'll send an OTP for signing verification.
							</p>
							{certificateStatus.validTo && (
								<p className="text-xs text-green-700 mt-1">
									Valid until: {new Date(certificateStatus.validTo).toLocaleDateString()}
								</p>
							)}
						</div>
					</div>
				</div>
			);
		} else {
			return (
				<div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
					<div className="flex items-start">
						<Shield className="text-blue-600 mr-3 mt-0.5 flex-shrink-0 w-5 h-5" />
						<div>
							<p className="text-sm text-blue-800 font-body">
								<strong>Certificate Enrollment Required:</strong> We'll create a new digital certificate for you and send an OTP for enrollment verification.
							</p>
						</div>
					</div>
				</div>
			);
		}
	};

	if (checkingCertificate) {
		return (
			<div className="space-y-6">
				<div className="text-center mb-8">
					<h1 className="text-2xl lg:text-3xl font-heading font-bold text-gray-700 mb-2">
						Verifying Digital Certificate
					</h1>
					<p className="text-base lg:text-lg text-gray-600 font-body">
						Checking your certificate status for secure signing
					</p>
				</div>

				<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="p-8 text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-primary mx-auto mb-4"></div>
						<p className="text-gray-600 font-body">Checking certificate status...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="text-center mb-8">
				<h1 className="text-2xl lg:text-3xl font-heading font-bold text-gray-700 mb-2">
					Secure Verification
				</h1>
				<p className="text-base lg:text-lg text-gray-600 font-body">
					Complete OTP verification for digital signing
				</p>
			</div>

			{/* Certificate Status */}
			{getCertificateStatusDisplay()}

			{/* OTP Request/Verification Card */}
			<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
				<div className="p-4 sm:p-6 lg:p-8">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center">
							<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
								<Phone className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
							</div>
							<div className="min-w-0">
								<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
									OTP Verification
								</h3>
								<p className="text-sm lg:text-base text-purple-primary font-semibold">
									{certificateStatus?.exists ? "Digital Signing Verification" : "Certificate Enrollment Verification"}
								</p>
							</div>
						</div>
						{otpRequested && (
							<div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
								<CheckCircle className="text-blue-600 mr-2 w-5 h-5" />
								<span className="text-sm font-semibold text-blue-700">OTP Sent</span>
							</div>
						)}
					</div>

					{!otpRequested ? (
						// OTP Request Step
						<div className="space-y-6">
							<div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
								<div className="text-center space-y-4">
									<div className="w-16 h-16 bg-purple-primary/10 rounded-full flex items-center justify-center mx-auto">
										<Shield className="h-8 w-8 text-purple-primary" />
									</div>
									<div>
										<h4 className="text-lg font-heading font-semibold text-gray-700 mb-2">
											Security Verification Required
										</h4>
										<p className="text-gray-600 font-body mb-4">
											To ensure secure digital signing, we need to verify your identity with a one-time password (OTP).
										</p>
										<div className="text-sm text-gray-500 space-y-1">
											<p><strong>Name:</strong> {application.user?.fullName}</p>
											<p><strong>Email:</strong> {application.user?.email}</p>
											<p><strong>ID:</strong> {application.user?.idNumber || application.user?.icNumber}</p>
											<p><strong>Phone:</strong> {application.user?.phoneNumber}</p>
										</div>
									</div>
									<button
										onClick={requestOTP}
										disabled={requestingOtp}
										className="bg-purple-primary text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors font-body font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-3"
									>
										{requestingOtp ? (
											<>
												<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
												Sending OTP...
											</>
										) : (
											<>
												<Phone className="w-5 h-5" />
												Send OTP
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					) : (
						// OTP Verification Step
						<div className="space-y-6">
							<div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
								<div className="flex items-start">
									<AlertCircle className="text-blue-600 mr-3 mt-0.5 flex-shrink-0 w-5 h-5" />
									<div>
										<p className="text-sm text-blue-800 font-body">
											<strong>OTP Sent!</strong> Please check your email <strong>{application.user?.email}</strong> for the 6-digit verification code.
										</p>
									</div>
								</div>
							</div>

							{/* OTP Input */}
							<div className="space-y-4">
								<label className="block">
									<span className="text-sm font-medium text-gray-700 font-body mb-2 block">
										Enter 6-digit OTP
									</span>
									<input
										type="text"
										value={otp}
										onChange={(e) => handleOtpChange(e.target.value)}
										placeholder="000000"
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-primary focus:border-transparent text-center text-2xl font-mono tracking-widest text-gray-900 placeholder-gray-400"
										maxLength={6}
									/>
								</label>

								{/* Countdown and Resend */}
								<div className="flex items-center justify-between">
									<div className="text-sm text-gray-500 font-body">
										{countdown > 0 ? (
											<span>Resend available in {formatTime(countdown)}</span>
										) : (
											<span>Didn't receive the code?</span>
										)}
									</div>
									<button
										onClick={requestOTP}
										disabled={countdown > 0 || requestingOtp}
										className="text-purple-primary hover:text-purple-700 text-sm font-semibold disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2"
									>
										<RefreshCw className="w-4 h-4" />
										Resend OTP
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Success Message */}
			{success && (
				<div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
							<CheckCircle className="text-green-600 w-5 h-5" />
						</div>
						<p className="text-green-700 font-body font-medium">{success}</p>
					</div>
				</div>
			)}

			{/* Error Display */}
			{error && (
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
							<AlertCircle className="text-red-600 w-5 h-5" />
						</div>
						<p className="text-red-700 font-body font-medium">{error}</p>
					</div>
				</div>
			)}

			{/* Navigation Buttons */}
			<div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
				{onBack && (
					<button
						onClick={onBack}
						disabled={loading || requestingOtp}
						className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-body font-semibold disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1 inline-flex items-center justify-center gap-3"
					>
						<ArrowLeft className="w-5 h-5" />
						Back
					</button>
				)}

				<button
					onClick={handleSubmit}
					disabled={!otpRequested || !otp || otp.length !== 6 || loading}
					className={`bg-purple-primary text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors font-body font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 ${onBack ? 'order-1 sm:order-2' : 'w-full'}`}
				>
					{loading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
							Verifying OTP...
						</>
					) : (
						<>
							<ArrowRight className="w-5 h-5" />
							Verify & Continue to Signing
						</>
					)}
				</button>
			</div>
		</div>
	);
}
