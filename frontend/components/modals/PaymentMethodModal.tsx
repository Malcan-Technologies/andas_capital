interface PaymentMethodModalProps {
	onClose: () => void;
	onConfirm: () => void;
	amount?: string;
	title?: string;
	reference: string;
	userName: string;
}

export default function PaymentMethodModal({
	onClose,
	onConfirm,
	amount,
	title = "Bank Transfer Payment",
	reference,
	userName,
}: PaymentMethodModalProps) {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-700 font-heading">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-gray-700 transition-colors"
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

					{/* Amount Display */}
					{amount && (
						<div className="mb-6 p-4 bg-blue-tertiary/5 rounded-xl border border-blue-tertiary/20">
							<p className="text-sm text-gray-500 font-body">
								Amount to Pay
							</p>
							<p className="text-xl font-semibold text-blue-600 font-heading">
								MYR {amount}
							</p>
						</div>
					)}

					{/* Bank Transfer Details */}
					<div className="mb-6">
						{/* Bank Transfer Info Header */}
						<div className="flex items-center space-x-3 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-500">
							<div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center border border-blue-600/20">
								<svg
									className="w-5 h-5 text-blue-600"
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
							</div>
							<div>
								<h3 className="font-semibold text-gray-700 font-heading">
									Bank Transfer
								</h3>
								<p className="text-sm text-gray-500 font-body">
									Usually 1 Business Day • Free
								</p>
							</div>
						</div>
					</div>

					<div className="bg-blue-tertiary/5 rounded-xl p-4 mb-6 space-y-4 border border-blue-tertiary/20">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg
										className="w-4 h-4 text-blue-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
								<h3 className="font-semibold text-gray-700 font-heading">
									Bank Transfer Details
								</h3>
							</div>

							<div>
								<p className="text-sm text-gray-500 mb-1 font-body">
									Beneficiary Account Number
								</p>
								<div className="flex items-center justify-between">
									<p className="font-mono text-lg font-semibold text-gray-700">
										001866001878013
									</p>
									<button
										onClick={() =>
											copyToClipboard("001866001878013")
										}
										className="text-blue-600 hover:text-blue-700 text-sm font-medium font-body transition-colors"
									>
										Copy
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1 font-body">
									The account number is exclusive to{" "}
									{userName.toUpperCase()}
								</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 mb-1 font-body">
									Beneficiary Name
								</p>
								<div className="flex items-center justify-between">
									<p className="font-mono text-lg font-semibold text-gray-700">
										GROWKAPITAL187813
									</p>
									<button
										onClick={() =>
											copyToClipboard("GROWKAPITAL187813")
										}
										className="text-blue-600 hover:text-blue-700 text-sm font-medium font-body transition-colors"
									>
										Copy
									</button>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-500 mb-1 font-body">
									Beneficiary Bank
								</p>
								<div className="flex items-center justify-between">
									<p className="font-semibold text-gray-700 font-heading">
										HSBC Bank Malaysia Berhad
									</p>
									<button
										onClick={() =>
											copyToClipboard(
												"HSBC Bank Malaysia Berhad"
											)
										}
										className="text-blue-600 hover:text-blue-700 text-sm font-medium font-body transition-colors"
									>
										Copy
									</button>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-500 mb-1 font-heading">
									Reference (Required)
								</p>
								<div className="flex items-center justify-between">
									<p className="font-mono text-lg font-semibold text-blue-600">
										{reference}
									</p>
									<button
										onClick={() => copyToClipboard(reference)}
										className="text-blue-600 hover:text-blue-700 text-sm font-medium font-body transition-colors"
									>
										Copy
									</button>
								</div>
								<p className="text-xs text-gray-400 mt-1 font-body">
									Please enter your reference ID accurately in the
									"Reference field". Otherwise, your deposit will
									be delayed.
								</p>
							</div>

							{/* Instructions for Bank Transfer */}
							<div className="space-y-2 text-sm text-gray-500 font-body pt-2 border-t border-blue-tertiary/30">
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
									<p>
										Please transfer the exact amount to complete
										your transaction.
									</p>
								</div>
								<div className="flex items-start space-x-2">
									<div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
									<p>
										Include the reference number to ensure proper
										processing.
									</p>
								</div>
							</div>
						</div>

					{/* Submit Button */}
					<button
						onClick={onConfirm}
						className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold font-body hover:bg-blue-700 transition-colors shadow-sm"
					>
						I've Completed the Transfer
					</button>
				</div>
			</div>
		</div>
	);
}
