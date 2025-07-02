import {
	PlayIcon,
	VideoCameraIcon,
	SparklesIcon,
} from "@heroicons/react/24/outline";

interface AttestationMethodModalProps {
	onClose: () => void;
	onInstantSelect: () => void;
	onLiveCallSelect: () => void;
	applicationId: string;
}

export default function AttestationMethodModal({
	onClose,
	onInstantSelect,
	onLiveCallSelect,
	applicationId,
}: AttestationMethodModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-700 font-heading">
							Choose Attestation Method
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

					{/* Description */}
					<div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<p className="text-sm text-blue-800 font-body">
							To proceed with your loan, please complete the
							attestation process. Choose your preferred method
							below.
						</p>
					</div>

					<div className="space-y-4">
						{/* Instant Attestation - Highlighted */}
						<button
							onClick={onInstantSelect}
							className="w-full border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-5 hover:border-cyan-400 hover:from-cyan-100 hover:to-teal-100 transition-all text-left shadow-md hover:shadow-lg transform hover:scale-[1.02] relative"
						>
							{/* Popular Badge */}
							<div className="absolute -top-2 -right-2">
								<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm">
									<SparklesIcon className="h-3 w-3 mr-1" />
									Recommended
								</span>
							</div>

							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-sm">
										<PlayIcon className="h-6 w-6 text-white" />
									</div>
									<div>
										<h3 className="font-bold text-gray-800 font-heading text-lg">
											Instant Video Attestation
										</h3>
										<p className="text-sm text-cyan-700 font-medium font-body">
											Watch a short video and proceed
											immediately
										</p>
									</div>
								</div>
								<svg
									className="w-5 h-5 text-cyan-600"
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

							<div className="space-y-3 text-sm text-gray-600 font-body bg-white/60 rounded-lg p-3 border border-cyan-200/50">
								<div className="flex justify-between">
									<span>Duration</span>
									<span className="text-cyan-700 font-semibold">
										~3 minutes
									</span>
								</div>
								<div className="flex justify-between">
									<span>Availability</span>
									<span className="text-cyan-700 font-semibold">
										24/7 Instant
									</span>
								</div>
								<div className="flex justify-between">
									<span>Processing</span>
									<span className="text-cyan-700 font-semibold">
										Immediate
									</span>
								</div>
								<div className="flex justify-between">
									<span>Cost</span>
									<span className="text-cyan-700 font-semibold">
										Free
									</span>
								</div>
							</div>

							{/* Benefits */}
							<div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
								<div className="flex items-center space-x-2 mb-2">
									<div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
										<svg
											className="w-2 h-2 text-white"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<span className="text-sm font-semibold text-green-800 font-body">
										Fastest Option - Complete in Minutes!
									</span>
								</div>
								<ul className="text-xs text-green-700 space-y-1 ml-6 font-body">
									<li>• No scheduling required</li>
									<li>• Available anytime, anywhere</li>
									<li>• Proceed to next step immediately</li>
								</ul>
							</div>
						</button>

						{/* Live Video Call */}
						<button
							onClick={onLiveCallSelect}
							className="w-full border border-gray-200 rounded-xl p-4 hover:border-purple-primary/50 hover:bg-purple-primary/5 transition-colors text-left bg-white shadow-sm"
						>
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border border-purple-200">
										<VideoCameraIcon className="h-5 w-5 text-purple-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-700 font-heading">
											Live Video Call with Lawyer
										</h3>
										<p className="text-sm text-gray-500 font-body">
											Schedule a personal consultation
										</p>
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
									<span>Duration</span>
									<span className="text-gray-700">
										15-30 minutes
									</span>
								</div>
								<div className="flex justify-between">
									<span>Scheduling</span>
									<span className="text-gray-700">
										Business Hours
									</span>
								</div>
								<div className="flex justify-between">
									<span>Processing</span>
									<span className="text-gray-700">
										3 Business Days
									</span>
								</div>
								<div className="flex justify-between">
									<span>Cost</span>
									<span className="text-gray-700">Free</span>
								</div>
							</div>
							<div className="mt-3 text-xs text-gray-500 font-body">
								Good for questions or detailed explanations
							</div>
						</button>
					</div>

					{/* Note */}
					<div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
						<p className="text-xs text-amber-800 font-body">
							<span className="font-semibold">Note:</span> Both
							methods provide legally valid attestation. The
							instant video method is designed for convenience and
							faster processing.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
