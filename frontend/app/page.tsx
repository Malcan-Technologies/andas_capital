"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import {
	MdArrowForward,
	MdCheck,
	MdSecurity,
	MdSpeed,
	MdLocationOn,
	MdBusinessCenter,
	MdCreditCard,
	MdVerifiedUser,
	MdPeople,
	MdStar,
	MdPlayArrow,
	MdTrendingUp,
	MdAccountBalance,
	MdAssessment,
} from "react-icons/md";

export default function Home() {
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-offwhite text-gray-700 font-body w-full">
			<Navbar bgStyle="bg-transparent" />

			{/* Hero Section */}
			<section className="min-h-screen relative flex items-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 w-full">
				{/* Gradient background elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute w-[500px] h-[500px] bg-purple-primary/10 rounded-full blur-3xl -top-32 -left-32"></div>
					<div className="absolute w-[700px] h-[700px] bg-purple-primary/5 rounded-full blur-3xl top-1/2 left-1/2"></div>
					<div className="absolute w-[400px] h-[400px] bg-purple-primary/8 rounded-full blur-3xl -bottom-32 -right-32"></div>
				</div>

				{/* Content */}
				<div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-32">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="text-center lg:text-left">
							<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold tracking-tight text-white mb-6 leading-tight">
								Modern Credit for Malaysia
								<br />
							</h1>
							<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 lg:mb-12 font-body leading-relaxed">
								Fast, transparent, and responsible lending
								solutions designed for Malaysian businesses and
								individuals.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<Link
									href="/signup"
									className="bg-purple-primary text-white hover:bg-purple-700 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
								>
									Get Started
									<MdArrowForward
										size={20}
										className="ml-2"
									/>
								</Link>
								<Link
									href="/about"
									className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
								>
									<MdPlayArrow size={20} className="mr-2" />
									Learn About Us
								</Link>
							</div>
						</div>

						{/* Hero Image */}
						<div className="relative h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
							<Image
								src="/speed.svg"
								alt="Modern Digital Banking"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Stats Section */}
			<section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Mission Statement */}
					<div className="text-center mb-8 lg:mb-12">
						<div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-purple-primary/10 rounded-full mb-6 sm:mb-8 border border-purple-primary/20">
							<span className="text-xs sm:text-sm font-semibold text-purple-primary">
								Our Mission
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 leading-tight px-4">
							We're Building the
							<br />
							<span className="text-purple-primary">
								Future of Finance
							</span>
							<br />
							in Malaysia
						</h2>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body leading-relaxed px-4 max-w-none lg:max-w-5xl">
							At Kapital, we believe every Malaysian business
							deserves access to fast, transparent, and
							responsible financing. We're not just another lender
							— we're your partners in growth, using technology to
							make credit accessible, affordable, and fair.
						</p>
					</div>

					{/* Stats Card */}
					<div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-100 relative overflow-hidden mx-2 sm:mx-4 lg:mx-0">
						{/* Background Pattern */}
						<div className="absolute inset-0 opacity-5">
							<div className="absolute w-40 h-40 bg-purple-primary rounded-full blur-3xl -top-10 -right-10"></div>
							<div className="absolute w-32 h-32 bg-blue-tertiary rounded-full blur-2xl -bottom-8 -left-8"></div>
						</div>

						<div className="relative">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
								{/* Total Amount Loaned */}
								<div className="text-center group">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-primary/20 transition-colors">
										<MdTrendingUp
											size={24}
											className="text-purple-primary sm:w-7 sm:h-7"
										/>
									</div>
									<div className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-purple-primary mb-1">
										RM 250M+
									</div>
									<div className="text-sm sm:text-base text-gray-700 font-semibold">
										Total Loans Disbursed
									</div>
								</div>

								{/* Number of Customers */}
								<div className="text-center group">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-tertiary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-tertiary/20 transition-colors">
										<MdPeople
											size={24}
											className="text-blue-tertiary sm:w-7 sm:h-7"
										/>
									</div>
									<div className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-blue-tertiary mb-1">
										15,000+
									</div>
									<div className="text-sm sm:text-base text-gray-700 font-semibold">
										Trusted Customers
									</div>
								</div>

								{/* Investments Collected */}
								<div className="text-center group">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-primary/20 transition-colors">
										<MdAccountBalance
											size={24}
											className="text-purple-primary sm:w-7 sm:h-7"
										/>
									</div>
									<div className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-purple-primary mb-1">
										RM 50M+
									</div>
									<div className="text-sm sm:text-base text-gray-700 font-semibold">
										Investments Collected
									</div>
								</div>

								{/* Success Rate */}
								<div className="text-center group">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-tertiary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-tertiary/20 transition-colors">
										<MdVerifiedUser
											size={24}
											className="text-blue-tertiary sm:w-7 sm:h-7"
										/>
									</div>
									<div className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-blue-tertiary mb-1">
										98.5%
									</div>
									<div className="text-sm sm:text-base text-gray-700 font-semibold">
										Success Rate
									</div>
								</div>
							</div>

							{/* Additional Info Bar */}
							<div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
									<div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
										<MdSecurity
											size={18}
											className="text-purple-primary"
										/>
										<span className="text-sm text-gray-600">
											Bank-Grade Security
										</span>
									</div>
									<div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
										<MdSpeed
											size={18}
											className="text-blue-tertiary"
										/>
										<span className="text-sm text-gray-600">
											24-48 Hour Approval
										</span>
									</div>
									<div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
										<MdLocationOn
											size={18}
											className="text-purple-primary"
										/>
										<span className="text-sm text-gray-600">
											Licensed in Malaysia
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Technology Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50/50 w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
						{/* Content */}
						<div className="order-2 lg:order-1">
							<div className="inline-flex items-center px-4 py-2 bg-blue-tertiary/10 rounded-full mb-4 sm:mb-6 border border-blue-tertiary/20">
								<span className="text-xs sm:text-sm font-semibold text-blue-tertiary">
									A.I. Powered Credit
								</span>
							</div>
							<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-gray-700 leading-tight">
								Digital First
								<br />
								<span className="text-purple-primary">
									Experience
								</span>
							</h2>
							<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mb-8 lg:mb-12 font-body leading-relaxed">
								Experience the future of finance with our
								AI-powered platform. From instant credit
								decisions to real-time dashboard insights,
								everything is designed for speed and
								transparency.
							</p>

							{/* Feature List */}
							<div className="space-y-4 lg:space-y-6 mb-8 lg:mb-12">
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0 w-6 h-6 bg-purple-primary/10 rounded-full flex items-center justify-center mt-1">
										<MdCheck
											size={16}
											className="text-purple-primary"
										/>
									</div>
									<div>
										<h4 className="text-lg lg:text-xl font-heading font-semibold text-gray-700 mb-1">
											AI-Powered Credit Decisions
										</h4>
										<p className="text-base lg:text-lg text-gray-500 font-body">
											Get instant loan approvals with our
											advanced machine learning algorithms
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0 w-6 h-6 bg-blue-tertiary/10 rounded-full flex items-center justify-center mt-1">
										<MdCheck
											size={16}
											className="text-blue-tertiary"
										/>
									</div>
									<div>
										<h4 className="text-lg lg:text-xl font-heading font-semibold text-gray-700 mb-1">
											Real-Time Dashboard
										</h4>
										<p className="text-base lg:text-lg text-gray-500 font-body">
											Track your loans, payments, and
											financial health in one unified
											platform
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-4">
									<div className="flex-shrink-0 w-6 h-6 bg-purple-primary/10 rounded-full flex items-center justify-center mt-1">
										<MdCheck
											size={16}
											className="text-purple-primary"
										/>
									</div>
									<div>
										<h4 className="text-lg lg:text-xl font-heading font-semibold text-gray-700 mb-1">
											100% Digital Process
										</h4>
										<p className="text-base lg:text-lg text-gray-500 font-body">
											From application to disbursement,
											everything happens online in hours
										</p>
									</div>
								</div>
							</div>

							{/* <div className="flex flex-col sm:flex-row gap-4">
								<Link
									href="/dashboard"
									className="bg-purple-primary text-white hover:bg-purple-700 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
								>
									Try Dashboard
									<MdArrowForward
										size={20}
										className="ml-2"
									/>
								</Link>
								<Link
									href="/about"
									className="bg-blue-tertiary/10 text-blue-tertiary hover:bg-blue-tertiary/20 border border-blue-tertiary/20 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
								>
									<MdAssessment size={20} className="mr-2" />
									Learn More
								</Link>
							</div> */}
						</div>

						{/* Large Hero Image */}
						<div className="order-1 lg:order-2 relative">
							<div className="relative h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
								{/* Large image - full view */}
								<div className="absolute inset-0">
									<Image
										src="/dashboard-mockup.svg"
										alt="Dashboard Mockup"
										fill
										className="object-contain"
										priority
									/>
								</div>
							</div>

							{/* Subtle floating elements */}
							<div className="absolute -top-4 -right-4 w-16 h-16 bg-purple-primary/10 rounded-full blur-xl"></div>
							<div className="absolute -bottom-4 -left-4 w-20 h-20 bg-blue-tertiary/10 rounded-full blur-xl"></div>
						</div>
					</div>
				</div>
			</section>

			{/* Products Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Financial Solutions Card */}
					<div className="bg-white rounded-xl lg:rounded-2xl p-8 sm:p-10 lg:p-12 xl:p-16 relative overflow-hidden mx-2 sm:mx-4 lg:mx-0 border border-gray-200 shadow-lg">
						{/* Subtle background elements */}
						<div className="absolute inset-0 overflow-hidden">
							<div className="absolute w-[500px] h-[500px] bg-purple-primary/3 rounded-full blur-3xl -top-32 -left-32"></div>
							<div className="absolute w-[700px] h-[700px] bg-blue-tertiary/3 rounded-full blur-3xl top-1/2 left-1/2"></div>
							<div className="absolute w-[400px] h-[400px] bg-purple-primary/3 rounded-full blur-3xl -bottom-32 -right-32"></div>
						</div>

						<div className="relative">
							<div className="text-center mb-8 lg:mb-12">
								<div className="inline-flex items-center px-4 py-2 bg-purple-primary/10 rounded-full mb-4 sm:mb-6 border border-purple-primary/20">
									<span className="text-xs sm:text-sm font-semibold text-purple-primary">
										Our Solutions
									</span>
								</div>
								<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
									Our Solutions
								</h2>
								<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-5xl">
									Three core solutions for your financial
									needs
								</p>
							</div>

							{/* Three Main Cards - Interesting Layout */}
							<div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-6 lg:gap-8">
								{/* Loans Card - Tall Featured (Left Column, Full Height) */}
								<div className="lg:row-span-2">
									<div className="bg-blue-50 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-blue-200 h-full">
										<div className="flex flex-col h-full">
											<div className="relative h-16 w-16 lg:h-20 lg:w-20 mb-4 lg:mb-6 mx-auto lg:mx-0">
												<Image
													src="/business-loan.svg"
													alt="Loans"
													fill
													className="object-contain"
												/>
											</div>
											<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 lg:mb-4 text-center lg:text-left text-gray-700">
												Loans
											</h3>
											<p className="text-lg lg:text-xl text-gray-500 mb-4 lg:mb-6 text-center lg:text-left font-body">
												Fast, transparent borrowing
												solutions for businesses and
												individuals
											</p>
											<div className="flex flex-wrap gap-2 lg:gap-3 mb-6 lg:mb-8 justify-center lg:justify-start">
												<span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													Up to RM 500K
												</span>
												<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													24-48 hours
												</span>
												<span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													No collateral
												</span>
											</div>
											<div className="mt-auto">
												<Link
													href="/sme-term-loan"
													className="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center justify-center lg:justify-start text-sm lg:text-base"
												>
													Apply for Loan
													<MdArrowForward
														size={16}
														className="ml-1"
													/>
												</Link>
											</div>
										</div>
									</div>
								</div>

								{/* Investments Card - Top Right */}
								<div className="lg:col-span-2">
									<div className="bg-green-50 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-green-200 h-full">
										<div className="flex flex-col h-full">
											<div className="relative h-14 w-14 lg:h-16 lg:w-16 mb-4 lg:mb-6">
												<Image
													src="/investing.svg"
													alt="Investments"
													fill
													className="object-contain"
												/>
											</div>
											<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 lg:mb-4 text-gray-700">
												Investments
											</h3>
											<p className="text-lg lg:text-xl text-gray-500 mb-4 lg:mb-6 font-body">
												Private credit opportunities
												with competitive returns for
												investors
											</p>
											<div className="flex flex-wrap gap-2 lg:gap-3 mb-4 lg:mb-6">
												<span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													8-12% Returns
												</span>
												<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													Secured
												</span>
											</div>
											<div className="mt-auto">
												<Link
													href="/products"
													className="text-green-700 hover:text-green-800 font-semibold inline-flex items-center text-sm lg:text-base"
												>
													Start Investing
													<MdArrowForward
														size={16}
														className="ml-1"
													/>
												</Link>
											</div>
										</div>
									</div>
								</div>

								{/* Analytics Card - Bottom Right */}
								<div className="lg:col-span-2">
									<div className="bg-purple-50 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-purple-200 h-full">
										<div className="flex flex-col h-full">
											<div className="relative h-14 w-14 lg:h-16 lg:w-16 mb-4 lg:mb-6">
												<Image
													src="/reports.svg"
													alt="Analytics"
													fill
													className="object-contain"
												/>
											</div>
											<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 lg:mb-4 text-gray-700">
												Analytics
											</h3>
											<p className="text-lg lg:text-xl text-gray-500 mb-4 lg:mb-6 font-body">
												Comprehensive credit reports and
												business verification services
											</p>
											<div className="flex flex-wrap gap-2 lg:gap-3 mb-4 lg:mb-6">
												<span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													Credit Reports
												</span>
												<span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													SSM Reports
												</span>
												<span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs lg:text-sm font-medium">
													CTOS Data
												</span>
											</div>
											<div className="mt-auto">
												<Link
													href="/credit-score+"
													className="text-purple-700 hover:text-purple-800 font-semibold inline-flex items-center text-sm lg:text-base"
												>
													Get Report
													<MdArrowForward
														size={16}
														className="ml-1"
													/>
												</Link>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Trust Us Section - Masonry Layout */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50/20 w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					<div className="text-center mb-8 lg:mb-12">
						<div className="inline-flex items-center px-4 py-2 bg-blue-tertiary/10 rounded-full mb-4 sm:mb-6 border border-blue-tertiary/20">
							<span className="text-xs sm:text-sm font-semibold text-blue-tertiary">
								Why Choose Us
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
							The{" "}
							<span className="text-purple-primary">
								kredit.my
							</span>{" "}
							Difference
						</h2>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-5xl">
							Every feature designed with transparency, speed, and
							security in mind
						</p>
					</div>

					{/* Masonry-style Trust Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mx-2 sm:mx-4 lg:mx-0">
						{/* Large Card - Transparent Lending */}
						<div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-purple-primary to-purple-700 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
							<div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
							<div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
							<div className="relative">
								<div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
									<MdVerifiedUser
										size={32}
										className="text-white"
									/>
								</div>
								<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-4">
									100% Transparent Lending
								</h3>
								<p className="text-lg lg:text-xl text-white/90 mb-6 font-body leading-relaxed">
									No hidden fees, no surprises. Every rate,
									term, and condition is clearly explained
									upfront.
								</p>
								<div className="space-y-3">
									<div className="flex items-center space-x-3">
										<MdCheck
											size={20}
											className="text-white"
										/>
										<span className="text-white/90">
											Clear interest rates
										</span>
									</div>
									<div className="flex items-center space-x-3">
										<MdCheck
											size={20}
											className="text-white"
										/>
										<span className="text-white/90">
											No processing fees
										</span>
									</div>
									<div className="flex items-center space-x-3">
										<MdCheck
											size={20}
											className="text-white"
										/>
										<span className="text-white/90">
											Upfront terms
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Medium Card - Fast Approval */}
						<div className="lg:col-span-1 bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-blue-tertiary/10">
							<div className="w-14 h-14 bg-blue-tertiary/10 rounded-xl flex items-center justify-center mb-4">
								<MdSpeed
									size={28}
									className="text-blue-tertiary"
								/>
							</div>
							<h3 className="text-xl font-heading font-bold mb-3 text-gray-700">
								Lightning Fast
							</h3>
							<p className="text-gray-500 font-body mb-4">
								Get approved in hours, not days
							</p>
							<div className="bg-blue-tertiary/5 rounded-lg p-3">
								<span className="text-2xl font-bold text-blue-tertiary">
									24-48h
								</span>
								<p className="text-xs text-gray-500">
									Average approval time
								</p>
							</div>
						</div>

						{/* Small Card - Licensed */}
						<div className="lg:col-span-1 bg-white rounded-xl lg:rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-green-100">
							<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
								<MdSecurity
									size={24}
									className="text-green-600"
								/>
							</div>
							<h3 className="text-lg font-heading font-bold mb-2 text-gray-700">
								Licensed
							</h3>
							<p className="text-sm text-gray-500 font-body">
								Fully regulated fintech provider
							</p>
						</div>

						{/* Medium Card - AI Credit Decisions */}
						<div className="lg:col-span-2 bg-gradient-to-r from-blue-tertiary to-blue-600 rounded-xl lg:rounded-2xl p-6 lg:p-8 text-white">
							<div className="flex items-start justify-between mb-4">
								<div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
									<MdAccountBalance
										size={28}
										className="text-white"
									/>
								</div>
								<div className="text-right">
									<span className="text-2xl font-bold">
										A.I.
									</span>
									<p className="text-xs text-white/80">
										Powered
									</p>
								</div>
							</div>
							<h3 className="text-xl lg:text-2xl font-heading font-bold mb-3">
								Smart Credit Decisions
							</h3>
							<p className="text-white/90 font-body">
								Advanced algorithms ensure fair, fast, and
								accurate loan assessments
							</p>
						</div>

						{/* Small Card - Investment Platform */}
						<div className="lg:col-span-1 bg-white rounded-xl lg:rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-purple-100">
							<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
								<MdTrendingUp
									size={24}
									className="text-purple-600"
								/>
							</div>
							<h3 className="text-lg font-heading font-bold mb-2 text-gray-700">
								Trusted Investments
							</h3>
							<p className="text-sm text-gray-500 font-body">
								Secure investment opportunities
							</p>
						</div>

						{/* Small Card - Local Support */}
						<div className="lg:col-span-1 bg-white rounded-xl lg:rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-amber-100">
							<div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
								<MdPeople
									size={24}
									className="text-amber-600"
								/>
							</div>
							<h3 className="text-lg font-heading font-bold mb-2 text-gray-700">
								Local Team
							</h3>
							<p className="text-sm text-gray-500 font-body">
								Malaysian support that understands you
							</p>
						</div>

						{/* Medium Card - Customer Reviews */}
						<div className="lg:col-span-2 bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm">
							<div className="flex items-center gap-2 mb-4">
								{[...Array(5)].map((_, i) => (
									<MdStar
										key={i}
										size={16}
										className="text-yellow-400"
									/>
								))}
								<span className="text-sm text-gray-500 ml-2">
									4.8/5 from 1,200+ reviews
								</span>
							</div>
							<p className="text-lg text-gray-700 mb-4 font-body">
								"Best lending experience I've had. Fast,
								transparent, and professional."
							</p>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-purple-primary/20 flex items-center justify-center">
									<span className="text-purple-primary font-bold">
										R
									</span>
								</div>
								<div>
									<p className="font-semibold text-gray-700">
										Rahman K.
									</p>
									<p className="text-sm text-gray-500">
										Verified Customer
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					<div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-xl lg:rounded-2xl p-8 sm:p-10 lg:p-12 text-center relative overflow-hidden shadow-xl mx-2 sm:mx-4 lg:mx-0">
						<div className="absolute inset-0 bg-black/10"></div>
						<div className="relative">
							<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-white px-4">
								Ready to get started?
							</h2>
							<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 lg:mb-12 mx-auto font-body px-4 max-w-none lg:max-w-5xl">
								Join thousands of Malaysians who trust kredit.my
								for their financial needs
							</p>
							<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
								<Link
									href="/signup"
									className="bg-white text-purple-primary hover:bg-gray-100 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
								>
									Apply Now
									<MdArrowForward
										size={18}
										className="ml-2 lg:w-5 lg:h-5"
									/>
								</Link>
								<Link
									href="/contact"
									className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
								>
									Contact Us
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<Footer />
		</div>
	);
}
