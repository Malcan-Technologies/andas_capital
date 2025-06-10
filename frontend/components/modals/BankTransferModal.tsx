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
			<div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-white border border-white/10">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold">Bank Transfer</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-200"
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
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Transfer Amount (MYR)
						</label>
						<div className="w-full px-4 py-3 border border-gray-600 rounded-xl bg-gray-700/50 text-lg font-semibold text-white backdrop-blur-md">
							{amount}
						</div>
					</div>

					{/* Bank Details */}
					<div className="bg-white/5 rounded-xl p-4 mb-6 space-y-4 border border-white/10">
						<div>
							<p className="text-sm text-gray-400 mb-1">
								Beneficiary Account Number
							</p>
							<div className="flex items-center justify-between">
								<p className="font-mono text-lg font-semibold text-white">
									001866001878013
								</p>
								<button
									onClick={() =>
										copyToClipboard("001866001878013")
									}
									className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
								>
									Copy
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								The account number is exclusive to{" "}
								{userName.toUpperCase()}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-400 mb-1">
								Beneficiary Name
							</p>
							<div className="flex items-center justify-between">
								<p className="font-mono text-lg font-semibold text-white">
									GROWKAPITAL187813
								</p>
								<button
									onClick={() =>
										copyToClipboard("GROWKAPITAL187813")
									}
									className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
								>
									Copy
								</button>
							</div>
						</div>

						<div>
							<p className="text-sm text-gray-400 mb-1">
								Beneficiary Bank
							</p>
							<div className="flex items-center justify-between">
								<p className="font-semibold text-white">
									HSBC Bank Malaysia Berhad
								</p>
								<button
									onClick={() =>
										copyToClipboard(
											"HSBC Bank Malaysia Berhad"
										)
									}
									className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
								>
									Copy
								</button>
							</div>
						</div>

						<div>
							<p className="text-sm text-gray-400 mb-1">
								Reference (Required)
							</p>
							<div className="flex items-center justify-between">
								<p className="font-mono text-lg font-semibold text-orange-400">
									{reference}
								</p>
								<button
									onClick={() => copyToClipboard(reference)}
									className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
								>
									Copy
								</button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Please enter your reference ID accurately in the
								"Reference field". Otherwise, your deposit will
								be delayed.
							</p>
						</div>
					</div>

					{/* Instructions */}
					<div className="mb-6 space-y-3 text-sm text-gray-400">
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>
								Please transfer the exact amount to complete
								your transaction.
							</p>
						</div>
						<div className="flex items-start space-x-2">
							<div className="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
							<p>
								Include the reference number to ensure proper
								processing.
							</p>
						</div>
					</div>

					{/* Submit Button */}
					<button
						onClick={onConfirm}
						className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
					>
						I've Completed the Transfer
					</button>
				</div>
			</div>
		</div>
	);
}
