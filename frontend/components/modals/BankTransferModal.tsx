interface BankTransferModalProps {
	onClose: () => void;
	onConfirm: () => void;
	amount: string;
	reference: string;
	userName: string;
}

export default function BankTransferModal({
	onClose,
	onConfirm,
	amount,
	reference,
	userName,
}: BankTransferModalProps) {
	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-700 font-heading">
							Bank Transfer
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
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-500 mb-2 font-body">
							Transfer Amount (MYR)
						</label>
						<div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-blue-tertiary/5 text-lg font-semibold text-blue-600 font-heading">
							{amount}
						</div>
					</div>

					{/* Bank Details */}
					<div className="bg-blue-tertiary/5 rounded-xl p-4 mb-6 space-y-4 border border-blue-tertiary/20">
						<div>
							<p className="text-sm text-gray-500 mb-1 font-body">
								Beneficiary Account Number
							</p>
							<div className="flex items-center justify-between">
								<p className="font-mono font-semibold text-gray-700">
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
					
						</div>

						<div>
							<p className="text-sm text-gray-500 mb-1 font-body">
								Beneficiary Name
							</p>
							<div className="flex items-center justify-between">
								<p className="font-mono font-semibold text-gray-700">
									OPG Capital Holdings Sdn. Bhd.
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
								<p className="font-mono font-semibold text-gray-700 font-heading">
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
								<p className="font-mono font-semibold text-gray-700">
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
					</div>

					{/* Instructions */}
					<div className="mb-6 space-y-3 text-sm text-gray-500 font-body">
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
