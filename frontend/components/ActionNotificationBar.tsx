"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
	ClockIcon, 
	CreditCardIcon, 
	CheckCircleIcon, 
	ChevronLeftIcon,
	ChevronRightIcon
} from "@heroicons/react/24/outline";

interface ActionNotification {
	id: string;
	type: 'INCOMPLETE_APPLICATION' | 'PENDING_APP_FEE' | 'APPROVED' | 'PENDING_ATTESTATION' | 'CERT_CHECK' | 'PENDING_SIGNING_OTP' | 'PENDING_KYC' | 'PENDING_PROFILE_CONFIRMATION' | 'PENDING_CERTIFICATE_OTP' | 'PENDING_SIGNING_OTP_DS' | 'PENDING_SIGNATURE' | 'PENDING_FRESH_OFFER' | 'PROFILE_INCOMPLETE';
	title: string;
	description: string;
	buttonText: string;
	buttonHref: string;
	priority: 'HIGH' | 'MEDIUM' | 'LOW';
	metadata?: {
		productName?: string;
		amount?: string;
		date?: string;
		applicationId?: string;
		completionPercentage?: number;
		missing?: string[];
	};
}

interface ActionNotificationBarProps {
	notifications: ActionNotification[];
}

export default function ActionNotificationBar({ 
	notifications 
}: ActionNotificationBarProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(true);

	// Auto-rotate notifications every 8 seconds if multiple exist
	useEffect(() => {
		if (notifications.length <= 1) return;

		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % notifications.length);
		}, 8000);

		return () => clearInterval(interval);
	}, [notifications.length]);

	// Reset index when notifications change
	useEffect(() => {
		if (currentIndex >= notifications.length) {
			setCurrentIndex(0);
		}
	}, [notifications.length, currentIndex]);

	if (!isVisible || notifications.length === 0) {
		return null;
	}

	const currentNotification = notifications[currentIndex];

	const getNotificationStyle = (type: string) => {
		switch (type) {
			case 'INCOMPLETE_APPLICATION':
				return {
					bgColor: 'bg-amber-50',
					borderColor: 'border-amber-200',
					iconBg: 'bg-amber-100',
					iconBorder: 'border-amber-200',
					buttonBg: 'bg-amber-500 hover:bg-amber-600',
					textColor: 'text-amber-600',
					icon: <ClockIcon className="h-6 w-6" />
				};
			case 'PENDING_APP_FEE':
				return {
					bgColor: 'bg-orange-50',
					borderColor: 'border-orange-200',
					iconBg: 'bg-orange-100',
					iconBorder: 'border-orange-200',
					buttonBg: 'bg-orange-500 hover:bg-orange-600',
					textColor: 'text-orange-600',
					icon: <CreditCardIcon className="h-6 w-6" />
				};
			case 'APPROVED':
				return {
					bgColor: 'bg-green-50',
					borderColor: 'border-green-200',
					iconBg: 'bg-green-100',
					iconBorder: 'border-green-200',
					buttonBg: 'bg-green-500 hover:bg-green-600',
					textColor: 'text-green-600',
					icon: <CheckCircleIcon className="h-6 w-6" />
				};
			case 'PENDING_ATTESTATION':
				return {
					bgColor: 'bg-cyan-50',
					borderColor: 'border-cyan-200',
					iconBg: 'bg-cyan-100',
					iconBorder: 'border-cyan-200',
					buttonBg: 'bg-cyan-500 hover:bg-cyan-600',
					textColor: 'text-cyan-600',
					icon: (
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					)
				};
				case 'CERT_CHECK':
				return {
					bgColor: 'bg-indigo-50',
					borderColor: 'border-indigo-200',
					iconBg: 'bg-indigo-100',
					iconBorder: 'border-indigo-200',
					buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
					textColor: 'text-indigo-600',
					icon: (
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					)
				};
				case 'PENDING_SIGNING_OTP':
			return {
				bgColor: 'bg-purple-50',
				borderColor: 'border-purple-200',
				iconBg: 'bg-purple-100',
				iconBorder: 'border-purple-200',
				buttonBg: 'bg-purple-500 hover:bg-purple-600',
				textColor: 'text-purple-600',
				icon: (
					<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
				)
			};
		case 'PENDING_CERTIFICATE_OTP':
			return {
				bgColor: 'bg-purple-50',
				borderColor: 'border-purple-200',
				iconBg: 'bg-purple-100',
				iconBorder: 'border-purple-200',
				buttonBg: 'bg-purple-500 hover:bg-purple-600',
				textColor: 'text-purple-600',
				icon: (
					<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 0a8 8 0 11-16 0 8 8 0 0116 0z" />
					</svg>
				)
			};
		case 'PENDING_KYC':
				return {
					bgColor: 'bg-purple-50',
					borderColor: 'border-purple-200',
					iconBg: 'bg-purple-100',
					iconBorder: 'border-purple-200',
					buttonBg: 'bg-purple-500 hover:bg-purple-600',
					textColor: 'text-purple-600',
					icon: (
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					)
				};
			case 'PENDING_PROFILE_CONFIRMATION':
				return {
					bgColor: 'bg-purple-50',
					borderColor: 'border-purple-200',
					iconBg: 'bg-purple-100',
					iconBorder: 'border-purple-200',
					buttonBg: 'bg-purple-500 hover:bg-purple-600',
					textColor: 'text-purple-600',
					icon: (
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					)
				};
			case 'PENDING_SIGNING_OTP_DS':
				return {
					bgColor: 'bg-violet-50',
					borderColor: 'border-violet-200',
					iconBg: 'bg-violet-100',
					iconBorder: 'border-violet-200',
					buttonBg: 'bg-violet-500 hover:bg-violet-600',
					textColor: 'text-violet-600',
					icon: (
						<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 0H9l3 3 3-3z" />
						</svg>
					)
				};
			default:
				return {
					bgColor: 'bg-blue-50',
					borderColor: 'border-blue-200',
					iconBg: 'bg-blue-100',
					iconBorder: 'border-blue-200',
					buttonBg: 'bg-blue-500 hover:bg-blue-600',
					textColor: 'text-blue-600',
					icon: <ClockIcon className="h-6 w-6" />
				};
		}
	};

	const style = getNotificationStyle(currentNotification.type);



	const handlePrevious = () => {
		setCurrentIndex((prev) => prev === 0 ? notifications.length - 1 : prev - 1);
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % notifications.length);
	};

	return (
		<div className={`${style.bgColor} ${style.borderColor} rounded-xl lg:rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8 mb-6`}>
			{/* Navigation Controls for Multiple Notifications */}
			{notifications.length > 1 && (
				<div className="flex items-center justify-start mb-4">
					{/* Navigation Arrows */}
					<div className="flex items-center space-x-4">
						<button
							onClick={handlePrevious}
							className={`p-2 rounded-lg ${style.textColor} hover:bg-white/50 transition-colors`}
							title="Previous notification"
						>
							<ChevronLeftIcon className="h-5 w-5" />
						</button>
						<span className="text-sm text-gray-600 font-medium px-3">
							{currentIndex + 1} of {notifications.length}
						</span>
						<button
							onClick={handleNext}
							className={`p-2 rounded-lg ${style.textColor} hover:bg-white/50 transition-colors`}
							title="Next notification"
						>
							<ChevronRightIcon className="h-5 w-5" />
						</button>
					</div>
				</div>
			)}

			{/* Main Notification Content */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-6">
				{/* Left Side - Icon and Content */}
				<div className="flex items-start space-x-4 min-w-0 flex-1">
					{/* Icon */}
					<div className="flex-shrink-0">
						<div className={`p-3 ${style.iconBg} ${style.iconBorder} rounded-xl border`}>
							<div className={style.textColor}>
								{style.icon}
							</div>
						</div>
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1">
						<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
							{currentNotification.title}
						</h3>
						<p className="text-sm lg:text-base text-gray-600 font-body mb-2">
							{currentNotification.description}
						</p>
						{currentNotification.metadata?.date && (
							<p className="text-xs text-gray-500 font-body">
								{currentNotification.metadata.date}
							</p>
						)}
					</div>
				</div>

				{/* Right Side - Action Button */}
				<div className="flex-shrink-0">
					{/* Primary Action Button */}
					<Link
						href={currentNotification.buttonHref}
						className={`${style.buttonBg} text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center`}
					>
						{currentNotification.buttonText}
						<svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</Link>
				</div>
			</div>

			{/* Progress Bar for Auto-rotation */}
			{notifications.length > 1 && (
				<div className="mt-4 bg-white/50 rounded-full h-1 overflow-hidden">
					<div 
						className={`h-full transition-all duration-75 ease-linear`}
						style={{ 
							backgroundColor: style.textColor.includes('amber') ? '#D97706' :
											  style.textColor.includes('orange') ? '#EA580C' :
											  style.textColor.includes('green') ? '#059669' :
											  style.textColor.includes('cyan') ? '#0891B2' :
											  style.textColor.includes('purple') ? '#9333EA' :
											  style.textColor.includes('indigo') ? '#4F46E5' :
											  style.textColor.includes('violet') ? '#7C3AED' : '#2563EB',
							width: '100%',
							animation: 'actionNotificationProgress 8s linear infinite'
						}}
					/>
				</div>
			)}

			<style jsx>{`
				@keyframes actionNotificationProgress {
					0% { width: 0%; }
					100% { width: 100%; }
				}
			`}</style>
		</div>
	);
} 