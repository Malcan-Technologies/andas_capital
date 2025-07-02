import {
	ExclamationTriangleIcon,
	ClockIcon,
	CalendarDaysIcon,
	PlayIcon,
} from "@heroicons/react/24/outline";

interface LiveCallConfirmationModalProps {
	onClose: () => void;
	onConfirm: () => void;
	onBackToInstant: () => void;
	applicationId: string;
}

export default function LiveCallConfirmationModal({
	onClose,
	onConfirm,
	onBackToInstant,
	applicationId,
}: LiveCallConfirmationModalProps) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
			<div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-700 font-heading">
							Confirm Live Video Call
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

					{/* Warning */}
					<div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
						<div className="flex items-start space-x-3">
							<ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
							<div>
								<h3 className="text-sm font-semibold text-amber-800 font-heading mb-1">
									Consider the Instant Option
								</h3>
								<p className="text-sm text-amber-700 font-body">
									Live video calls require scheduling and may
									delay your loan processing by 3-5 business
									days.
								</p>
							</div>
						</div>
					</div>

					{/* Comparison */}
					<div className="space-y-4 mb-6">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<h4 className="text-sm font-semibold text-red-800 font-heading mb-2">
								Live Video Call Drawbacks:
							</h4>
							<ul className="space-y-1 text-sm text-red-700 font-body">
								<li className="flex items-center space-x-2">
									<ClockIcon className="h-4 w-4 flex-shrink-0" />
									<span>3-5 business days delay</span>
								</li>
								<li className="flex items-center space-x-2">
									<CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
									<span>
										Requires scheduling coordination
									</span>
								</li>
								<li className="flex items-center space-x-2">
									<ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
									<span>Business hours only</span>
								</li>
							</ul>
						</div>

						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<h4 className="text-sm font-semibold text-green-800 font-heading mb-2">
								Instant Video Benefits:
							</h4>
							<ul className="space-y-1 text-sm text-green-700 font-body">
								<li className="flex items-center space-x-2">
									<PlayIcon className="h-4 w-4 flex-shrink-0" />
									<span>Complete in 3 minutes</span>
								</li>
								<li className="flex items-center space-x-2">
									<ClockIcon className="h-4 w-4 flex-shrink-0" />
									<span>Available 24/7</span>
								</li>
								<li className="flex items-center space-x-2">
									<CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
									<span>No scheduling required</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Buttons */}
					<div className="space-y-3">
						{/* Recommended: Go back to instant */}
						<button
							onClick={onBackToInstant}
							className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] font-heading"
						>
							✨ Use Instant Video Instead (Recommended)
						</button>

						{/* Confirm live call */}
						<button
							onClick={onConfirm}
							className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors font-heading"
						>
							I Still Want Live Video Call
						</button>

						{/* Cancel */}
						<button
							onClick={onClose}
							className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl transition-colors font-heading"
						>
							Cancel
						</button>
					</div>

					{/* Final note */}
					<div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
						<p className="text-xs text-blue-800 font-body">
							<span className="font-semibold">Note:</span> If you
							proceed with live video call, our legal team will
							contact you within 1-2 business days to schedule the
							appointment.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
