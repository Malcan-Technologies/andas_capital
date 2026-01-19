"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useDocumentTitle } from "@/hooks/use-document-title";
import {
	ArrowRight,
	Check,
	Shield,
	Zap,
	MapPin,
	ShieldCheck,
	Users,
	Building2,
	Heart,
	Target,
	Lightbulb,
	Handshake,
	Award,
	Clock,
	Sparkles,
	BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function About() {
	useDocumentTitle("About Us");

	return (
		<div className="min-h-screen bg-gray-50 text-slate-900 font-body w-full">
			<Navbar />

			{/* Hero Section */}
			<section className="relative min-h-[80vh] flex items-center bg-gradient-to-b from-white via-gray-50 to-gray-100 w-full pt-20 overflow-hidden">
				{/* Decorative Elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl -top-40 -left-40" />
					<div className="absolute w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-3xl bottom-0 right-1/4" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
				</div>

				<div className="relative w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
					<div className="max-w-5xl mx-auto text-center">
						<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-50">
							<Building2 className="h-4 w-4 mr-2" />
							Licensed Moneylender
						</Badge>
						
						<h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]">
							We're{" "}
							<span className="text-teal-500">Andas Capital</span>
						</h1>
						
						<p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
							A licensed moneylender committed to providing Malaysians with fast, transparent, 
							and responsible financial solutions. We believe everyone deserves access to 
							fair and honest lending.
						</p>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								className="bg-teal-400 hover:bg-teal-500 text-white font-semibold px-8 py-6 rounded-full text-lg shadow-lg shadow-teal-400/25 h-auto"
								asChild
							>
								<Link href="/signup">
									Get Started
									<ArrowRight className="ml-2 h-5 w-5" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Company Info Section */}
			<section className="py-20 lg:py-28 bg-white w-full">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
						{/* Left - Illustration Card */}
						<div className="relative">
							<div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 lg:p-12 shadow-2xl">
								{/* Decorative Elements */}
								<div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl" />
								<div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/5 rounded-full blur-xl" />
								
								{/* Floating Icons */}
								<div className="absolute -top-4 -right-4 bg-teal-400 text-white p-3 rounded-xl shadow-lg shadow-teal-400/30">
									<ShieldCheck className="h-6 w-6" />
								</div>
								<div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-xl shadow-lg border border-gray-200">
									<Award className="h-6 w-6 text-teal-500" />
								</div>

								{/* Content */}
								<div className="relative text-center text-white">
									<div className="w-20 h-20 bg-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-400/30">
										<Building2 className="h-10 w-10" />
									</div>
									<h3 className="text-2xl font-bold mb-2">Andas Capital</h3>
									<p className="text-slate-400 mb-6">Sdn. Bhd.</p>
									
									<div className="space-y-3 text-left">
										<div className="flex items-center gap-3 text-sm">
											<BadgeCheck className="h-5 w-5 text-teal-400 flex-shrink-0" />
											<span className="text-slate-300">License: WL3863/14/01-11/270926</span>
										</div>
										<div className="flex items-center gap-3 text-sm">
											<Building2 className="h-5 w-5 text-teal-400 flex-shrink-0" />
											<span className="text-slate-300">Company: 200201007895 (575558-W)</span>
										</div>
										<div className="flex items-center gap-3 text-sm">
											<MapPin className="h-5 w-5 text-teal-400 flex-shrink-0" />
											<span className="text-slate-300">Kuala Lumpur, Malaysia</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right - Content */}
						<div>
							<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
								Our Story
							</Badge>
							<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-6 leading-tight">
								Built on Trust,{" "}
								<span className="text-teal-500">Powered by Transparency</span>
							</h2>
							<div className="space-y-4 text-lg text-slate-600">
								<p>
									Andas Capital is operated by Andas Capital Sdn. Bhd., 
									a licensed moneylender under the Moneylenders Act 1951 regulated 
									by the Ministry of Housing and Local Government (KPKT).
								</p>
								<p>
									We started with a simple belief: borrowing money shouldn't be 
									complicated, stressful, or filled with hidden surprises. That's 
									why we've built a lending platform that's completely transparent, 
									fast, and designed around your needs.
								</p>
								<p>
									Our goal is to provide Malaysians with access to responsible 
									financial support whenever they need it most.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Our Values Section */}
			<section className="py-20 lg:py-28 bg-gray-50 w-full">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							Our Values
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							What We Stand For
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							The principles that guide everything we do at Andas Capital
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{
								icon: Heart,
								title: "Integrity",
								description: "We're honest in every interaction. No hidden fees, no surprises.",
							},
							{
								icon: Target,
								title: "Transparency",
								description: "Clear terms and rates explained upfront before you commit.",
							},
							{
								icon: Lightbulb,
								title: "Simplicity",
								description: "We've made borrowing straightforward and stress-free.",
							},
							{
								icon: Handshake,
								title: "Responsibility",
								description: "We lend responsibly and encourage responsible borrowing.",
							},
						].map((value, index) => (
							<Card key={index} className="border-gray-200 bg-white hover:shadow-lg hover:border-teal-200 transition-all duration-300 group text-center">
								<CardContent className="pt-8 pb-6">
									<div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
										<value.icon className="h-7 w-7 text-teal-500" />
									</div>
									<h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
									<p className="text-slate-600 text-sm">{value.description}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Why Choose Us Section */}
			<section className="py-20 lg:py-28 bg-white w-full">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<Badge variant="secondary" className="mb-4 px-4 py-2 bg-teal-50 text-teal-600 border-teal-200">
							The Andas Advantage
						</Badge>
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-slate-900 mb-4">
							Why Malaysians Trust Us
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl mx-auto">
							What sets Andas Capital apart from other lenders
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{[
							{
								icon: ShieldCheck,
								title: "KPKT Licensed",
								description: "Fully licensed under the Moneylenders Act 1951. Your protection is guaranteed by regulation.",
							},
							{
								icon: Zap,
								title: "24-Hour Approval",
								description: "Fast decisions with our streamlined process. No waiting weeks for an answer.",
							},
							{
								icon: Shield,
								title: "No Hidden Charges",
								description: "Every fee is disclosed upfront in your agreement. Complete transparency.",
							},
							{
								icon: Clock,
								title: "Quick Disbursement",
								description: "Once approved, funds are transferred to your account within 24-48 hours.",
							},
							{
								icon: Users,
								title: "Local Support",
								description: "Malaysian team who understands local needs and speaks your language.",
							},
							{
								icon: MapPin,
								title: "100% Online",
								description: "Apply, sign, and manage your loan entirely online. No branch visits required.",
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

			{/* Our Promise Section */}
			<section className="py-20 lg:py-28 bg-gray-50 w-full">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<Card className="relative overflow-hidden bg-white border-gray-200 shadow-lg">
						<CardContent className="p-8 lg:p-12">
							<div className="text-center mb-8">
								<div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Handshake className="h-8 w-8 text-teal-500" />
								</div>
								<h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mb-4">
									Our Promise to You
								</h2>
							</div>
							
							<div className="grid sm:grid-cols-2 gap-4">
								{[
									"Clear and honest terms always",
									"No hidden fees or charges",
									"Fast and fair approval process",
									"Your data is protected (PDPA compliant)",
									"Friendly and responsive support",
									"Easy early settlement options",
								].map((promise, index) => (
									<div key={index} className="flex items-center gap-3">
										<div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
											<Check className="h-4 w-4 text-teal-600" />
										</div>
										<span className="text-slate-700">{promise}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
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
								Apply for a loan today and experience the Andas Capital difference. 
								Fast approval, transparent terms, no hidden fees.
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
								Licensed under KPKT. Your information is protected.
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
