"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
	ArrowRight,
	Check,
	ChevronRight,
	Shield,
	ShieldCheck,
	Users,
	Building2,
	Briefcase,
	Percent,
	Clock,
	Zap,
	FileText,
	Wallet,
	BadgeCheck,
	Sparkles,
	CircleDollarSign,
	FileCheck,
	Send,
	CheckCircle2,
	Lock,
	Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function Home() {
	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		element?.scrollIntoView({ behavior: "smooth" });
	};

	const faqs = [
		{
			question: "Is Andas Capital legally licensed?",
			answer: "Yes. We are fully licensed under the Moneylenders Act 1951. Our license (WL3337/07/01-11/020227) is issued by the Ministry of Housing and Local Government (KPKT), ensuring we operate legally and are strictly regulated."
		},
		{
			question: "Who can apply for a loan?",
			answer: "Malaysian citizens aged 21 to 60 with a steady income are eligible. We'll need supporting documents like your IC, payslips, or bank statements to verify eligibility."
		},
		{
			question: "How much can I borrow?",
			answer: "Loan amounts range from RM1,000 up to RM50,000, depending on your income, repayment capacity, and the type of loan you choose."
		},
		{
			question: "How fast will I receive my funds?",
			answer: "Once your application is approved and documents verified, funds are typically disbursed to your bank account within 24 to 48 hours."
		},
		{
			question: "Are there any hidden fees?",
			answer: "Absolutely not. All fees and charges are explained clearly in your loan agreement upfront. We believe in complete transparency."
		},
		{
			question: "Can I repay my loan early?",
			answer: "Yes! Early settlement is always allowed. You may even save on future interest depending on your repayment terms."
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 text-slate-900 font-body w-full">
			<Navbar />

			{/* Hero Section - Illustration Based */}
			<section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-white via-gray-50 to-gray-100 w-full pt-20 overflow-hidden">
				{/* Decorative Elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl -top-40 -right-40" />
					<div className="absolute w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-3xl bottom-0 left-1/4" />
					{/* Grid Pattern */}
					<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
				</div>

				<div className="relative w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 lg:py-20">
					<div className="max-w-7xl mx-auto">
						<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
							{/* Left Content */}
							<div className="text-center lg:text-left order-2 lg:order-1">
								<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-50">
									<Sparkles className="h-4 w-4 mr-2" />
									Licensed by KPKT Malaysia
								</Badge>
								
								<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
									Financial Freedom,{" "}
									<span className="text-teal-500">Simplified</span>
								</h1>
								
								<p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
									Fast, transparent, and hassle-free loans for Malaysians. 
									Apply online in minutes, get approved within 24 hours.
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
									<Button
										size="lg"
										className="bg-teal-400 hover:bg-teal-500 text-white font-semibold px-8 py-6 rounded-full text-lg shadow-lg shadow-teal-400/25 hover:shadow-xl hover:shadow-teal-400/30 transition-all h-auto"
										asChild
									>
										<Link href="/signup">
											Apply Now
											<ArrowRight className="ml-2 h-5 w-5" />
										</Link>
									</Button>
									<Button
										size="lg"
										variant="outline"
										onClick={() => scrollToSection('how-it-works')}
										className="border-gray-300 text-slate-700 hover:bg-white font-semibold px-8 py-6 rounded-full text-lg h-auto"
									>
										See How It Works
									</Button>
								</div>

								{/* Trust Indicators */}
								<div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
									<div className="flex items-center gap-2">
										<ShieldCheck className="h-5 w-5 text-teal-500" />
										<span>256-bit SSL Secured</span>
									</div>
									<div className="flex items-center gap-2">
										<Lock className="h-5 w-5 text-teal-500" />
										<span>PDPA Compliant</span>
									</div>
									<div className="flex items-center gap-2">
										<BadgeCheck className="h-5 w-5 text-teal-500" />
										<span>Licensed Lender</span>
									</div>
								</div>
							</div>

							{/* Right - Illustration */}
							<div className="order-1 lg:order-2 flex items-center justify-center">
								<div className="relative w-full max-w-lg">
									{/* Main Illustration Card */}
									<div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-gray-100">
										{/* Floating Icon Cards */}
										<div className="absolute -top-6 -left-6 bg-teal-400 text-white p-4 rounded-2xl shadow-lg shadow-teal-400/30">
											<Wallet className="h-8 w-8" />
										</div>
										<div className="absolute -top-4 -right-4 bg-white border border-gray-200 p-3 rounded-xl shadow-lg">
											<CheckCircle2 className="h-6 w-6 text-green-500" />
										</div>
										<div className="absolute -bottom-4 -left-4 bg-white border border-gray-200 p-3 rounded-xl shadow-lg">
											<Clock className="h-6 w-6 text-teal-500" />
										</div>

										{/* Content */}
										<div className="text-center py-8">
											<div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-400/30">
												<CircleDollarSign className="h-12 w-12 text-white" />
											</div>
											<h3 className="text-2xl font-bold text-slate-900 mb-2">
												Up to RM 50,000
											</h3>
											<p className="text-slate-600 mb-6">
												Personal & Business Loans
											</p>
											
											{/* Stats */}
											<div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
												<div>
													<div className="text-2xl font-bold text-teal-500">24h</div>
													<div className="text-xs text-slate-500">Approval</div>
												</div>
												<div>
													<div className="text-2xl font-bold text-teal-500">18%</div>
													<div className="text-xs text-slate-500">p.a. Rate</div>
												</div>
												<div>
													<div className="text-2xl font-bold text-teal-500">36</div>
													<div className="text-xs text-slate-500">Months Max</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 lg:py-28 bg-white w-full" id="how-it-works">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							Simple Process
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							Get Funded in 4 Easy Steps
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							Our streamlined process gets you from application to funded in as little as 24 hours
						</p>
					</div>

					{/* Process Steps */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
						{[
							{
								icon: Smartphone,
								step: "01",
								title: "Apply Online",
								description: "Fill out our simple application form in under 5 minutes",
							},
							{
								icon: FileCheck,
								step: "02",
								title: "Quick Review",
								description: "Our team reviews your application within hours",
							},
							{
								icon: FileText,
								step: "03",
								title: "Sign Digitally",
								description: "E-sign your loan agreement securely online",
							},
							{
								icon: Send,
								step: "04",
								title: "Receive Funds",
								description: "Money is transferred directly to your bank account",
							},
						].map((item, index) => (
							<Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-gray-200 bg-white overflow-hidden">
								{/* Step Number Background */}
								<div className="absolute top-0 right-0 text-8xl font-bold text-gray-50 leading-none select-none">
									{item.step}
								</div>
								<CardHeader className="relative">
									<div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
										<item.icon className="h-7 w-7 text-teal-500" />
									</div>
									<CardTitle className="text-xl font-bold">{item.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base text-slate-600">
										{item.description}
									</CardDescription>
								</CardContent>
								{/* Connector Line */}
								{index < 3 && (
									<div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 z-10">
										<ChevronRight className="absolute -right-1 -top-2 h-5 w-5 text-gray-300" />
									</div>
								)}
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Products Section */}
			<section className="py-20 lg:py-28 bg-gray-50 w-full" id="products">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							Our Products
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							Choose Your Loan Type
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							Flexible financing solutions tailored to your personal or business needs
						</p>
					</div>

					<div className="grid lg:grid-cols-2 gap-8">
						{/* Personal Loan Card */}
						<Card className="relative overflow-hidden border-gray-200 bg-white hover:shadow-xl transition-all duration-300 group">
							<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-400/10 to-teal-400/5 rounded-bl-full" />
							<CardHeader className="pb-4">
								<div className="flex items-center gap-4 mb-2">
									<div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-400/25">
										<Users className="h-8 w-8 text-white" />
									</div>
									<div>
										<CardTitle className="text-2xl font-bold">Personal Loan</CardTitle>
										<CardDescription className="text-teal-500 font-medium">For Individual Needs</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
									<div className="text-center">
										<div className="text-2xl font-bold text-slate-900">RM 30K</div>
										<div className="text-sm text-slate-500">Max Amount</div>
									</div>
									<div className="text-center border-x border-gray-100">
										<div className="text-2xl font-bold text-slate-900">18%</div>
										<div className="text-sm text-slate-500">p.a. Rate</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-slate-900">24</div>
										<div className="text-sm text-slate-500">Months Max</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Documents Needed</h4>
									<div className="grid grid-cols-2 gap-2">
										{["IC Copy", "Payslip", "Bank Statement", "CTOS Report"].map((doc) => (
											<div key={doc} className="flex items-center gap-2 text-sm text-slate-600">
												<Check className="h-4 w-4 text-teal-500" />
												<span>{doc}</span>
											</div>
										))}
									</div>
								</div>

								<Button
									className="w-full bg-teal-400 hover:bg-teal-500 text-white font-semibold py-6 rounded-xl text-lg h-auto group-hover:shadow-lg group-hover:shadow-teal-400/25 transition-all"
									asChild
								>
									<Link href="/signup">
										Apply for Personal Loan
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Business Loan Card */}
						<Card className="relative overflow-hidden border-gray-200 bg-white hover:shadow-xl transition-all duration-300 group">
							<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-slate-800/10 to-slate-800/5 rounded-bl-full" />
							<CardHeader className="pb-4">
								<div className="flex items-center gap-4 mb-2">
									<div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-800/25">
										<Briefcase className="h-8 w-8 text-white" />
									</div>
									<div>
										<CardTitle className="text-2xl font-bold">Business Loan</CardTitle>
										<CardDescription className="text-slate-600 font-medium">For Business Growth</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
									<div className="text-center">
										<div className="text-2xl font-bold text-slate-900">RM 50K</div>
										<div className="text-sm text-slate-500">Max Amount</div>
									</div>
									<div className="text-center border-x border-gray-100">
										<div className="text-2xl font-bold text-slate-900">18%</div>
										<div className="text-sm text-slate-500">p.a. Rate</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-slate-900">36</div>
										<div className="text-sm text-slate-500">Months Max</div>
									</div>
								</div>

								<div>
									<h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">Documents Needed</h4>
									<div className="grid grid-cols-2 gap-2">
										{["Director's IC", "SSM Profile", "Financial Report", "CTOS Report"].map((doc) => (
											<div key={doc} className="flex items-center gap-2 text-sm text-slate-600">
												<Check className="h-4 w-4 text-teal-500" />
												<span>{doc}</span>
											</div>
										))}
									</div>
								</div>

								<Button
									className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 rounded-xl text-lg h-auto group-hover:shadow-lg group-hover:shadow-slate-800/25 transition-all"
									asChild
								>
									<Link href="/signup">
										Apply for Business Loan
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className="py-20 lg:py-28 bg-white w-full" id="why-us">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							Why Andas Capital
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							Built on Trust & Transparency
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							We're not just another lender. Here's what makes us different.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{
								icon: Building2,
								title: "KPKT Licensed",
								description: "Fully licensed under the Moneylenders Act 1951. Your trust is protected by regulation.",
							},
							{
								icon: Percent,
								title: "Transparent Rates",
								description: "Clear interest rates disclosed upfront. No surprises, no hidden calculations.",
							},
							{
								icon: ShieldCheck,
								title: "No Hidden Fees",
								description: "Every charge is explained in your agreement. What you see is what you pay.",
							},
							{
								icon: Zap,
								title: "24-Hour Approval",
								description: "Fast decisions powered by our streamlined review process. Time is money.",
							},
							{
								icon: Shield,
								title: "Bank-Level Security",
								description: "Your data is protected with enterprise-grade encryption and PDPA compliance.",
							},
							{
								icon: Smartphone,
								title: "100% Digital",
								description: "Apply, sign, and manage your loan entirely online. No branch visits needed.",
							},
						].map((feature, index) => (
							<Card key={index} className="border-gray-200 bg-white hover:shadow-lg hover:border-teal-200 transition-all duration-300 group">
								<CardContent className="pt-6">
									<div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
										<feature.icon className="h-6 w-6 text-teal-500" />
									</div>
									<h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
									<p className="text-slate-600">{feature.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20 lg:py-28 bg-gray-50 w-full" id="faq">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							FAQ
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							Common Questions
						</h2>
						<p className="text-lg text-slate-600">
							Everything you need to know about our lending services
						</p>
					</div>

					<Accordion type="single" collapsible className="space-y-4">
						{faqs.map((faq, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="bg-white border border-gray-200 rounded-xl px-6 data-[state=open]:shadow-lg data-[state=open]:border-teal-200 transition-all"
							>
								<AccordionTrigger className="text-left text-lg font-semibold text-slate-900 hover:text-teal-500 py-5 hover:no-underline">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-slate-600 pb-5 text-base leading-relaxed">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 lg:py-28 bg-white w-full">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-2xl">
						{/* Decorative Elements */}
						<div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/5 rounded-full blur-2xl" />
						
						<CardContent className="relative p-8 sm:p-12 lg:p-16 text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-teal-400 rounded-2xl mb-6 shadow-lg shadow-teal-400/30">
								<Sparkles className="h-8 w-8 text-white" />
							</div>
							
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
								Ready to Get Started?
							</h2>
							<p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
								Join thousands of Malaysians who trust Andas Capital for their financial needs. 
								Apply today and get funded within 24 hours.
							</p>
							
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Button
									size="lg"
									className="bg-teal-400 hover:bg-teal-500 text-white font-semibold px-10 py-6 rounded-full text-lg shadow-lg shadow-teal-400/25 h-auto"
									asChild
								>
									<Link href="/signup">
										Apply Now — It's Free
										<ArrowRight className="ml-2 h-5 w-5" />
									</Link>
								</Button>
							</div>

							<p className="text-sm text-slate-400 mt-6">
								No commitment required. Check your eligibility in minutes.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<Footer />
		</div>
	);
}
