import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface PaymentMethodModalProps {
	onClose: () => void;
	onFPXSelect?: () => void;
	onBankTransferSelect: () => void;
	amount?: string;
	title?: string;
}

export default function PaymentMethodModal({
	onClose,
	onFPXSelect,
	onBankTransferSelect,
	amount,
	title = "How would you like to deposit?",
}: PaymentMethodModalProps) {
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

					{amount && (
						<div className="mb-6 p-4 bg-blue-tertiary/5 rounded-xl border border-blue-tertiary/20">
							<p className="text-sm text-gray-500 font-body">
								Amount to Pay
							</p>
							<p className="text-xl font-semibold text-purple-primary font-heading">
								MYR {amount}
							</p>
						</div>
					)}

					<div className="space-y-4">
						{/* FPX Express Deposit */}
						{onFPXSelect && (
							<button
								onClick={onFPXSelect}
								className="w-full border border-gray-200 rounded-xl p-4 hover:border-purple-primary/50 hover:bg-purple-primary/5 transition-colors bg-white text-left shadow-sm"
							>
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center border border-green-200">
											<span className="text-green-700 font-bold text-sm">
												FPX
											</span>
										</div>
										<div>
											<h3 className="font-semibold text-gray-700 font-heading">
												FPX Express Deposit
											</h3>
											<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 font-body">
												Popular
											</span>
										</div>
									</div>
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</div>
								<div className="space-y-2 text-sm text-gray-500 font-body">
									<div className="flex justify-between">
										<span>Estimated Arrival</span>
										<span className="text-gray-700">
											Usually 5 Min
										</span>
									</div>
									<div className="flex justify-between">
										<span>Fees</span>
										<span className="text-gray-700">
											Free
										</span>
									</div>
									<div className="flex justify-between">
										<span>Currency</span>
										<span className="text-gray-700">
											MYR
										</span>
									</div>
									<div className="flex justify-between">
										<span>Supported Banks</span>
										<span className="text-gray-700">
											Most Malaysian Banks
										</span>
									</div>
								</div>
							</button>
						)}

						{/* Bank Transfer */}
						<button
							onClick={onBankTransferSelect}
							className="w-full border border-gray-200 rounded-xl p-4 hover:border-purple-primary/50 hover:bg-purple-primary/5 transition-colors text-left bg-white shadow-sm"
						>
							<div className="flex items-center justify-between mb-3">
								<h3 className="font-semibold text-gray-700 font-heading">
									Bank Transfer
								</h3>
								<svg
									className="w-5 h-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
							<div className="space-y-2 text-sm text-gray-500 font-body">
								<div className="flex justify-between">
									<span>Estimated Arrival</span>
									<span className="text-gray-700">
										Usually 1 Business Day
									</span>
								</div>
								<div className="flex justify-between">
									<span>Fees</span>
									<span className="text-gray-700">Free</span>
								</div>
								<div className="flex justify-between">
									<span>Currency</span>
									<span className="text-gray-700">MYR</span>
								</div>
								<div className="flex justify-between">
									<span>Supported Banks</span>
									<span className="text-gray-700">
										Most Malaysian Banks
									</span>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
