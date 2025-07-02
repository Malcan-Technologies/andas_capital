"use client";

import { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";

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
	};
}

interface AttestationFormProps {
	onSubmit: () => Promise<void>;
	onBack: () => void;
	application: LoanApplication;
	calculateFees: (application: LoanApplication) => {
		interestRate: number;
		legalFee: number;
		netDisbursement: number;
		originationFee: number;
		applicationFee: number;
		totalFees: number;
	};
	formatCurrency: (amount: number) => string;
}

export default function AttestationForm({
	onSubmit,
	onBack,
	application,
	calculateFees,
	formatCurrency,
}: AttestationFormProps) {
	const [videoWatched, setVideoWatched] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [videoStarted, setVideoStarted] = useState(false);

	const fees = calculateFees(application);

	const handleVideoStart = () => {
		setVideoStarted(true);
	};

	const handleVideoComplete = () => {
		setVideoWatched(true);
	};

	const handleSubmit = async () => {
		if (!videoWatched || !termsAccepted) {
			setError(
				"Please watch the video and accept the loan terms to continue."
			);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			await onSubmit();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to complete attestation"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-heading font-bold text-gray-700 mb-2">
					Loan Terms Attestation
				</h2>
				<p className="text-gray-600 font-body">
					Please review your loan terms and confirm your understanding
				</p>
			</div>

			{/* Comprehensive Loan Details */}
			<div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
				<h3 className="text-lg font-heading font-semibold text-gray-700 mb-6">
					Complete Loan Terms & Details
				</h3>

				{/* Basic Loan Information */}
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600 font-body">
								Product
							</p>
							<p className="text-lg font-semibold text-purple-primary">
								{application.product.name}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 font-body">
								Loan Purpose
							</p>
							<p className="text-lg font-semibold text-purple-primary">
								{application.purpose}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 font-body">
								Loan Amount
							</p>
							<p className="text-lg font-semibold text-purple-primary">
								{formatCurrency(application.amount)}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 font-body">
								Loan Term
							</p>
							<p className="text-lg font-semibold text-purple-primary">
								{application.term} months
							</p>
						</div>
					</div>

					{/* Fees Breakdown */}
					<div className="pt-4 border-t border-gray-200">
						<h4 className="text-md font-heading font-semibold text-gray-700 mb-4">
							Fee Breakdown
						</h4>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 font-body">
									Interest Rate (Monthly)
								</span>
								<span className="text-sm font-medium text-gray-700">
									{application.product.interestRate}%
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 font-body">
									Origination Fee (
									{application.product.originationFee}%)
								</span>
								<span className="text-sm font-medium text-red-600">
									({formatCurrency(fees.originationFee)})
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 font-body">
									Legal Fee ({application.product.legalFee}%)
								</span>
								<span className="text-sm font-medium text-red-600">
									({formatCurrency(fees.legalFee)})
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-gray-600 font-body">
									Application Fee (paid upfront)
								</span>
								<span className="text-sm font-medium text-red-600">
									({formatCurrency(fees.applicationFee)})
								</span>
							</div>
						</div>
					</div>

					{/* Key Financial Information */}
					<div className="pt-4 border-t border-gray-200">
						<div className="space-y-4">
							{/* Net Loan Disbursement */}
							<div className="bg-blue-tertiary/5 rounded-xl p-4 border border-blue-tertiary/20">
								<div className="flex justify-between items-center">
									<span className="text-blue-tertiary font-normal text-base font-body">
										Net Loan Disbursement
									</span>
									<span className="text-blue-tertiary font-normal text-lg font-heading">
										{formatCurrency(fees.netDisbursement)}
									</span>
								</div>
							</div>

							{/* Monthly Repayment */}
							<div className="bg-purple-primary/5 rounded-xl p-4 border border-purple-primary/20">
								<div className="flex justify-between items-center">
									<span className="text-purple-primary font-normal text-base font-body">
										Monthly Repayment
									</span>
									<span className="text-purple-primary font-normal text-lg font-heading">
										{formatCurrency(
											application.monthlyRepayment
										)}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Personal Information */}
					{application.user && (
						<div className="pt-4 border-t border-gray-200">
							<h4 className="text-md font-heading font-semibold text-gray-700 mb-4">
								Borrower Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="flex justify-between">
									<span className="text-sm text-gray-600 font-body">
										Full Name
									</span>
									<span className="text-sm font-medium text-gray-700">
										{application.user.fullName}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600 font-body">
										Email
									</span>
									<span className="text-sm font-medium text-gray-700">
										{application.user.email}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600 font-body">
										Phone
									</span>
									<span className="text-sm font-medium text-gray-700">
										{application.user.phoneNumber}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-600 font-body">
										Employment
									</span>
									<span className="text-sm font-medium text-gray-700">
										{application.user.employmentStatus}
									</span>
								</div>
								{application.user.monthlyIncome &&
									!isNaN(
										Number(application.user.monthlyIncome)
									) &&
									Number(application.user.monthlyIncome) >
										0 && (
										<div className="flex justify-between">
											<span className="text-sm text-gray-600 font-body">
												Monthly Income
											</span>
											<span className="text-sm font-medium text-gray-700">
												{formatCurrency(
													Number(
														application.user
															.monthlyIncome
													)
												)}
											</span>
										</div>
									)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Video Section */}
			<div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
				<div className="flex items-center mb-4">
					<PlayArrowIcon className="text-purple-primary mr-2" />
					<h3 className="text-lg font-heading font-semibold text-gray-700">
						Loan Terms Video
					</h3>
					{videoWatched && (
						<CheckCircleIcon className="text-green-600 ml-2" />
					)}
				</div>

				<div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
					{!videoStarted ? (
						<div className="aspect-video flex items-center justify-center p-8">
							<div className="text-center">
								<PlayArrowIcon
									className="text-purple-primary mx-auto mb-2"
									style={{ fontSize: 48 }}
								/>
								<p className="text-gray-600 font-body mb-4">
									Click to watch the loan terms explanation
									video
								</p>
								<button
									onClick={handleVideoStart}
									className="bg-purple-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-body inline-flex items-center gap-2"
								>
									<PlayArrowIcon className="w-5 h-5" />
									Start Video
								</button>
							</div>
						</div>
					) : (
						<div className="relative">
							{!videoWatched ? (
								<div className="space-y-4">
									<div className="relative aspect-video">
										<video
											className="w-full h-full object-cover"
											controls
											autoPlay
											onEnded={handleVideoComplete}
											controlsList="nodownload"
										>
											<source
												src="/videos/attestation.mp4"
												type="video/mp4"
											/>
											Your browser does not support the
											video tag.
										</video>
										<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
											<p className="text-white font-body text-sm">
												Please watch the complete video
												to continue
											</p>
										</div>
									</div>
									<div className="text-center pt-4 pb-6">
										<button
											onClick={handleVideoComplete}
											className="bg-white text-purple-primary border border-purple-primary px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-body text-sm"
										>
											I have finished watching the video
										</button>
									</div>
								</div>
							) : (
								<div className="aspect-video flex items-center justify-center p-8">
									<div className="text-center">
										<CheckCircleIcon
											className="text-green-600 mx-auto mb-2"
											style={{ fontSize: 48 }}
										/>
										<p className="text-green-600 font-body font-semibold">
											Video completed successfully!
										</p>
										<p className="text-gray-600 font-body text-sm mt-2 mb-4">
											You can now accept the terms and
											conditions below
										</p>
										<button
											onClick={() => {
												setVideoWatched(false);
												setVideoStarted(false);
											}}
											className="text-gray-500 hover:text-gray-700 text-sm font-body underline transition-colors"
										>
											Watch video again
										</button>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				<div className="bg-blue-50 p-4 rounded-lg">
					<div className="flex items-start">
						<InfoIcon className="text-blue-600 mr-2 mt-0.5" />
						<div>
							<p className="text-sm text-blue-800 font-body">
								<strong>Important:</strong> This video explains
								your loan terms, repayment schedule, and your
								rights and obligations as a borrower. Please
								watch it completely before proceeding.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Terms Acceptance */}
			<div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
				<h3 className="text-lg font-heading font-semibold text-gray-700 mb-4">
					Terms and Conditions
				</h3>

				<label className="inline-flex items-start cursor-pointer">
					<input
						type="checkbox"
						checked={termsAccepted}
						onChange={(e) => setTermsAccepted(e.target.checked)}
						disabled={!videoWatched}
						className="mt-1 mr-3 h-4 w-4 text-purple-primary border-gray-300 rounded focus:ring-purple-primary focus:ring-2"
					/>
					<span className="font-body text-gray-700">
						I confirm that I have watched the loan terms video and
						understand my rights and obligations under this loan
						agreement. I accept the terms and conditions as
						explained.
					</span>
				</label>

				{!videoWatched && (
					<p className="text-sm text-gray-500 font-body mt-2">
						Please watch the video first to enable this checkbox
					</p>
				)}
			</div>

			{/* Error Display */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-600 font-body">{error}</p>
				</div>
			)}

			{/* Navigation Buttons */}
			<div className="flex justify-between pt-6">
				<button
					onClick={onBack}
					disabled={loading}
					className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors font-body disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Back
				</button>

				<button
					onClick={handleSubmit}
					disabled={!videoWatched || !termsAccepted || loading}
					className="bg-purple-primary text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors font-body disabled:bg-gray-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
				>
					{loading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
							Processing...
						</>
					) : (
						<>
							<CheckCircleIcon className="w-5 h-5" />
							Complete Attestation
						</>
					)}
				</button>
			</div>
		</div>
	);
}
