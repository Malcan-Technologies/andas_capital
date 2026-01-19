import Link from "next/link";
import { Shield } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
	return (
		<footer className="bg-white border-t border-gray-200">
			{/* Links Section */}
			<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
						{/* Quick Links */}
						<div className="text-left">
							<h3 className="text-lg font-semibold mb-6 font-heading text-slate-900">
								Quick Links
							</h3>
							<ul className="space-y-3">
								<li>
									<Link
										href="/about"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										About Us
									</Link>
								</li>
								<li>
									<Link
										href="/login"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Login
									</Link>
								</li>
								<li>
									<Link
										href="/signup"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Sign Up
									</Link>
								</li>
							</ul>
						</div>

						{/* Legal */}
						<div className="text-left">
							<h3 className="text-lg font-semibold mb-6 font-heading text-slate-900">
								Legal
							</h3>
							<ul className="space-y-3">
								<li>
									<Link
										href="/terms-of-service"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Terms of Service
									</Link>
								</li>
								<li>
									<Link
										href="/terms-of-use"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Terms of Use
									</Link>
								</li>
								<li>
									<Link
										href="/privacy-notice"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Privacy Notice
									</Link>
								</li>
								<li>
									<Link
										href="/pdpa-policy"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										PDPA Policy
									</Link>
								</li>
								<li>
									<Link
										href="/risk-disclosure"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Risk Disclosure
									</Link>
								</li>
								<li>
									<Link
										href="/privacy-policy"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Privacy Policy
									</Link>
								</li>
								<li>
									<Link
										href="/account-and-data-deletion"
										className="text-slate-600 hover:text-teal-400 transition-colors font-body"
									>
										Account & Data Deletion
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="mt-12 pt-8 border-t border-gray-200">
					<div className="max-w-4xl mx-auto">
						<div className="flex flex-col space-y-6">
							{/* Logo and SSL Badge */}
							<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
								<Logo size="lg" variant="white" linkTo="/" />

								<div className="inline-flex items-center gap-2 bg-teal-50 rounded-xl p-4 border border-teal-200 w-fit">
									<span className="text-teal-500 flex-shrink-0">
										<Shield size={20} />
									</span>
									<div className="text-sm">
										<p className="text-teal-600 font-medium font-body">
											SSL Secured
										</p>
										<p className="text-slate-500 text-xs font-body">
											256-bit encryption
										</p>
									</div>
								</div>
							</div>

							{/* Legal Text */}
							<div className="text-slate-600 space-y-4 font-body text-left">
								<p className="text-sm">
									Licensed under Moneylenders Act 1951, KPKT license no: WL3863/14/01-11/270926
								</p>
								<p className="text-sm">
									Company registration no: 200201007895 (575558-W)
								</p>
								<p className="text-sm">
									Business address: No. 41-11, The Boulevard Mid Valley, Lingkaran Syed Putra, 59200 Kuala Lumpur
								</p>
								<p className="text-sm font-semibold text-slate-700">
									Disclaimer: "Please borrow responsibly. Loans are subject to approval and terms."
								</p>
								<p className="text-sm pt-4 text-slate-500">
									© {new Date().getFullYear()} Andas Capital Sdn Bhd. All Rights Reserved.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
