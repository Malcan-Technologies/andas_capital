"use client";

import { useState, useEffect } from "react";
import { PersonalInfo } from "@/types/onboarding";
import { 
	validateICOrPassport, 
	extractDOBFromMalaysianIC, 
	formatMalaysianIC 
} from "@/lib/icUtils";
import { 
	UserIcon, 
	IdentificationIcon, 
	PhoneIcon, 
	EnvelopeIcon, 
	CalendarIcon 
} from "@heroicons/react/24/outline";

interface PersonalInfoFormProps {
	initialValues: Partial<PersonalInfo>;
	onSubmit: (values: PersonalInfo) => void;
	onBack: () => void;
	showBackButton: boolean;
	isLastStep: boolean;
}

export default function PersonalInfoForm({
	initialValues,
	onSubmit,
	onBack,
	showBackButton,
	isLastStep,
}: PersonalInfoFormProps) {
	const [formData, setFormData] = useState<PersonalInfo>({
		fullName: initialValues.fullName || "",
		dateOfBirth: initialValues.dateOfBirth || null,
		email: initialValues.email || "",
		phoneNumber: initialValues.phoneNumber || "",
		icNumber: initialValues.icNumber || "",
		icType: initialValues.icType || null,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [icError, setIcError] = useState<string>("");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const handleIcNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setIcError("");
		
		setFormData(prev => ({
			...prev,
			icNumber: value,
		}));

		// Validate and extract DOB if IC number is provided
		if (value.trim()) {
			const validation = validateICOrPassport(value);
			
			if (validation.isValid && validation.type) {
				setFormData(prev => ({
					...prev,
					icType: validation.type,
					dateOfBirth: validation.extractedDOB || prev.dateOfBirth || null,
				}));
			} else {
				setFormData(prev => ({
					...prev,
					icType: null,
					dateOfBirth: null,
				}));
				if (validation.error) {
					setIcError(validation.error);
				}
			}
		} else {
			setFormData(prev => ({
				...prev,
				icType: null,
				dateOfBirth: null,
			}));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.fullName?.trim()) {
			newErrors.fullName = "Full name is required";
		}

		if (!formData.icNumber?.trim()) {
			newErrors.icNumber = "IC or passport number is required";
		} else {
			const icValidation = validateICOrPassport(formData.icNumber);
			if (!icValidation.isValid) {
				newErrors.icNumber = icValidation.error || "Invalid IC or passport number";
			}
		}

		if (!formData.dateOfBirth) {
			newErrors.dateOfBirth = "Date of birth is required";
		} else {
			// Check age requirement
			const today = new Date();
			const birthDate = new Date(formData.dateOfBirth);
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			if (age < 18) {
				newErrors.dateOfBirth = "You must be at least 18 years old";
			}
		}

		// Email is optional but if provided, must be valid
		if (formData.email?.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = "Please enter a valid email address";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (validateForm()) {
			onSubmit({
				fullName: formData.fullName!,
				dateOfBirth: formData.dateOfBirth || null,
				email: formData.email || "",
				phoneNumber: formData.phoneNumber!,
				icNumber: formData.icNumber!,
				icType: formData.icType!,
			});
		}
	};

	const formatDate = (date: Date | null): string => {
		if (!date) return "";
		return date.toLocaleDateString('en-MY', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	return (
		<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div className="p-4 sm:p-6 lg:p-8">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Full Name */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
										Full Name (as per IC) <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<UserIcon className="h-5 w-5 text-gray-400" />
										</div>
										<input
											type="text"
											name="fullName"
											value={formData.fullName}
											onChange={handleInputChange}
											className={`w-full pl-10 pr-3 py-3 border rounded-xl font-body text-base text-gray-900 bg-white transition-all duration-200 ${
												errors.fullName
													? "border-red-300 focus:border-red-500 focus:ring-red-500"
													: "border-gray-300 focus:border-purple-primary focus:ring-purple-primary"
											} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
											placeholder="Enter your full name"
										/>
									</div>
									{errors.fullName && (
										<p className="mt-1 text-sm text-red-600 font-body">{errors.fullName}</p>
									)}
								</div>

								{/* Phone Number (Display Only) */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
										Phone Number
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<PhoneIcon className="h-5 w-5 text-gray-400" />
										</div>
										<input
											type="text"
											value={formData.phoneNumber}
											disabled
											className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl font-body text-base bg-gray-50 text-gray-500 cursor-not-allowed"
											placeholder="Phone number"
										/>
									</div>
									<p className="mt-1 text-xs text-gray-500 font-body">
										This is your registered phone number and cannot be changed
									</p>
								</div>

								{/* IC/Passport Number */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
										IC/Passport Number <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<IdentificationIcon className="h-5 w-5 text-gray-400" />
										</div>
										<input
											type="text"
											name="icNumber"
											value={formData.icNumber}
											onChange={handleIcNumberChange}
											className={`w-full pl-10 pr-3 py-3 border rounded-xl font-body text-base text-gray-900 bg-white transition-all duration-200 ${
												errors.icNumber || icError
													? "border-red-300 focus:border-red-500 focus:ring-red-500"
													: "border-gray-300 focus:border-purple-primary focus:ring-purple-primary"
											} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
											placeholder="Enter your IC or passport number"
										/>
									</div>
									{formData.icType && (
										<div className="mt-2 flex items-center space-x-2">
											<div className="w-2 h-2 bg-green-500 rounded-full"></div>
											<span className="text-sm text-green-600 font-body">
												{formData.icType === 'IC' ? 'Malaysian IC detected' : 'Passport number detected'}
											</span>
										</div>
									)}
									{(errors.icNumber || icError) && (
										<p className="mt-1 text-sm text-red-600 font-body">{errors.icNumber || icError}</p>
									)}
								</div>

								{/* Date of Birth */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
										Date of Birth <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<CalendarIcon className="h-5 w-5 text-gray-400" />
										</div>
										<input
											type="text"
											value={formatDate(formData.dateOfBirth)}
											disabled
											className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl font-body text-base bg-gray-50 text-gray-500 cursor-not-allowed"
											placeholder="Date will be extracted from IC number"
										/>
									</div>
									{formData.icType === 'IC' && formData.dateOfBirth && (
										<p className="mt-1 text-xs text-blue-600 font-body">
											Date extracted from Malaysian IC number
										</p>
									)}
									{formData.icType === 'PASSPORT' && (
										<p className="mt-1 text-xs text-gray-500 font-body">
											Date of birth cannot be extracted from passport numbers
										</p>
									)}
									{errors.dateOfBirth && (
										<p className="mt-1 text-sm text-red-600 font-body">{errors.dateOfBirth}</p>
									)}
								</div>

								{/* Email (Optional) */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
										Email Address <span className="text-gray-400 text-xs">(Optional)</span>
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<EnvelopeIcon className="h-5 w-5 text-gray-400" />
										</div>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											className={`w-full pl-10 pr-3 py-3 border rounded-xl font-body text-base text-gray-900 bg-white transition-all duration-200 ${
												errors.email
													? "border-red-300 focus:border-red-500 focus:ring-red-500"
													: "border-gray-300 focus:border-purple-primary focus:ring-purple-primary"
											} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
											placeholder="Enter your email address"
										/>
									</div>
									{errors.email && (
										<p className="mt-1 text-sm text-red-600 font-body">{errors.email}</p>
									)}
								</div>

								{/* Action Buttons */}
								<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
									{showBackButton && (
										<button
											type="button"
											onClick={onBack}
											className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium font-body text-base transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-primary focus:ring-opacity-50"
										>
											Back
										</button>
									)}
									<button
										type="submit"
										className="w-full sm:flex-1 bg-purple-primary hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium font-body text-base transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-primary focus:ring-opacity-50"
									>
										{isLastStep ? "Complete" : "Continue"}
									</button>
								</div>
							</form>
						</div>
					</div>
	);
}
