"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import {
	MdArrowForward,
	MdCheck,
	MdPeople,
	MdTrendingUp,
	MdBusinessCenter,
	MdAccountBalance,
	MdStar,
	MdHandshake,
	MdSupport,
	MdVerifiedUser,
	MdCreditCard,
	MdAssessment,
} from "react-icons/md";

export default function Partners() {
	return (
		<div className="min-h-screen bg-offwhite text-gray-700 font-body w-full">
			<Navbar bgStyle="bg-transparent" />

			{/* Hero Section */}
			<section className="min-h-screen relative flex items-center bg-gradient-to-br from-[#0A0612] via-[#1A0B2E] to-[#0A0612] w-full">
				{/* Gradient background elements */}
				<div className="absolute inset-0 overflow-hidden">
					{/* Primary purple orbs */}
					<div className="absolute w-[500px] h-[500px] bg-[#7C3AED]/15 rounded-full blur-3xl -top-32 -left-32 animate-pulse"></div>
					<div className="absolute w-[700px] h-[700px] bg-[#7C3AED]/8 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
					<div className="absolute w-[400px] h-[400px] bg-[#7C3AED]/12 rounded-full blur-3xl -bottom-32 -right-32"></div>

					{/* Additional subtle purple accents */}
					<div className="absolute w-[300px] h-[300px] bg-[#7C3AED]/6 rounded-full blur-2xl top-20 right-1/4"></div>
					<div className="absolute w-[200px] h-[200px] bg-[#7C3AED]/10 rounded-full blur-xl bottom-1/4 left-1/4"></div>

					{/* Gradient overlay for depth */}
					<div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/5 via-transparent to-transparent"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/3 via-transparent to-[#7C3AED]/3"></div>
				</div>

				{/* Content */}
				<div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-32">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="text-center lg:text-left">
							<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold tracking-tight mb-6 leading-tight">
								<span className="text-white drop-shadow-2xl [text-shadow:_0_4px_12px_rgb(147_51_234_/_0.8)]">
									Become Our Partner
								</span>
							</h1>
							<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 lg:mb-12 font-body leading-relaxed drop-shadow-lg">
								Tap into Malaysia's growing private credit and alternative investments market with us.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<Link
									href="#apply"
									className="bg-purple-primary text-white hover:bg-purple-700 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
								>
									Apply Now
									<MdArrowForward size={20} className="ml-2" />
								</Link>
								<Link
									href="#benefits"
									className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
								>
									<MdHandshake size={20} className="mr-2" />
									Learn More
								</Link>
							</div>
						</div>

						{/* Hero Image */}
						<div className="relative h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
							<Image
								src="/partner.svg"
								alt="Business Partnership"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Partnership Benefits Section */}
			<section id="benefits" className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Section Header */}
					<div className="text-center mb-8 lg:mb-16">
						<div className="inline-flex items-center px-4 py-2 bg-purple-primary/10 rounded-full mb-4 sm:mb-6 border border-purple-primary/20">
							<span className="text-xs sm:text-sm font-semibold text-purple-primary">
								Partnership Benefits
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
							Why Partner
							<br />
							<span className="text-purple-primary">With Us?</span>
						</h2>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-4xl">
							Join a network of successful partners earning competitive commissions while helping Malaysians access modern financial solutions
						</p>
					</div>

					{/* Benefits Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mx-2 sm:mx-4 lg:mx-0">
						{/* High Commission */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mb-4">
								<MdTrendingUp size={28} className="text-purple-primary" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Attractive Commission
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Earn up to 10% profit share on all successful loan and investment products with consistent payouts
							</p>
						</div>

						{/* Comprehensive Support */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-blue-tertiary/10 rounded-xl flex items-center justify-center mb-4">
								<MdSupport size={28} className="text-blue-tertiary" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Full Support
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Complete training, marketing materials, and dedicated support team to help you succeed
							</p>
						</div>

						{/* Flexible Partnership */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-emerald-600/10 rounded-xl flex items-center justify-center mb-4">
								<MdHandshake size={28} className="text-emerald-600" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Flexible Terms
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Work on your own schedule with no minimum quotas or exclusive commitments required
							</p>
						</div>

						{/* Growing Market */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-blue-600/10 rounded-xl flex items-center justify-center mb-4">
								<MdBusinessCenter size={28} className="text-blue-600" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Growing Market
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Tap into Malaysia's expanding private credit market with innovative products and strong demand
							</p>
						</div>

						{/* Technology Platform */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mb-4">
								<MdAssessment size={28} className="text-purple-primary" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Advanced Tools
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Access our partner dashboard with real-time tracking, analytics, and commission reports
							</p>
						</div>

						{/* Trusted Brand */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="w-14 h-14 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
								<MdVerifiedUser size={28} className="text-yellow-500" />
							</div>
							<h3 className="text-2xl lg:text-3xl font-heading font-bold mb-3 text-gray-700">
								Trusted Brand
							</h3>
							<p className="text-lg lg:text-xl text-gray-500 font-body">
								Represent a KPKT licensed platform with strong regulatory compliance and customer trust
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Partnership Models Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50/20 w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Section Header */}
					<div className="text-center mb-8 lg:mb-16">
						<div className="inline-flex items-center px-4 py-2 bg-blue-tertiary/10 rounded-full mb-4 sm:mb-6 border border-blue-tertiary/20">
							<span className="text-xs sm:text-sm font-semibold text-blue-tertiary">
								Partnership Models
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
							Two Ways to
							<br />
							<span className="text-purple-primary">Partner With Us</span>
						</h2>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-4xl">
							Choose the partnership model that best fits your business goals and expertise
						</p>
					</div>

					{/* Partnership Cards */}
					<div className="space-y-8 lg:space-y-12 mx-2 sm:mx-4 lg:mx-0">
						{/* Agent Partnership */}
						<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
							<div className="grid lg:grid-cols-2 gap-0">
								{/* Content Side */}
								<div className="p-8 lg:p-12 flex flex-col justify-center">
									<div className="flex items-center mb-6">
										<div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4">
											<MdPeople size={32} className="text-purple-primary" />
										</div>
										<div>
											<h3 className="text-2xl lg:text-4xl font-heading font-bold text-gray-700 mb-2">
												Agent Partnership
											</h3>
											<p className="text-lg lg:text-xl text-purple-primary font-semibold mb-2">
												Individual Agents & Advisors
											</p>
										</div>
									</div>

									<p className="text-lg lg:text-xl text-gray-600 mb-8 font-body leading-relaxed">
										Perfect for individual agents, financial advisors, insurance agents, and sales professionals who want to earn commissions by referring clients to our lending and investment products.
									</p>

									{/* Commission Structure */}
									<div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
										<h4 className="text-lg font-heading font-bold text-purple-primary mb-4">
											Commission Structure
										</h4>
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-gray-600 font-body">Personal Loans</span>
												<span className="text-purple-primary font-semibold">Up to 10% profit share</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-gray-600 font-body">Business Loans</span>
												<span className="text-purple-primary font-semibold">Up to 10% profit share</span>
											</div>
											<div className="flex items-center justify-between">
												<span className="text-gray-600 font-body">Investment Products</span>
												<span className="text-purple-primary font-semibold">Up to 2% on investment amount</span>
											</div>
										</div>
									</div>

									{/* Features */}
									<div className="space-y-4 mb-8">
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-purple-primary" />
											<span className="text-base lg:text-lg text-gray-600">
												Monthly commission payouts
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-purple-primary" />
											<span className="text-base lg:text-lg text-gray-600">
												Marketing materials & training provided
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-purple-primary" />
											<span className="text-base lg:text-lg text-gray-600">
												Real-time tracking dashboard
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-purple-primary" />
											<span className="text-base lg:text-lg text-gray-600">
												No minimum quotas or targets
											</span>
										</div>
									</div>

									{/* CTA */}
									<div className="flex flex-col sm:flex-row gap-4">
										<Link
											href="#apply"
											className="bg-purple-primary text-white hover:bg-purple-700 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
										>
											Become an Agent
											<MdArrowForward size={20} className="ml-2" />
										</Link>
									</div>
								</div>

								{/* Visual Side */}
								<div className="relative h-64 lg:h-auto bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
									<div className="relative h-48 w-48 lg:h-64 lg:w-64">
										<Image
											src="/agents.svg"
											alt="Agent Partnership"
											fill
											className="object-contain"
										/>
									</div>
									{/* Floating elements */}
									<div className="absolute top-8 right-8 w-16 h-16 bg-purple-primary/20 rounded-full blur-xl"></div>
									<div className="absolute bottom-8 left-8 w-12 h-12 bg-purple-400/30 rounded-full blur-lg"></div>
								</div>
							</div>
						</div>

						{/* Business Partnership */}
						<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
							<div className="grid lg:grid-cols-2 gap-0">
								{/* Visual Side */}
								<div className="relative h-64 lg:h-auto bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center order-2 lg:order-1">
									<div className="relative h-48 w-48 lg:h-64 lg:w-64">
										<Image
											src="/agent.svg"
											alt="Business Partnership"
											fill
											className="object-contain"
										/>
									</div>
									{/* Floating elements */}
									<div className="absolute top-8 left-8 w-16 h-16 bg-blue-600/20 rounded-full blur-xl"></div>
									<div className="absolute bottom-8 right-8 w-12 h-12 bg-blue-400/30 rounded-full blur-lg"></div>
								</div>

								{/* Content Side */}
								<div className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2">
									<div className="flex items-center mb-6">
										<div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-600/10 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4">
											<MdBusinessCenter size={32} className="text-blue-600" />
										</div>
										<div>
											<h3 className="text-2xl lg:text-4xl font-heading font-bold text-gray-700 mb-2">
												Business Partnership
											</h3>
											<p className="text-lg lg:text-xl text-blue-600 font-semibold mb-2">
												Fintech Integration & Collaboration
											</p>
										</div>
									</div>

									<p className="text-lg lg:text-xl text-gray-600 mb-8 font-body leading-relaxed">
										Designed for fintech companies, digital banks, and technology providers who want to integrate our lending and investment products into their existing platforms or create joint solutions.
									</p>

									{/* Partnership Benefits */}
									<div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
										<h4 className="text-lg font-heading font-bold text-blue-600 mb-4">
											Partnership Benefits
										</h4>
										<div className="space-y-3">
											<div className="flex items-center space-x-3">
												<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
												<span className="text-gray-600 font-body">Revenue sharing opportunities</span>
											</div>
											<div className="flex items-center space-x-3">
												<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
												<span className="text-gray-600 font-body">White-label solutions available</span>
											</div>
											<div className="flex items-center space-x-3">
												<div className="w-2 h-2 bg-blue-600 rounded-full"></div>
												<span className="text-gray-600 font-body">Joint product development</span>
											</div>
										</div>
									</div>

									{/* Features */}
									<div className="space-y-4 mb-8">
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-blue-600" />
											<span className="text-base lg:text-lg text-gray-600">
												Complete API integration support
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-blue-600" />
											<span className="text-base lg:text-lg text-gray-600">
												Technical documentation & SDKs
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-blue-600" />
											<span className="text-base lg:text-lg text-gray-600">
												Dedicated technical support team
											</span>
										</div>
										<div className="flex items-center space-x-3">
											<MdCheck size={20} className="text-blue-600" />
											<span className="text-base lg:text-lg text-gray-600">
												Joint go-to-market strategy
											</span>
										</div>
									</div>

									{/* CTA */}
									<div className="flex flex-col sm:flex-row gap-4">
										<Link
											href="#apply"
											className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
										>
											Partner with Us
											<MdArrowForward size={20} className="ml-2" />
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Success Stories Section */}
			<section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-offwhite w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					{/* Section Header */}
					<div className="text-center mb-8 lg:mb-16">
						<div className="inline-flex items-center px-4 py-2 bg-purple-primary/10 rounded-full mb-4 sm:mb-6 border border-purple-primary/20">
							<MdStar size={16} className="text-purple-primary mr-2" />
							<span className="text-xs sm:text-sm font-semibold text-purple-primary">
								Success Stories
							</span>
						</div>
						<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
							Partner
							<br />
							<span className="text-purple-primary">Success Stories</span>
						</h2>
						<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-4xl">
							Real stories from our successful partners across Malaysia
						</p>
					</div>

					{/* Success Stories Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mx-2 sm:mx-4 lg:mx-0">
						{/* Success Story 1 */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="flex items-center mb-4">
								{[...Array(5)].map((_, i) => (
									<MdStar key={i} size={20} className="text-yellow-400" />
								))}
							</div>
							
							<p className="text-lg lg:text-xl text-gray-600 mb-6 font-body leading-relaxed">
								"I've earned over RM 15,000 in commissions in just 6 months as an agent partner. The 2% monthly commission on loans and investments is excellent, and the support team is fantastic."
							</p>
							
							<div className="flex items-center">
								<div className="w-12 h-12 bg-purple-primary/10 rounded-full flex items-center justify-center mr-4">
									<MdPeople size={20} className="text-purple-primary" />
								</div>
								<div>
									<h4 className="text-lg font-heading font-semibold text-gray-700">
										Sarah Lim
									</h4>
									<p className="text-sm text-gray-500 font-body">
										Insurance Agent, Kuala Lumpur
									</p>
									<div className="flex items-center mt-1">
										<span className="text-xs bg-purple-primary/10 text-purple-primary px-2 py-1 rounded-full font-medium">
											Agent Partner
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Success Story 2 */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="flex items-center mb-4">
								{[...Array(5)].map((_, i) => (
									<MdStar key={i} size={20} className="text-yellow-400" />
								))}
							</div>
							
							<p className="text-lg lg:text-xl text-gray-600 mb-6 font-body leading-relaxed">
								"Our fintech partnership with Kredit.my has been seamless. The API integration was straightforward and our clients now have access to competitive lending and investment options."
							</p>
							
							<div className="flex items-center">
								<div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center mr-4">
									<MdBusinessCenter size={20} className="text-blue-600" />
								</div>
								<div>
									<h4 className="text-lg font-heading font-semibold text-gray-700">
										Ahmad Razak
									</h4>
									<p className="text-sm text-gray-500 font-body">
										CTO, Digital Bank Selangor
									</p>
									<div className="flex items-center mt-1">
										<span className="text-xs bg-blue-600/10 text-blue-600 px-2 py-1 rounded-full font-medium">
											Business Partner
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Success Story 3 */}
						<div className="bg-white rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
							<div className="flex items-center mb-4">
								{[...Array(5)].map((_, i) => (
									<MdStar key={i} size={20} className="text-yellow-400" />
								))}
							</div>
							
							<p className="text-lg lg:text-xl text-gray-600 mb-6 font-body leading-relaxed">
								"As a financial advisor, the agent partnership has been perfect. I earn consistent monthly commissions while helping my clients access better financial products."
							</p>
							
							<div className="flex items-center">
								<div className="w-12 h-12 bg-purple-primary/10 rounded-full flex items-center justify-center mr-4">
									<MdTrendingUp size={20} className="text-purple-primary" />
								</div>
								<div>
									<h4 className="text-lg font-heading font-semibold text-gray-700">
										Jennifer Tan
									</h4>
									<p className="text-sm text-gray-500 font-body">
										Financial Advisor, Penang
									</p>
									<div className="flex items-center mt-1">
										<span className="text-xs bg-purple-primary/10 text-purple-primary px-2 py-1 rounded-full font-medium">
											Agent Partner
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Application Form Section */}
			<section id="apply" className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50/20 w-full">
				<div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
					<div className="max-w-4xl mx-auto">
						{/* Section Header */}
						<div className="text-center mb-8 lg:mb-12">
							<div className="inline-flex items-center px-4 py-2 bg-purple-primary/10 rounded-full mb-4 sm:mb-6 border border-purple-primary/20">
								<span className="text-xs sm:text-sm font-semibold text-purple-primary">
									Apply Now
								</span>
							</div>
							<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 text-gray-700 px-4">
								Ready to
								<br />
								<span className="text-purple-primary">Get Started?</span>
							</h2>
							<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 mx-auto font-body px-4 max-w-none lg:max-w-3xl">
								Fill out the form below and our partnership team will contact you within 24 hours
							</p>
						</div>

						{/* Application Form */}
						<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">
							<form className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Full Name *
										</label>
										<input
											type="text"
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
											placeholder="Enter your full name"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Email Address *
										</label>
										<input
											type="email"
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
											placeholder="Enter your email"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Phone Number *
										</label>
										<input
											type="tel"
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
											placeholder="+60 12-345 6789"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-gray-700 mb-2">
											Partnership Type *
										</label>
										<select
											className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
											required
										>
											<option value="">Select partnership type</option>
											<option value="agent">Agent Partnership - Individual agents & advisors</option>
											<option value="business">Business Partnership - Fintech integration & collaboration</option>
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Company/Organization
									</label>
									<input
										type="text"
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
										placeholder="Enter your company name (optional)"
									/>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Experience & Background *
									</label>
									<textarea
										rows={4}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
										placeholder="Tell us about your experience in finance, sales, or relevant industry..."
										required
									></textarea>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Why do you want to partner with us?
									</label>
									<textarea
										rows={3}
										className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-primary focus:border-transparent"
										placeholder="Share your motivation and goals..."
									></textarea>
								</div>

								<div className="flex items-center space-x-3">
									<input
										type="checkbox"
										id="terms"
										className="w-5 h-5 text-purple-primary border-gray-300 rounded focus:ring-purple-primary"
										required
									/>
									<label htmlFor="terms" className="text-sm text-gray-600">
										I agree to the{" "}
										<Link href="/terms" className="text-purple-primary hover:underline">
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link href="/privacy" className="text-purple-primary hover:underline">
											Privacy Policy
										</Link>
									</label>
								</div>

								<div className="flex justify-center">
									<button
										type="submit"
										className="bg-purple-primary text-white hover:bg-purple-700 font-semibold text-lg px-12 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
									>
										Submit Application
										<MdArrowForward size={20} className="ml-2" />
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>

			{/* Call to Action Section */}
			<CTASection
				title="Questions about our partnership program?"
				description="Our partnership team is here to help you succeed. Get in touch with us today."
				primaryButtonText="Contact Partnership Team"
				primaryButtonHref="https://wa.me/60164614919?text=I'm%20interested%20in%20becoming%20a%20partner"
				secondaryButtonText="View All Solutions"
				secondaryButtonHref="/solutions"
			/>

			{/* Footer */}
			<Footer />
		</div>
	);
} 