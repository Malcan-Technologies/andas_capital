"use client";

import Link from "next/link";
import Image from "next/image";
import { MdWhatsapp, MdPhone } from "react-icons/md";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function NotFound() {
	useDocumentTitle("Page Not Found");
	return (
		<div className="min-h-screen bg-offwhite">
			<main className="relative min-h-screen bg-offwhite overflow-hidden">
				{/* Decorative background elements */}
				<div className="absolute inset-0">
					<div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-primary/20 to-blue-tertiary/20 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
					<div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-blue-tertiary/20 to-purple-primary/20 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse delay-700"></div>
					<div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-primary/20 to-blue-tertiary/20 rounded-full blur-3xl -bottom-32 -right-32 animate-pulse delay-1000"></div>
				</div>

				{/* Content */}
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
					<div className="flex flex-col items-center text-center">
						{/* 404 Image */}
						<div className="relative w-64 h-64 md:w-96 md:h-96 mb-8">
							<Image
								src="/404.svg"
								alt="404 Illustration"
								fill
								className="object-contain"
								priority
							/>
						</div>

						{/* Error Message */}
						<h1 className="text-6xl md:text-8xl font-bold text-gray-700 mb-6 font-heading">
							Woof!{" "}
							<span className="text-purple-primary">404</span>
						</h1>

						<p className="text-2xl md:text-3xl text-gray-500 mb-8 max-w-2xl font-body leading-relaxed">
							Looks like our furry friend got a little too hungry
							and ate this page! 🐕
							<br />
							<span className="text-lg text-gray-500 mt-2 block">
								Don&apos;t worry, we&apos;ll help you find what
								you&apos;re looking for.
							</span>
						</p>

						{/* Contact Information */}
						{/* <div className="bg-white rounded-xl p-8 mb-8 max-w-md border border-gray-200 shadow-sm">
							<h2 className="text-xl font-semibold text-gray-700 mb-4 font-heading">
								Need immediate assistance?
							</h2>
							<p className="text-gray-500 mb-6 font-body">
								Our team is here to help! Reach out to us on
								WhatsApp or give us a call.
							</p>
							<div className="space-y-4">
								<a
									href="https://wa.me/60164614919?text=I'm%20interested%20in%20Kapital%20lending%20products"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all group font-body"
								>
									<MdWhatsapp size={24} />
									Chat on WhatsApp
								</a>
								<a
									href="tel:+60164614919"
									className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all font-body"
								>
									<MdPhone size={24} />
									+60 16-461 4919
								</a>
							</div>
						</div> */}

						{/* Navigation Links */}
						<div className="flex flex-wrap justify-center gap-4">
							<button
								onClick={() => window.history.back()}
								className="bg-purple-primary text-white px-8 py-4 rounded-xl hover:bg-purple-700 transition-colors font-body font-semibold"
							>
								Go Back
							</button>
							<Link
								href="/"
								className="bg-blue-tertiary text-white px-8 py-4 rounded-xl hover:bg-blue-600 transition-colors font-body font-semibold"
							>
								Back to Home
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
