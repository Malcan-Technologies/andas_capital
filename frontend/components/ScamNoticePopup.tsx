"use client";

import { useState, useEffect } from "react";
import {
	X,
	AlertTriangle,
	Ban,
	ShieldAlert,
	ShieldCheck,
	Search,
	Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScamNoticePopup() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setVisible(true), 600);
		return () => clearTimeout(timer);
	}, []);

	const handleClose = () => {
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
				onClick={handleClose}
			/>

			{/* Popup */}
			<div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 fade-in duration-300 overflow-hidden border border-gray-200">
				{/* Header */}
				<div className="bg-red-600 px-7 py-6 flex items-start justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
							<AlertTriangle size={22} className="text-white" />
						</div>
						<div>
							<h2 className="text-lg font-heading font-bold text-white">
								Scam Alert
							</h2>
							<p className="text-red-100 text-sm font-body mt-0.5">
								Protect yourself from fraud
							</p>
						</div>
					</div>
					<button
						onClick={handleClose}
						className="text-white/80 hover:text-white transition-colors rounded-lg p-1.5 hover:bg-white/10 flex-shrink-0"
					>
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className="px-7 py-7 space-y-5">
					{/* Impersonation warning */}
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
							<ShieldAlert size={20} className="text-red-600" />
						</div>
						<div>
							<p className="text-sm font-bold text-slate-900 font-heading mb-0.5">
								Beware of impersonators
							</p>
							<p className="text-sm text-slate-600 font-body leading-relaxed">
								Scammers may use our name or logo to deceive you. We only conduct business through our official website.
							</p>
						</div>
					</div>

					{/* Official website */}
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
							<Globe size={20} className="text-teal-600" />
						</div>
						<div>
							<p className="text-sm font-bold text-slate-900 font-heading mb-0.5">
								Our official website
							</p>
							<p className="text-sm text-slate-600 font-body leading-relaxed">
								We only do business on{" "}
								<a
									href="https://andas.com.my"
									className="text-teal-600 font-semibold hover:underline"
								>
									andas.com.my
								</a>
							</p>
						</div>
					</div>

					{/* No upfront payments */}
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
							<Ban size={20} className="text-amber-600" />
						</div>
						<div>
							<p className="text-sm font-bold text-slate-900 font-heading mb-0.5">
								No upfront payments
							</p>
							<p className="text-sm text-slate-600 font-body leading-relaxed">
								We will never ask you for upfront fees, deposits, or OTP codes via phone, SMS, or WhatsApp.
							</p>
						</div>
					</div>

					{/* Verify & Report */}
					<div className="flex items-start gap-4">
						<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
							<Search size={20} className="text-blue-700" />
						</div>
						<div>
							<p className="text-sm font-bold text-slate-900 font-heading mb-0.5">
								Verify suspicious contacts
							</p>
							<p className="text-sm text-slate-600 font-body leading-relaxed">
								Check suspicious phone numbers via PDRM Semak Mule at{" "}
								<a
									href="https://semakmule.rmp.gov.my"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-700 font-semibold hover:underline"
								>
									semakmule.rmp.gov.my
								</a>
							</p>
						</div>
					</div>

					{/* Licensed badge */}
					<div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-5 py-3.5">
						<ShieldCheck size={20} className="text-teal-600 flex-shrink-0" />
						<p className="text-xs text-teal-900 font-body leading-relaxed">
							Andas Capital is a licensed moneylender under the Moneylenders Act 1951 (KPKT License No: WL3863/14/01-11/270926)
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="px-7 pb-7">
					<Button
						onClick={handleClose}
						className="w-full bg-teal-400 hover:bg-teal-500 text-white font-semibold py-6 rounded-xl text-sm h-auto"
					>
						I Understand
					</Button>
				</div>
			</div>
		</div>
	);
}
