"use client";

import { useState } from "react";
import Link from "next/link";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ReactNode } from "react";

type ProductType = {
	id: string;
	title: string;
	description: string;
	features: string[];
	icon: ReactNode;
};

type ProductCategory = {
	title: string;
	description: string;
	types: ProductType[];
};

type ProductsType = {
	business: ProductCategory;
	personal: ProductCategory;
};

export default function Home() {
	const [loanAmount, setLoanAmount] = useState(50000);
	const [loanTerm, setLoanTerm] = useState(12);
	const [interestRate, setInterestRate] = useState(8);
	const [isCollateralized, setIsCollateralized] = useState(true);
	const [activeProduct, setActiveProduct] = useState<"business" | "personal">(
		"business"
	);
	const [activeSubProduct, setActiveSubProduct] = useState("auto");

	const calculateMonthlyPayment = () => {
		const monthlyRate = interestRate / 100 / 12;
		const payment =
			(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
			(Math.pow(1 + monthlyRate, loanTerm) - 1);
		return payment.toFixed(2);
	};

	const calculateTotalRepayment = () => {
		const monthly = parseFloat(calculateMonthlyPayment());
		return (monthly * loanTerm).toFixed(2);
	};

	const generateChartData = () => {
		const monthlyPayment = parseFloat(calculateMonthlyPayment());
		const data = [];
		let remainingBalance = loanAmount;
		let totalInterestPaid = 0;

		for (let month = 0; month <= loanTerm; month++) {
			const monthlyRate = interestRate / 100 / 12;
			const interestPayment = remainingBalance * monthlyRate;
			const principalPayment = monthlyPayment - interestPayment;

			totalInterestPaid += interestPayment;
			remainingBalance -= principalPayment;

			data.push({
				month,
				balance: Math.max(0, remainingBalance),
				totalInterest: totalInterestPaid,
			});
		}
		return data;
	};

	const products: ProductsType = {
		business: {
			title: "Business Solutions",
			description:
				"Comprehensive financing solutions to help your business grow",
			types: [
				{
					id: "auto",
					title: "Auto Dealer Financing",
					description:
						"Specialized financing for auto dealerships with flexible terms and competitive rates",
					features: [
						"Inventory financing",
						"Floor planning",
						"Working capital loans",
						"Up to $10M credit line",
					],
					icon: (
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
					),
				},
				{
					id: "loc",
					title: "Line of Credit",
					description:
						"Flexible business line of credit for managing cash flow and unexpected expenses",
					features: [
						"Revolving credit",
						"Pay interest only on what you use",
						"Quick access to funds",
						"Up to $500K",
					],
					icon: (
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
								d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
							/>
						</svg>
					),
				},
				{
					id: "business",
					title: "Business Loan",
					description:
						"Term loans for business expansion, equipment, or working capital",
					features: [
						"Fixed monthly payments",
						"Competitive rates",
						"Terms up to 5 years",
						"Up to $2M",
					],
					icon: (
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
								d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					),
				},
				{
					id: "employee",
					title: "Employee Loans",
					description:
						"Help your employees with financial wellness through our employee loan program",
					features: [
						"Payroll deduction",
						"No cost to employer",
						"Financial wellness tools",
						"Competitive rates",
					],
					icon: (
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
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					),
				},
			],
		},
		personal: {
			title: "Personal Loans",
			description:
				"Flexible personal financing options to meet your needs",
			types: [
				{
					id: "collateral",
					title: "Collateralized Loans",
					description:
						"Secure better rates by using your assets as collateral",
					features: [
						"Lower interest rates",
						"Higher loan amounts",
						"Longer terms",
						"Various collateral options",
					],
					icon: (
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
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					),
				},
				{
					id: "noncollateral",
					title: "Non-Collateralized Loans",
					description:
						"Quick personal loans without the need for collateral",
					features: [
						"Fast approval",
						"No assets required",
						"Flexible use",
						"Fixed monthly payments",
					],
					icon: (
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
								d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
							/>
						</svg>
					),
				},
			],
		},
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav className="fixed w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 z-50 border-b border-white/10 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16 items-center">
						<div className="flex items-center">
							<Link
								href="/"
								className="text-2xl font-bold text-white"
							>
								Kapital
							</Link>
						</div>
						<div className="hidden md:flex items-center space-x-8">
							<Link
								href="/business"
								className="text-gray-200 hover:text-white transition-colors"
							>
								Business
							</Link>
							<Link
								href="/personal"
								className="text-gray-200 hover:text-white transition-colors"
							>
								Personal
							</Link>
							<Link
								href="/about"
								className="text-gray-200 hover:text-white transition-colors"
							>
								About
							</Link>
							<Link
								href="/contact"
								className="text-gray-200 hover:text-white transition-colors"
							>
								Contact
							</Link>
							<Link
								href="/login"
								className="text-gray-200 hover:text-white transition-colors"
							>
								Login
							</Link>
							<Link
								href="/apply"
								className="bg-white text-purple-900 px-4 py-2 rounded-full hover:bg-purple-50 transition-all"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<header className="min-h-screen relative flex items-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
				{/* Decorative background elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute w-[500px] h-[500px] bg-purple-800/30 rounded-full blur-3xl -top-32 -left-32"></div>
					<div className="absolute w-[500px] h-[500px] bg-indigo-800/30 rounded-full blur-3xl top-1/2 left-1/2"></div>
					<div className="absolute w-[500px] h-[500px] bg-blue-800/30 rounded-full blur-3xl -bottom-32 -right-32"></div>
				</div>

				{/* Content */}
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<h1 className="text-6xl font-bold tracking-tight text-white mb-6">
								Smart financing for
								<span className="block bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
									growing businesses
								</span>
							</h1>
							<p className="text-xl text-purple-200 mb-12">
								Get the funding you need with industry-leading
								rates and lightning-fast approval times. No
								hidden fees, just transparent lending.
							</p>
							<div className="flex gap-4">
								<Link
									href="/apply"
									className="bg-white text-purple-900 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-all"
								>
									Apply Now
								</Link>
								<Link
									href="/rates"
									className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
								>
									View Rates
								</Link>
							</div>
						</div>
						<div className="hidden md:block relative">
							<div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-900/20 to-transparent z-10"></div>
							<img
								src="/hero-image.jpg"
								alt="Business professionals discussing finance"
								className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
							/>
							<div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md rounded-xl p-6 z-20">
								<div className="flex items-center justify-between text-white">
									<div>
										<p className="text-sm font-medium mb-1">
											Average Approval Time
										</p>
										<p className="text-2xl font-bold">
											24 Hours
										</p>
									</div>
									<div>
										<p className="text-sm font-medium mb-1">
											Success Rate
										</p>
										<p className="text-2xl font-bold">
											93%
										</p>
									</div>
									<div>
										<p className="text-sm font-medium mb-1">
											Customer Rating
										</p>
										<p className="text-2xl font-bold">
											4.9/5
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Products Section */}
			<section
				className={`py-24 transition-colors duration-500 ${
					activeProduct === "business"
						? "bg-gradient-to-b from-white to-blue-50"
						: "bg-gradient-to-b from-white to-emerald-50"
				}`}
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Financial Solutions for Every Need
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Choose from our range of carefully crafted financial
							products designed to support your growth
						</p>
					</div>

					<div className="flex justify-center gap-4 mb-12">
						{Object.entries(products).map(([key, value]) => (
							<button
								key={key}
								onClick={() => {
									setActiveProduct(
										key as "business" | "personal"
									);
									setActiveSubProduct(
										key === "business"
											? "auto"
											: "collateral"
									);
								}}
								className={`px-8 py-3 rounded-full font-semibold transition-all ${
									activeProduct === key
										? key === "business"
											? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
											: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
										: "bg-white text-gray-600 hover:bg-gray-50"
								}`}
							>
								{value.title}
							</button>
						))}
					</div>

					<div className="grid md:grid-cols-5 gap-8">
						<div className="md:col-span-2 space-y-4">
							{products[activeProduct].types.map((type) => (
								<div
									key={type.id}
									onClick={() => setActiveSubProduct(type.id)}
									className={`p-6 rounded-2xl transition-all cursor-pointer relative ${
										activeSubProduct === type.id
											? activeProduct === "business"
												? "bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-600 text-blue-900 shadow-lg scale-105"
												: "bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-600 text-emerald-900 shadow-lg scale-105"
											: "bg-white hover:shadow-md"
									}`}
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-full flex items-center justify-center ${
												activeSubProduct === type.id
													? activeProduct ===
													  "business"
														? "bg-blue-600"
														: "bg-emerald-600"
													: activeProduct ===
													  "business"
													? "bg-blue-100"
													: "bg-emerald-100"
											}`}
										>
											<div
												className={
													activeSubProduct === type.id
														? "text-white"
														: activeProduct ===
														  "business"
														? "text-blue-600"
														: "text-emerald-600"
												}
											>
												{type.icon}
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold">
												{type.title}
											</h3>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="md:col-span-3">
							<div className="bg-white rounded-2xl p-8 shadow-xl">
								{(() => {
									const product = products[
										activeProduct
									].types.find(
										(t) => t.id === activeSubProduct
									);

									if (!product) return null;

									return (
										<div className="space-y-6">
											<div className="flex items-center justify-between">
												<h3
													className={`text-2xl font-bold bg-gradient-to-r ${
														activeProduct ===
														"business"
															? "from-blue-600 to-indigo-600"
															: "from-emerald-600 to-teal-600"
													} bg-clip-text text-transparent`}
												>
													{product.title}
												</h3>
												<div
													className={`px-4 py-1.5 rounded-full text-sm font-medium ${
														activeProduct ===
														"business"
															? "bg-blue-50 text-blue-700 border border-blue-200"
															: "bg-emerald-50 text-emerald-700 border border-emerald-200"
													}`}
												>
													{product.id === "auto" &&
														"Up to RM10M"}
													{product.id === "loc" &&
														"Up to RM500K"}
													{product.id ===
														"business" &&
														"Up to RM2M"}
													{product.id ===
														"employee" &&
														"Up to RM100K"}
													{product.id ===
														"collateral" &&
														"Up to RM5M"}
													{product.id ===
														"noncollateral" &&
														"Up to RM250K"}
												</div>
											</div>
											<p className="text-gray-600 text-lg">
												{product.description}
											</p>
											<div className="grid grid-cols-2 gap-6">
												{product.features.map(
													(feature, index) => (
														<div
															key={index}
															className="flex items-center gap-3 text-gray-700"
														>
															<svg
																className={`w-5 h-5 ${
																	activeProduct ===
																	"business"
																		? "text-blue-600"
																		: "text-emerald-600"
																}`}
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		2
																	}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
															<span>
																{feature}
															</span>
														</div>
													)
												)}
											</div>
											<div className="pt-6 flex gap-4">
												<Link
													href="/apply"
													className={`flex-1 text-center text-white px-8 py-4 rounded-full font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 ring-2 ring-offset-2 ${
														activeProduct ===
														"business"
															? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ring-blue-600"
															: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 ring-emerald-600"
													}`}
												>
													Apply Now
												</Link>
												<Link
													href={`/learn/${product.id}`}
													className={`flex-1 text-center border-2 px-8 py-4 rounded-full font-semibold hover:bg-opacity-10 transition-all ${
														activeProduct ===
														"business"
															? "border-blue-600 text-blue-600 hover:bg-blue-50"
															: "border-emerald-600 text-emerald-600 hover:bg-emerald-50"
													}`}
												>
													Learn More
												</Link>
											</div>
										</div>
									);
								})()}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Interactive Benefits Section */}
			<section className="py-24 bg-gradient-to-b from-white to-purple-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							Why Choose{" "}
							<span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
								Kapital
							</span>
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Experience the future of lending with our innovative
							platform
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* Large Card - One Day Mortgage */}
						<div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
							<div className="flex items-start gap-6">
								<div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
									<svg
										className="w-8 h-8 text-purple-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-2xl font-semibold mb-4 group-hover:text-purple-600 transition-colors">
										One Day Approval™
									</h3>
									<p className="text-gray-600 text-lg mb-4">
										Kick your loan into hyperdrive. Going
										from application to approval takes weeks
										for traditional lenders. We do it in a
										single day.
									</p>
									<div className="flex items-center text-purple-600">
										<span className="font-semibold">
											Learn more
										</span>
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 8l4 4m0 0l-4 4m4-4H3"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Small Card - Better HELOC */}
						<div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
							<div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
								<svg
									className="w-6 h-6 text-purple-600"
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
							<h3 className="text-xl font-semibold mb-4 group-hover:text-purple-600 transition-colors">
								Better HELOC
							</h3>
							<p className="text-gray-600">
								Access up to 90% of your home equity as cash in
								as little as 7 days.
							</p>
						</div>

						{/* Small Card - Insurance */}
						<div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
							<div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
								<svg
									className="w-6 h-6 text-purple-600"
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
							<h3 className="text-xl font-semibold mb-4 group-hover:text-purple-600 transition-colors">
								Insurance
							</h3>
							<p className="text-gray-600">
								Protect your investments with comprehensive
								coverage options.
							</p>
						</div>

						{/* Large Card - First Time Home Buyers */}
						<div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
							<div className="flex items-start gap-6">
								<div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
									<svg
										className="w-8 h-8 text-purple-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-2xl font-semibold mb-4 group-hover:text-purple-600 transition-colors">
										First Time Home Buyers
									</h3>
									<p className="text-gray-600 text-lg mb-4">
										Make your dream of homeownership a
										reality with our specialized first-time
										buyer programs and expert guidance.
									</p>
									<div className="flex items-center text-purple-600">
										<span className="font-semibold">
											Learn more
										</span>
										<svg
											className="w-5 h-5 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 8l4 4m0 0l-4 4m4-4H3"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>

						{/* Stats Card */}
						<div className="md:col-span-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-8 text-white">
							<div className="grid md:grid-cols-3 gap-8">
								<div>
									<p className="text-purple-200 text-sm font-medium">
										Success Rate
									</p>
									<p className="text-4xl font-bold">93%</p>
									<p className="text-purple-200 mt-2">
										of applications approved
									</p>
								</div>
								<div>
									<p className="text-purple-200 text-sm font-medium">
										Average Processing Time
									</p>
									<p className="text-4xl font-bold">15min</p>
									<p className="text-purple-200 mt-2">
										from application to decision
									</p>
								</div>
								<div>
									<p className="text-purple-200 text-sm font-medium">
										Average Approval Time
									</p>
									<p className="text-4xl font-bold">24h</p>
									<p className="text-purple-200 mt-2">
										for full loan approval
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Loan Calculator Section */}
			<section className="py-24 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-12">
						<h2 className="text-3xl font-bold mb-8 text-center">
							Calculate Your Loan
						</h2>
						<div className="grid md:grid-cols-2 gap-12">
							<div className="space-y-8">
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Select Product
									</label>
									<select
										className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
										onChange={(e) => {
											const product = products[
												activeProduct
											].types.find(
												(p) => p.id === e.target.value
											);
											if (product) {
												setActiveSubProduct(product.id);
												// Reset loan amount to minimum for selected product
												const maxAmount =
													product.id === "auto"
														? 10000000
														: product.id === "loc"
														? 500000
														: product.id ===
														  "business"
														? 2000000
														: product.id ===
														  "employee"
														? 100000
														: product.id ===
														  "collateral"
														? 5000000
														: 250000;
												setLoanAmount(
													Math.min(
														loanAmount,
														maxAmount
													)
												);
											}
										}}
										value={activeSubProduct}
									>
										{products[activeProduct].types.map(
											(product) => (
												<option
													key={product.id}
													value={product.id}
												>
													{product.title}
												</option>
											)
										)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Loan Amount: RM{" "}
										{loanAmount.toLocaleString()}
									</label>
									<input
										type="range"
										min={
											activeSubProduct === "employee"
												? "5000"
												: "50000"
										}
										max={
											activeSubProduct === "auto"
												? "10000000"
												: activeSubProduct === "loc"
												? "500000"
												: activeSubProduct ===
												  "business"
												? "2000000"
												: activeSubProduct ===
												  "employee"
												? "100000"
												: activeSubProduct ===
												  "collateral"
												? "5000000"
												: "250000"
										}
										step="10000"
										value={loanAmount}
										onChange={(e) =>
											setLoanAmount(
												Number(e.target.value)
											)
										}
										className="w-full h-4 bg-purple-200 rounded-lg appearance-none cursor-pointer hover:bg-purple-300 transition-colors [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110"
									/>
									<div className="flex justify-between text-xs text-gray-500 mt-1">
										<span>
											RM{" "}
											{activeSubProduct === "employee"
												? "5,000"
												: "50,000"}
										</span>
										<span>
											RM{" "}
											{(activeSubProduct === "auto"
												? "10,000,000"
												: activeSubProduct === "loc"
												? "500,000"
												: activeSubProduct ===
												  "business"
												? "2,000,000"
												: activeSubProduct ===
												  "employee"
												? "100,000"
												: activeSubProduct ===
												  "collateral"
												? "5,000,000"
												: "250,000"
											).replace(
												/\B(?=(\d{3})+(?!\d))/g,
												","
											)}
										</span>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Loan Term: {loanTerm} months
									</label>
									<input
										type="range"
										min={
											activeSubProduct === "loc"
												? "1"
												: "12"
										}
										max={
											activeSubProduct === "loc"
												? "12"
												: "60"
										}
										value={loanTerm}
										onChange={(e) =>
											setLoanTerm(Number(e.target.value))
										}
										className="w-full h-4 bg-purple-200 rounded-lg appearance-none cursor-pointer hover:bg-purple-300 transition-colors [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110"
									/>
									<div className="flex justify-between text-xs text-gray-500 mt-1">
										<span>
											{activeSubProduct === "loc"
												? "1"
												: "12"}{" "}
											months
										</span>
										<span>
											{activeSubProduct === "loc"
												? "12"
												: "60"}{" "}
											months
										</span>
									</div>
								</div>
								<div className="mb-6">
									<div className="flex items-center mb-4">
										<div className="relative flex items-center">
											<input
												type="checkbox"
												id="collateral"
												checked={isCollateralized}
												onChange={(e) => {
													setIsCollateralized(
														e.target.checked
													);
													setInterestRate(
														e.target.checked
															? 8
															: 12
													);
												}}
												className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-purple-300 bg-white 
														  checked:bg-gradient-to-r checked:from-purple-600 checked:to-indigo-600 
														  checked:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500/20 
														  transition-all duration-200"
											/>
											<svg
												className="pointer-events-none absolute h-4 w-4 translate-x-0.5 translate-y-0.5 opacity-0 
														 fill-white peer-checked:opacity-100 transition-opacity duration-200"
												viewBox="0 0 16 16"
											>
												<path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
											</svg>
											<label
												htmlFor="collateral"
												className="ml-3 text-sm font-medium text-gray-700 cursor-pointer select-none"
											>
												Secured with Collateral
											</label>
										</div>
									</div>
									<p className="text-xs text-gray-500 ml-8">
										Secure your loan with collateral to
										access lower interest rates
									</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Interest Rate: {interestRate}% APR
									</label>
									<input
										type="range"
										min={isCollateralized ? "8" : "12"}
										max={isCollateralized ? "12" : "18"}
										step="0.1"
										value={interestRate}
										onChange={(e) =>
											setInterestRate(
												Number(e.target.value)
											)
										}
										className="w-full h-4 bg-purple-200 rounded-lg appearance-none cursor-pointer hover:bg-purple-300 transition-colors [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-purple-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110"
									/>
									<div className="flex justify-between text-xs text-gray-500 mt-1">
										<span>
											{isCollateralized ? "8" : "12"}% APR
										</span>
										<span>
											{isCollateralized ? "12" : "18"}%
											APR
										</span>
									</div>
								</div>
							</div>
							<div className="bg-white rounded-2xl p-8 shadow-sm">
								<div className="flex justify-between items-start mb-6">
									<div>
										<h3 className="text-xl font-semibold">
											Monthly Payment
										</h3>
										<div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
											RM{" "}
											{Number(
												calculateMonthlyPayment()
											).toLocaleString()}
										</div>
									</div>
								</div>
								<div className="h-64 mb-8">
									<ResponsiveContainer
										width="100%"
										height="100%"
									>
										<LineChart
											data={generateChartData()}
											margin={{
												top: 5,
												right: 5,
												bottom: 5,
												left: 5,
											}}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												stroke="#E5E7EB"
											/>
											<XAxis
												dataKey="month"
												label={{
													value: "Months",
													position: "bottom",
												}}
												tick={{ fontSize: 12 }}
											/>
											<YAxis
												label={{
													value: "Amount (RM)",
													angle: -90,
													position: "insideLeft",
													style: {
														textAnchor: "middle",
													},
												}}
												tick={{ fontSize: 12 }}
												tickFormatter={(value) =>
													`${(value / 1000).toFixed(
														0
													)}k`
												}
											/>
											<Tooltip
												formatter={(value: number) => [
													`RM ${Number(
														value
													).toLocaleString()}`,
													undefined,
												]}
												labelFormatter={(label) =>
													`Month ${label}`
												}
											/>
											<Line
												type="monotone"
												dataKey="balance"
												stroke="#7C3AED"
												strokeWidth={2}
												name="Remaining Balance"
												dot={false}
											/>
											<Line
												type="monotone"
												dataKey="totalInterest"
												stroke="#4F46E5"
												strokeWidth={2}
												name="Total Interest"
												dot={false}
											/>
										</LineChart>
									</ResponsiveContainer>
								</div>
								<div className="space-y-4">
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center">
											<div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
											<span>Principal Balance</span>
										</div>
										<span className="font-medium">
											RM {loanAmount.toLocaleString()}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center">
											<div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
											<span>Total Interest</span>
										</div>
										<span className="font-medium">
											RM{" "}
											{(
												Number(
													calculateTotalRepayment()
												) - loanAmount
											).toLocaleString()}
										</span>
									</div>
								</div>
								<Link
									href="/apply"
									className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all mt-8"
								>
									Apply Now
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* CTA Section integrated into footer */}
					<div className="py-16 text-center">
						<h2 className="text-4xl font-bold mb-6">
							Ready to grow your business?
						</h2>
						<p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
							Join thousands of satisfied customers who chose
							Kapital for their financial needs. Get started
							today.
						</p>
						<a
							href="/apply"
							className="inline-block bg-white text-purple-900 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors"
						>
							Apply for a Loan Today
						</a>
					</div>

					{/* Divider */}
					<div className="border-t border-white/10"></div>

					{/* Footer Content */}
					<div className="py-16">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
							<div>
								<h3 className="text-2xl font-bold mb-4 text-white">
									Kapital
								</h3>
								<p className="text-purple-200">
									Making finance accessible for everyone.
									Fast, transparent, and reliable.
								</p>
							</div>
							<div>
								<h4 className="text-lg font-semibold mb-4 text-white">
									Products
								</h4>
								<ul className="space-y-3 text-purple-200">
									<li>
										<a
											href="/business-loans"
											className="hover:text-white transition-colors"
										>
											Business Loans
										</a>
									</li>
									<li>
										<a
											href="/personal-loans"
											className="hover:text-white transition-colors"
										>
											Personal Loans
										</a>
									</li>
									<li>
										<a
											href="/line-of-credit"
											className="hover:text-white transition-colors"
										>
											Line of Credit
										</a>
									</li>
									<li>
										<a
											href="/equipment-financing"
											className="hover:text-white transition-colors"
										>
											Equipment Financing
										</a>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="text-lg font-semibold mb-4 text-white">
									Company
								</h4>
								<ul className="space-y-3 text-purple-200">
									<li>
										<a
											href="/about"
											className="hover:text-white transition-colors"
										>
											About Us
										</a>
									</li>
									<li>
										<a
											href="/careers"
											className="hover:text-white transition-colors"
										>
											Careers
										</a>
									</li>
									<li>
										<a
											href="/blog"
											className="hover:text-white transition-colors"
										>
											Blog
										</a>
									</li>
									<li>
										<a
											href="/contact"
											className="hover:text-white transition-colors"
										>
											Contact
										</a>
									</li>
								</ul>
							</div>
							<div>
								<h4 className="text-lg font-semibold mb-4 text-white">
									Resources
								</h4>
								<ul className="space-y-3 text-purple-200">
									<li>
										<a
											href="/help"
											className="hover:text-white transition-colors"
										>
											Help Center
										</a>
									</li>
									<li>
										<a
											href="/privacy"
											className="hover:text-white transition-colors"
										>
											Privacy Policy
										</a>
									</li>
									<li>
										<a
											href="/terms"
											className="hover:text-white transition-colors"
										>
											Terms of Service
										</a>
									</li>
									<li>
										<a
											href="/security"
											className="hover:text-white transition-colors"
										>
											Security
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div className="border-t border-white/10 mt-12 pt-8 text-center text-purple-200">
							<p>
								&copy; {new Date().getFullYear()} Kapital. All
								rights reserved.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
