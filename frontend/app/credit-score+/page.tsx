"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function CreditScorePlus() {
	useDocumentTitle("Credit Score+");

	const [selectedPlan, setSelectedPlan] = useState<
		"spark" | "stride" | "soar"
	>("stride");

	return (
		<main className="min-h-screen bg-white dark:bg-white">
			<Navbar />

			{/* Hero Section */}
			<section className="relative min-h-screen bg-gradient-to-br from-[#0A0612] via-[#1A1A0A] to-[#0A0612] dark:bg-gradient-to-br dark:from-[#0A0612] dark:via-[#1A1A0A] dark:to-[#0A0612] pt-16">
				{/* Gradient background elements */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Primary yellow orbs */}
					<div className="absolute w-[500px] h-[500px] bg-[#EAB308]/15 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
					<div className="absolute w-[700px] h-[700px] bg-[#EAB308]/8 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute w-[400px] h-[400px] bg-[#EAB308]/12 rounded-full blur-3xl -bottom-32 -right-32"></div>

					{/* Additional subtle yellow accents */}
					<div className="absolute w-[300px] h-[300px] bg-[#EAB308]/6 rounded-full blur-2xl top-20 right-1/4"></div>
					<div className="absolute w-[200px] h-[200px] bg-[#EAB308]/10 rounded-full blur-xl bottom-1/4 left-1/4"></div>

					{/* Gradient overlay for depth */}
					<div className="absolute inset-0 bg-gradient-to-t from-[#EAB308]/5 via-transparent to-transparent"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-[#EAB308]/3 via-transparent to-[#EAB308]/3"></div>
				</div>

				{/* Content */}
				<div className="relative min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
					<div className="h-full flex flex-col justify-center">
						<div className="flex flex-col lg:flex-row items-center gap-12">
							{/* Left Column */}
							<div className="flex-1 text-center lg:text-left">
								<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white dark:text-white">
									<span className="bg-gradient-to-r from-[#F7E16F] to-[#F5D742] bg-clip-text text-transparent">
										Credit Score+
									</span>
								</h1>
								<p className="text-2xl sm:text-3xl text-[#F7E16F] dark:text-[#F7E16F] mb-8">
									Build CTOS score through consistent
									micro-payments
								</p>

								<div className="flex gap-4 justify-center lg:justify-start mb-8">
									<Link
										href="/apply"
										className="bg-white text-[#0A0612] px-4 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-[#F7E16F] transition-all"
									>
										Apply Now
									</Link>
									<Link
										href="#how-it-works"
										className="border-2 border-white text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white/10 transition-colors flex items-center"
									>
										How It Works
										<svg
											className="ml-2 w-4 h-4 sm:w-5 sm:h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</Link>
								</div>

								<p className="text-2xl text-gray-300 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
									A credit-builder loan designed for
									Malaysians to improve their credit score
									through consistent payments.
								</p>

								{/* Benefits Grid */}
								<div className="grid grid-cols-2 gap-4 mb-8 lg:mb-0">
									<div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
										<h3 className="text-base lg:text-lg font-semibold text-white dark:text-white mb-2">
											Boost Credit Score
										</h3>
										<p className="text-sm lg:text-base text-gray-300 dark:text-gray-300">
											Build credit history with CTOS
										</p>
									</div>
									<div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
										<h3 className="text-base lg:text-lg font-semibold text-white dark:text-white mb-2">
											Financial Security
										</h3>
										<p className="text-sm lg:text-base text-gray-300 dark:text-gray-300">
											Get your savings back at the end
										</p>
									</div>
									<div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
										<h3 className="text-base lg:text-lg font-semibold text-white dark:text-white mb-2">
											Easy Process
										</h3>
										<p className="text-sm lg:text-base text-gray-300 dark:text-gray-300">
											Quick digital onboarding
										</p>
									</div>
									<div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
										<h3 className="text-base lg:text-lg font-semibold text-white dark:text-white mb-2">
											Flexible Plans
										</h3>
										<p className="text-sm lg:text-base text-gray-300 dark:text-gray-300">
											Choose your monthly payment
										</p>
									</div>
								</div>
							</div>

							{/* Right Column - Image */}
							<div className="flex-1 hidden lg:block">
								<Image
									src="/credit-score.svg"
									alt="Credit Score+"
									width={600}
									height={600}
									className="object-contain"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div id="how-it-works" className="mb-16 scroll-mt-20">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-black">
							How Credit Score+ Works
						</h2>
						<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
							Build your credit score with a simple and
							transparent process
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12">
						{/* Process Steps */}
						<div className="bg-gradient-to-br from-[#F7E16F]/10 to-[#F5D742]/10 rounded-3xl p-8">
							<div className="space-y-6">
								<div className="flex items-start gap-4 group cursor-pointer hover:bg-white rounded-xl p-4 transition-all">
									<div className="w-8 h-8 bg-[#F7E16F]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F7E16F] transition-all">
										<span className="text-[#0A0612] font-semibold group-hover:text-white">
											1
										</span>
									</div>
									<div>
										<h4 className="text-lg font-semibold mb-1 text-black dark:text-black">
											Sign Up
										</h4>
										<p className="text-gray-600">
											Quick digital onboarding, no heavy
											paperwork.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4 group cursor-pointer hover:bg-white rounded-xl p-4 transition-all">
									<div className="w-8 h-8 bg-[#F7E16F]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F7E16F] transition-all">
										<span className="text-[#0A0612] font-semibold group-hover:text-white">
											2
										</span>
									</div>
									<div>
										<h4 className="text-lg font-semibold mb-1 text-black dark:text-black">
											Choose a Plan
										</h4>
										<p className="text-gray-600">
											Pick a credit builder plan that
											suits your needs.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4 group cursor-pointer hover:bg-white rounded-xl p-4 transition-all">
									<div className="w-8 h-8 bg-[#F7E16F]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F7E16F] transition-all">
										<span className="text-[#0A0612] font-semibold group-hover:text-white">
											3
										</span>
									</div>
									<div>
										<h4 className="text-lg font-semibold mb-1 text-black dark:text-black">
											Make Monthly Payments
										</h4>
										<p className="text-gray-600">
											Pay on time; we report each payment
											to CTOS.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4 group cursor-pointer hover:bg-white rounded-xl p-4 transition-all">
									<div className="w-8 h-8 bg-[#F7E16F]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#F7E16F] transition-all">
										<span className="text-[#0A0612] font-semibold group-hover:text-white">
											4
										</span>
									</div>
									<div>
										<h4 className="text-lg font-semibold mb-1 text-black dark:text-black">
											Build Credit & Save
										</h4>
										<p className="text-gray-600">
											After the term ends, you get your
											saved principal back.
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Image Section */}
						<div className="relative rounded-3xl overflow-hidden h-[500px]">
							<Image
								src="/credit-building.svg"
								alt="Credit Score+ Process"
								fill
								className="object-contain"
								sizes="(max-width: 768px) 100vw, 50vw"
							/>
						</div>
					</div>
				</div>

				{/* Features Section */}
				<div className="mt-24 mb-24">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-black">
							Features
						</h2>
						<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
							Everything you need to build your credit score
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all flex items-center gap-8">
							<div className="w-24 h-24 flex-shrink-0">
								<Image
									src="/calendar-dollar.svg"
									alt="Automate payments"
									width={96}
									height={96}
									className="object-contain"
								/>
							</div>
							<div>
								<h4 className="text-xl font-semibold mb-2 text-[#0A0612]">
									Automate payments
								</h4>
								<p className="text-gray-600">
									Autopay can help you stay on track without
									worrying about due dates.
								</p>
							</div>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all flex items-center gap-8">
							<div className="w-24 h-24 flex-shrink-0">
								<Image
									src="/graph-up.svg"
									alt="Track your credit score"
									width={96}
									height={96}
									className="object-contain"
								/>
							</div>
							<div>
								<h4 className="text-xl font-semibold mb-2 text-[#0A0612]">
									Track your credit score
								</h4>
								<p className="text-gray-600">
									Watch how your score changes over time – 30%
									discount on CTOS reports for all Credit
									Score+ subscribers
								</p>
							</div>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all flex items-center gap-8">
							<div className="w-24 h-24 flex-shrink-0">
								<Image
									src="/reports.svg"
									alt="Reports to CTOS"
									width={96}
									height={96}
									className="object-contain"
								/>
							</div>
							<div>
								<h4 className="text-xl font-semibold mb-2 text-[#0A0612]">
									Reports to CTOS
								</h4>
								<p className="text-gray-600">
									Every payment is reported to CTOS to help
									build your credit history.
								</p>
							</div>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all flex items-center gap-8">
							<div className="w-24 h-24 flex-shrink-0">
								<Image
									src="/cancel.svg"
									alt="Cancel anytime"
									width={96}
									height={96}
									className="object-contain"
								/>
							</div>
							<div>
								<h4 className="text-xl font-semibold mb-2 text-[#0A0612]">
									Cancel anytime
								</h4>
								<p className="text-gray-600">
									We know making payments isn&apos;t always
									easy. That&apos;s why you can cancel at any
									time and get your savings progress back,
									minus interest and fees.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Additional Benefits Section */}
				<div className="mt-24">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-black">
							Additional Benefits
						</h2>
						<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
							Exclusive perks for Credit Score+ customers
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
							<div className="w-16 h-16 bg-[#F7E16F]/20 rounded-full flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-[#0A0612]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h4 className="text-xl font-semibold mb-3 text-black">
								Save on Kapital Loans
							</h4>
							<p className="text-gray-600">
								50% discount on origination fees for loans from
								Kapital
							</p>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
							<div className="w-16 h-16 bg-[#F7E16F]/20 rounded-full flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-[#0A0612]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							</div>
							<h4 className="text-xl font-semibold mb-3 text-black">
								CTOS Discount
							</h4>
							<p className="text-gray-600">
								30% discount on CTOS report purchasing
							</p>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
							<div className="w-16 h-16 bg-[#F7E16F]/20 rounded-full flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-[#0A0612]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<h4 className="text-xl font-semibold mb-3 text-black">
								Early Access
							</h4>
							<p className="text-gray-600">
								Withdraw up to 30% after 6 months of consistent
								payments
							</p>
						</div>

						{/* <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
							<div className="w-16 h-16 bg-[#F7E16F]/20 rounded-full flex items-center justify-center mb-6">
								<svg
									className="w-8 h-8 text-[#0A0612]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							</div>
							<h4 className="text-xl font-semibold mb-3 text-black">
								Future Benefits
							</h4>
							<p className="text-gray-600">
								Credit card backed by loan payments
							</p>
						</div> */}
					</div>
				</div>

				{/* Plans Section */}
				<div className="mt-24 relative overflow-hidden">
					{/* Background wrapper */}
					<div className="absolute inset-0 bg-gradient-to-br from-[#F7E16F]/10 via-[#F5D742]/5 to-transparent -skew-y-3 transform origin-top-left h-[120%] -z-10"></div>
					<div className="absolute inset-0 bg-gradient-to-tr from-[#F7E16F]/5 via-[#F5D742]/10 to-transparent skew-y-3 transform origin-bottom-right h-[120%] -z-10"></div>

					<div className="relative py-24">
						<div className="text-center mb-16">
							<span className="inline-block px-4 py-1 bg-[#F7E16F]/20 rounded-full text-sm font-medium text-[#0A0612] mb-4">
								Pricing Plans
							</span>
							<h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-black">
								Choose Your Plan
							</h2>
							<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
								Flexible credit building - larger payments build
								credit score faster
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
							{/* Bronze Plan */}
							<div
								className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer relative flex flex-col ${
									selectedPlan === "spark"
										? "ring-2 ring-[#F7E16F] transform scale-[1.02]"
										: "hover:scale-105"
								}`}
								onClick={() => setSelectedPlan("spark")}
							>
								<div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0">
									<div className="bg-[#F7E16F] text-[#0A0612] px-4 py-1 rounded-full text-sm font-semibold">
										Basic
									</div>
								</div>
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4 text-black">
										Spark
									</h3>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-4xl font-bold text-[#0A0612]">
											RM 28
										</span>
										<span className="text-gray-500">
											/month
										</span>
									</div>
								</div>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											12-month commitment
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Get back RM 300
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Monthly CTOS reporting
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Basic credit monitoring
										</span>
									</div>
								</div>

								<div className="mt-auto pt-8">
									<div className="text-center pt-4 border-t border-gray-100">
										<div className="text-sm text-gray-500 mb-4">
											Only RM 3.00 monthly fee
										</div>
										<button
											className={`w-full py-3 rounded-xl font-semibold transition-all ${
												selectedPlan === "spark"
													? "bg-[#F7E16F] text-[#0A0612]"
													: "bg-gray-100 text-gray-600 hover:bg-gray-200"
											}`}
										>
											{selectedPlan === "spark"
												? "Selected"
												: "Select Plan"}
										</button>
									</div>
								</div>
							</div>

							{/* Silver Plan */}
							<div
								className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer relative flex flex-col transform ${
									selectedPlan === "stride"
										? "ring-2 ring-[#F7E16F] scale-105"
										: "hover:scale-105"
								}`}
								onClick={() => setSelectedPlan("stride")}
							>
								<div className="absolute -top-4 left-0 right-0 flex justify-center">
									<div className="bg-[#F7E16F] text-[#0A0612] px-4 py-1 rounded-full text-sm font-semibold">
										Recommended
									</div>
								</div>
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4 text-black">
										Stride
									</h3>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-4xl font-bold text-[#0A0612]">
											RM 84
										</span>
										<span className="text-gray-500">
											/month
										</span>
									</div>
								</div>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											12-month commitment
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Get back RM 900
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Monthly CTOS reporting
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Advanced credit monitoring
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											30% CTOS report discount
										</span>
									</div>
								</div>

								<div className="mt-auto pt-8">
									<div className="text-center pt-4 border-t border-gray-100">
										<div className="text-sm text-gray-500 mb-4">
											Only RM 9.00 monthly fee
										</div>
										<button
											className={`w-full py-3 rounded-xl font-semibold transition-all ${
												selectedPlan === "stride"
													? "bg-[#F7E16F] text-[#0A0612]"
													: "bg-gray-100 text-gray-600 hover:bg-gray-200"
											}`}
										>
											{selectedPlan === "stride"
												? "Selected"
												: "Select Plan"}
										</button>
									</div>
								</div>
							</div>

							{/* Gold Plan */}
							<div
								className={`bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer relative flex flex-col ${
									selectedPlan === "soar"
										? "ring-2 ring-[#F7E16F] transform scale-[1.02]"
										: "hover:scale-105"
								}`}
								onClick={() => setSelectedPlan("soar")}
							>
								<div className="absolute -top-4 left-0 right-0 flex justify-center opacity-0">
									<div className="bg-[#F7E16F] text-[#0A0612] px-4 py-1 rounded-full text-sm font-semibold">
										Premium
									</div>
								</div>
								<div className="text-center mb-8">
									<h3 className="text-2xl font-bold mb-4 text-black">
										Soar
									</h3>
									<div className="flex items-baseline justify-center gap-1">
										<span className="text-4xl font-bold text-[#0A0612]">
											RM 140
										</span>
										<span className="text-gray-500">
											/month
										</span>
									</div>
								</div>

								<div className="space-y-4 mb-8">
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											12-month commitment
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Get back RM 1,680
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Monthly CTOS reporting
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Premium credit monitoring
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											30% CTOS report discount
										</span>
									</div>
									<div className="flex items-center gap-2">
										<svg
											className="w-5 h-5 text-[#F7E16F]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										<span className="text-gray-600">
											Priority customer support
										</span>
									</div>
								</div>

								<div className="mt-auto pt-8">
									<div className="text-center pt-4 border-t border-gray-100">
										<div className="text-sm text-gray-500 mb-4">
											Only RM 15.00 monthly fee
										</div>
										<button
											className={`w-full py-3 rounded-xl font-semibold transition-all ${
												selectedPlan === "soar"
													? "bg-[#F7E16F] text-[#0A0612]"
													: "bg-gray-100 text-gray-600 hover:bg-gray-200"
											}`}
										>
											{selectedPlan === "soar"
												? "Selected"
												: "Select Plan"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-16 text-center">
						<Link
							href="/apply"
							className="inline-block bg-gradient-to-r from-[#F7E16F] to-[#F5D742] text-[#0A0612] px-12 py-4 rounded-full text-lg font-semibold hover:from-[#F5D742] hover:to-[#F7E16F] transition-all shadow-lg hover:shadow-xl"
						>
							Get Started Now
						</Link>
						<p className="mt-4 text-gray-500 text-sm">
							No credit card required • Cancel anytime
						</p>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mt-24">
					<div className="text-center mb-12">
						<h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-black">
							Frequently Asked Questions
						</h2>
						<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-600 max-w-3xl mx-auto">
							Everything you need to know about Credit Score+
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								How does Credit Score+ work?
							</h4>
							<p className="text-gray-600">
								Credit Score+ is a credit-builder loan where
								your monthly payments are reported to CTOS. The
								amount you pay is held in a savings account and
								returned to you when the loan term ends.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								Is Credit Score+ a loan?
							</h4>
							<p className="text-gray-600">
								Yes, Credit Score+ is classified as a loan. This
								enables Kapital to report your monthly payments
								to CTOS to build your credit score.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								When do I get my money back?
							</h4>
							<p className="text-gray-600">
								You&apos;ll receive your full principal amount
								minus interest back at the end of the 12-month
								term. You may also be eligible to withdraw up to
								30% after 6 months of consistent payments.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								How quickly will my credit score improve?
							</h4>
							<p className="text-gray-600">
								Credit score improvements vary by individual,
								but most users see positive changes within 3-6
								months of consistent payments. Larger monthly
								payments typically lead to faster improvements.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								What happens if I miss a payment?
							</h4>
							<p className="text-gray-600">
								Missing payments will be reported to CTOS and
								may negatively impact your credit score. We
								recommend setting up automatic payments to avoid
								this.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								How can I monitor my credit score improvements?
							</h4>
							<p className="text-gray-600">
								You can monitor your credit score improvements
								via CTOS reports. We offer a 30% discount on
								CTOS report purchases through our platform for
								all Credit Score+ users.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								What happens if I cancel my plan before the
								12-month term?
							</h4>
							<p className="text-gray-600">
								You can cancel your plan at any time. Your
								savings will be returned to you, minus interest
								up to the cancellation date. An
								early-cancellation fee of RM 50 may also be
								applicable.
							</p>
						</div>

						<div className="bg-[#F7E16F]/10 rounded-2xl p-8">
							<h4 className="text-xl font-semibold mb-4 text-[#0A0612]">
								Will early cancellation affect my credit score?
							</h4>
							<p className="text-gray-600">
								No, early cancellation will not negatively
								affect your credit score, but your credit score
								may not be built to its full potential.
							</p>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</main>
	);
}
