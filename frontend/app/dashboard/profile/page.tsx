"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
	PencilIcon,
	UserCircleIcon,
	HomeIcon,
	BriefcaseIcon,
	BanknotesIcon,
	ShieldCheckIcon,
	ClockIcon,
	CalendarIcon,
	PhoneIcon,
	EnvelopeIcon,
	MapPinIcon,
	BuildingOfficeIcon,
	CurrencyDollarIcon,
	IdentificationIcon,
} from "@heroicons/react/24/outline";
import { fetchWithTokenRefresh, checkAuth } from "@/lib/authUtils";
import { validatePhoneNumber } from "@/lib/phoneUtils";

interface UserProfile {
	id: string;
	phoneNumber: string;
	fullName: string | null;
	email: string | null;
	dateOfBirth: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	state: string | null;
	zipCode: string | null;
	employmentStatus: string | null;
	employerName: string | null;
	monthlyIncome: string | null;
	bankName: string | null;
	accountNumber: string | null;
	isOnboardingComplete: boolean;
	onboardingStep: number;
	createdAt: string;
	updatedAt: string;
	lastLoginAt: string | null;
	kycStatus: boolean;
}

interface CountryData {
	countryCode: string;
	dialCode: string;
	format: string;
	name: string;
}

const employmentStatuses = [
	"Employed",
	"Self-Employed",
	"Student",
	"Unemployed",
] as const;

const incomeRanges = [
	"Below RM2,000",
	"RM2,000 - RM4,000",
	"RM4,001 - RM6,000",
	"RM6,001 - RM8,000",
	"RM8,001 - RM10,000",
	"Above RM10,000",
] as const;

type EditingSections = "personal" | "address" | "employment" | "banking" | "password" | null;

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingSection, setEditingSection] = useState<EditingSections>(null);
	const [formData, setFormData] = useState<Partial<UserProfile>>({});
	const [phoneNumber, setPhoneNumber] = useState("");
	const [phoneError, setPhoneError] = useState<string | null>(null);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [passwordError, setPasswordError] = useState("");

	// Example placeholders for different countries
	const placeholders: { [key: string]: string } = {
		my: "1234 5678", // Malaysia
		sg: "8123 4567", // Singapore
		id: "812 345 678", // Indonesia
		th: "81 234 5678", // Thailand
	};

	const [placeholder, setPlaceholder] = useState(placeholders["my"]);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				// Check authentication using our utility
				const isAuthenticated = await checkAuth();

				if (!isAuthenticated) {
					router.push("/login");
					return;
				}

				// Fetch profile data using our token refresh utility
				const data = await fetchWithTokenRefresh<UserProfile>(
					"/api/users/me"
				);

				if (data.dateOfBirth) {
					data.dateOfBirth = new Date(data.dateOfBirth)
						.toISOString()
						.split("T")[0];
				}
				setProfile(data);
				setFormData(data);
				// Initialize phone number state
				setPhoneNumber(data.phoneNumber || "");
			} catch (error) {
				console.error("Error fetching profile:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [router]);

	const handlePhoneChange = (value: string, data: CountryData) => {
		setPhoneNumber(value);
		setPlaceholder(placeholders[data.countryCode] || "1234 5678");
		
		// Update form data with the new phone number
		setFormData((prev) => ({
			...prev,
			phoneNumber: value,
		}));
		
		// Clear phone error when user starts typing
		if (phoneError) {
			setPhoneError(null);
		}
	};

	const handleEdit = (section: EditingSections) => {
		setEditingSection(section);
		// Initialize phone number when editing personal section
		if (section === "personal" && profile) {
			setPhoneNumber(profile.phoneNumber || "");
		}
	};

	const handleCancel = () => {
		setEditingSection(null);
		setFormData(profile || {});
		// Reset phone number to original profile value
		setPhoneNumber(profile?.phoneNumber || "");
		setPhoneError(null);
		// Reset password form when canceling
		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
		setPasswordError("");
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswordData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error when user starts typing
		if (passwordError) {
			setPasswordError("");
		}
	};

	const handlePasswordSave = async () => {
		if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
			setPasswordError("All password fields are required");
			return;
		}

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setPasswordError("New passwords do not match");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters long");
			return;
		}

		setSaving(true);
		try {
			await fetchWithTokenRefresh("/api/users/me/password", {
				method: "PUT",
				body: JSON.stringify({
					currentPassword: passwordData.currentPassword,
					newPassword: passwordData.newPassword,
				}),
			});

			// Reset form and close editing
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
			setEditingSection(null);
			setPasswordError("");
			
			// Show success message (you can implement a toast notification here)
			alert("Password changed successfully!");
		} catch (error: any) {
			console.error("Error changing password:", error);
			setPasswordError(error.message || "Failed to change password");
		} finally {
			setSaving(false);
		}
	};

	const handleSave = async () => {
		if (!profile) return;

		// Validate phone number if editing personal section
		if (editingSection === "personal") {
			const phoneValidation = validatePhoneNumber(phoneNumber, {
				requireMobile: false, // Allow both mobile and landline for profile update
				allowLandline: true
			});

			if (!phoneValidation.isValid) {
				setPhoneError(phoneValidation.error || "Please enter a valid phone number");
				return;
			}
		}

		setSaving(true);
		try {
			const dataToSend = { ...formData };

			// Use the phoneNumber state for personal section
			if (editingSection === "personal") {
				dataToSend.phoneNumber = phoneNumber;
			}

			if (dataToSend.dateOfBirth) {
				// Keep the date as is since it's already in YYYY-MM-DD format
				// The API will handle the conversion to UTC
			}

			const response = await fetchWithTokenRefresh("/api/users/me", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataToSend),
			});

			// Since fetchWithTokenRefresh returns the parsed data directly on success,
			// we need to handle errors differently
			if (response && typeof response === 'object' && 'message' in response) {
				// This is an error response
				const errorData = response as { message: string };
				
				// Handle specific error cases
				if (errorData.message?.includes("already registered")) {
					setPhoneError("This phone number is already registered to another account. Please use a different number.");
					return;
				} else {
					throw new Error(errorData.message || "Failed to update profile");
				}
			}

			// If we get here, the response is the updated user data
			const updatedUser = response as UserProfile;
			
			if (updatedUser.dateOfBirth) {
				updatedUser.dateOfBirth = new Date(updatedUser.dateOfBirth)
					.toISOString()
					.split("T")[0];
			}
			
			setProfile(updatedUser);
			setEditingSection(null);
			// Reset phone number to updated profile value
			setPhoneNumber(updatedUser.phoneNumber || "");
			setPhoneError(null);
		} catch (error) {
			console.error("Error updating profile:", error);
			
			// Check if this is a phone number duplicate error
			if (error instanceof Error && error.message.includes("already registered")) {
				setPhoneError("This phone number is already registered to another account. Please use a different number.");
			} else {
				// For other errors, just log them - the user will see the form didn't save
				console.error("Profile update failed:", error instanceof Error ? error.message : "Unknown error");
			}
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout
				userName={profile?.fullName?.split(" ")[0] || "User"}
				title="Profile"
			>
				<div className="flex items-center justify-center h-full">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (!profile) {
		return (
			<DashboardLayout userName="User" title="Profile">
				<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
					<p className="text-gray-700 font-body">
						Failed to load profile information.
					</p>
				</div>
			</DashboardLayout>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		// Format in Malaysia timezone (GMT+8)
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "Asia/Kuala_Lumpur",
		});
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		// Format in Malaysia timezone (GMT+8)
		return date.toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
			timeZone: "Asia/Kuala_Lumpur",
		}) + " (GMT+8)";
	};

	const renderBadge = (status: boolean, label: string) => (
		<span
			className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium font-body ${
				status
					? "bg-green-100 text-green-700 border border-green-200"
					: "bg-amber-100 text-amber-700 border border-amber-200"
			}`}
		>
			<span
				className={`h-2 w-2 mr-1.5 rounded-full ${
					status ? "bg-green-500" : "bg-amber-500"
				}`}
			></span>
			{label}
		</span>
	);

	const renderEditButton = (section: EditingSections) => (
		<button
			onClick={() => handleEdit(section)}
			className="text-purple-primary hover:text-blue-tertiary flex items-center text-sm font-medium bg-purple-primary/5 px-3 py-1.5 rounded-lg hover:bg-purple-primary/10 transition-all duration-300 border border-purple-primary/20 font-body"
		>
			<PencilIcon className="h-4 w-4 mr-1" />
			Edit
		</button>
	);

	const renderSaveButtons = () => (
		<div className="flex justify-end space-x-3 mt-6">
			<button
				onClick={handleCancel}
				className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-body"
				disabled={saving}
			>
				Cancel
			</button>
			<button
				onClick={handleSave}
				className="px-6 py-3 text-sm font-medium text-white bg-purple-primary hover:bg-purple-600 rounded-lg transition-colors shadow-sm font-body"
				disabled={saving}
			>
				{saving ? "Saving..." : "Save Changes"}
			</button>
		</div>
	);

	const renderInput = (
		name: keyof UserProfile,
		label: string,
		type: string = "text",
		options?: readonly string[]
	) => {
		// Special handling for phone number
		if (name === "phoneNumber") {
			return (
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
						{label}
					</label>
					<div className="phone-input-wrapper">
						<PhoneInput
							country="my"
							value={phoneNumber}
							onChange={(value, data: CountryData) => {
								handlePhoneChange(value, data);
							}}
							inputProps={{
								id: "phoneNumber",
								name: "phoneNumber",
								required: true,
								placeholder: placeholder,
							}}
							containerClass="!w-full"
							inputClass="!w-full !h-12 !pl-20 !pr-4 !py-3 !text-base !font-body !bg-white !border !border-gray-200 !text-gray-700 !placeholder-gray-400 hover:!border-gray-400 focus:!ring-2 focus:!ring-purple-primary/20 focus:!border-purple-primary !transition-colors !rounded-lg"
							buttonClass="!h-12 !w-16 !border !border-gray-200 !bg-white hover:!bg-gray-50 !text-gray-700 !transition-colors !border-r-0 !rounded-l-lg"
							dropdownClass="!bg-white !border-gray-200 !text-gray-700 !shadow-xl !rounded-lg !mt-1 !max-h-60 !overflow-y-auto !min-w-72"
							searchClass="!bg-white !border-gray-200 !text-gray-700 !placeholder-gray-400"
							enableSearch
							disableSearchIcon
							searchPlaceholder="Search country..."
						/>
						{phoneError && (
							<p className="mt-1 text-sm text-red-600 font-body">
								{phoneError}
							</p>
						)}
					</div>
				</div>
			);
		}

		return (
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
					{label}
				</label>
				{options ? (
					<select
						name={name}
						value={String(formData[name] || "")}
						onChange={handleInputChange}
						className="block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary transition-colors font-body text-gray-700"
					>
						<option value="">Select {label}</option>
						{options.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				) : (
					<input
						type={type}
						name={name}
						value={String(formData[name] || "")}
						onChange={handleInputChange}
						className="block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary transition-colors font-body text-gray-700"
					/>
				)}
			</div>
		);
	};

	return (
		<>
			<style jsx global>{`
				/* Remove all shadows and focus styles from phone input */
				.react-tel-input *,
				.react-tel-input *:before,
				.react-tel-input *:after,
				.react-tel-input .flag-dropdown,
				.react-tel-input .form-control,
				.react-tel-input .selected-flag {
					outline: none !important;
					box-shadow: none !important;
					-webkit-box-shadow: none !important;
					-moz-box-shadow: none !important;
				}
				.react-tel-input .flag-dropdown:focus,
				.react-tel-input .form-control:focus,
				.react-tel-input .selected-flag:focus,
				.react-tel-input .flag-dropdown:hover,
				.react-tel-input .form-control:hover,
				.react-tel-input .selected-flag:hover,
				.react-tel-input .flag-dropdown:active,
				.react-tel-input .form-control:active,
				.react-tel-input .selected-flag:active {
					outline: none !important;
					box-shadow: none !important;
					-webkit-box-shadow: none !important;
					-moz-box-shadow: none !important;
				}

				/* Style the container wrapper */
				.phone-input-wrapper {
					position: relative;
				}
				.phone-input-wrapper:focus-within {
					box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
					border-radius: 0.5rem;
				}
				.phone-input-wrapper:focus-within
					.react-tel-input
					.flag-dropdown,
				.phone-input-wrapper:focus-within
					.react-tel-input
					.form-control {
					border-color: #7c3aed !important;
				}

				/* Remove all border radius from phone input */
				.react-tel-input,
				.react-tel-input > div {
					border-radius: 0.5rem !important;
				}

				.react-tel-input .flag-dropdown {
					background-color: white !important;
					border-color: rgb(229, 231, 235) !important;
				}
				.react-tel-input .flag-dropdown:hover {
					background-color: rgb(249, 250, 251) !important;
				}
				.react-tel-input .selected-flag {
					background-color: transparent !important;
					width: 100% !important;
					height: 100% !important;
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					padding: 0 !important;
					border: none !important;
				}
				.react-tel-input .selected-flag:hover {
					background-color: transparent !important;
				}
				.react-tel-input .country-list .country:hover {
					background-color: rgba(124, 58, 237, 0.1) !important;
					color: #7c3aed !important;
				}
				.react-tel-input .country-list .country.highlight {
					background-color: rgba(124, 58, 237, 0.2) !important;
					color: #7c3aed !important;
				}
			`}</style>
			<DashboardLayout
				userName={profile.fullName?.split(" ")[0] || "User"}
				title="Profile"
			>
				<div className="w-full bg-offwhite min-h-screen px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
					<div className="space-y-6">
						{/* Profile Header Card */}
						<div className="bg-purple-50 rounded-xl lg:rounded-2xl shadow-sm  transition-all border border-purple-primary/20 overflow-hidden">
							<div className="p-6 lg:p-8">
								<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
									<div className="flex items-center">
										<div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 border border-purple-primary/20">
											<UserCircleIcon className="h-10 w-10 lg:h-12 lg:w-12 text-purple-primary" />
										</div>
										<div>
											<h1 className="text-2xl lg:text-3xl font-heading font-bold text-gray-700 mb-1">
												{profile.fullName || "User Profile"}
											</h1>
											<p className="text-sm lg:text-base text-purple-primary font-semibold">
												{profile.phoneNumber}
											</p>
										</div>
									</div>
									<div className="flex items-center space-x-4">
										{renderBadge(profile.kycStatus, profile.kycStatus ? "KYC Verified" : "KYC Pending")}
										{renderBadge(profile.isOnboardingComplete, profile.isOnboardingComplete ? "Profile Complete" : "Profile Incomplete")}
									</div>
								</div>
							</div>
						</div>

						{/* Main Profile Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Personal Information Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<UserCircleIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Personal Information
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Basic details
												</p>
											</div>
										</div>
										{editingSection !== "personal" && renderEditButton("personal")}
									</div>

									{editingSection === "personal" ? (
										<div className="space-y-6">
											<div className="grid grid-cols-1 gap-4">
												{renderInput("fullName", "Full Name")}
												{renderInput("email", "Email", "email")}
												{renderInput("phoneNumber", "Phone Number", "tel")}
												{renderInput("dateOfBirth", "Date of Birth", "date")}
											</div>
											{renderSaveButtons()}
										</div>
									) : (
										<div className="space-y-4">
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<IdentificationIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Full Name
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.fullName || "Not provided"}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<EnvelopeIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Email
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.email || "Not provided"}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<PhoneIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Phone Number
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.phoneNumber}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<CalendarIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Date of Birth
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Not provided"}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Address Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<HomeIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Address
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Residential address
												</p>
											</div>
										</div>
										{editingSection !== "address" && renderEditButton("address")}
									</div>

									{editingSection === "address" ? (
										<div className="space-y-6">
											<div className="grid grid-cols-1 gap-4">
												{renderInput("address1", "Address Line 1")}
												{renderInput("address2", "Address Line 2")}
												<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
													{renderInput("city", "City")}
													{renderInput("state", "State")}
													{renderInput("zipCode", "Postal Code")}
												</div>
											</div>
											{renderSaveButtons()}
										</div>
									) : (
										<div className="space-y-4">
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<div className="flex items-start space-x-3">
													<MapPinIcon className="h-5 w-5 text-purple-primary flex-shrink-0 mt-0.5" />
													<div className="min-w-0 flex-1">
														<label className="block text-sm font-medium text-gray-500 font-body">
															Complete Address
														</label>
														<div className="mt-1 space-y-1">
															{profile.address1 && (
																<p className="text-base text-gray-700 font-body">
																	{profile.address1}
																</p>
															)}
															{profile.address2 && (
																<p className="text-base text-gray-700 font-body">
																	{profile.address2}
																</p>
															)}
															{(profile.city || profile.state || profile.zipCode) && (
																<p className="text-base text-gray-700 font-body">
																	{[profile.city, profile.state, profile.zipCode].filter(Boolean).join(", ")}
																</p>
															)}
															{!profile.address1 && !profile.address2 && !profile.city && (
																<p className="text-base text-gray-500 font-body italic">
																	Address not provided
																</p>
															)}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Second Row */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

							{/* Employment Information Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<BriefcaseIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Employment Information
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Work & income details
												</p>
											</div>
										</div>
										{editingSection !== "employment" && renderEditButton("employment")}
									</div>

									{editingSection === "employment" ? (
										<div className="space-y-6">
											<div className="grid grid-cols-1 gap-4">
												{renderInput("employmentStatus", "Employment Status", "text", employmentStatuses)}
												{formData.employmentStatus && 
													formData.employmentStatus !== "Student" && 
													formData.employmentStatus !== "Unemployed" && (
													renderInput("employerName", "Employer Name")
												)}
												{renderInput("monthlyIncome", "Monthly Income", "text", incomeRanges)}
											</div>
											{renderSaveButtons()}
										</div>
									) : (
										<div className="space-y-4">
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<BriefcaseIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Employment Status
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.employmentStatus || "Not provided"}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<BuildingOfficeIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Employer Name
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.employerName || "Not provided"}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<CurrencyDollarIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Monthly Income
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.monthlyIncome || "Not provided"}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Banking Information Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<BanknotesIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Banking Information
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Bank account details
												</p>
											</div>
										</div>
										{editingSection !== "banking" && renderEditButton("banking")}
									</div>

									{editingSection === "banking" ? (
										<div className="space-y-6">
											<div className="grid grid-cols-1 gap-4">
												{renderInput("bankName", "Bank Name")}
												{renderInput("accountNumber", "Account Number")}
											</div>
											{renderSaveButtons()}
										</div>
									) : (
										<div className="space-y-4">
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<BanknotesIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Bank Name
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.bankName || "Not provided"}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
													<div className="flex items-center space-x-3">
														<ShieldCheckIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
														<div className="min-w-0">
															<label className="block text-sm font-medium text-gray-500 font-body">
																Account Number
															</label>
															<p className="mt-1 text-base text-gray-700 font-body truncate">
																{profile.accountNumber ? "••••" + profile.accountNumber.slice(-4) : "Not provided"}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Full Width Cards */}
						<div className="grid grid-cols-1 gap-6">

							{/* Password & Security Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<ShieldCheckIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Password & Security
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Account security settings
												</p>
											</div>
										</div>
										{editingSection !== "password" && renderEditButton("password")}
									</div>

									{editingSection === "password" ? (
										<div className="space-y-6">
											{passwordError && (
												<div className="bg-red-50 border border-red-200 rounded-lg p-4">
													<p className="text-sm text-red-700 font-body">{passwordError}</p>
												</div>
											)}
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
														Current Password
													</label>
													<input
														type="password"
														name="currentPassword"
														value={passwordData.currentPassword}
														onChange={handlePasswordChange}
														className="block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary transition-colors font-body text-gray-700"
														placeholder="Enter your current password"
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
														New Password
													</label>
													<input
														type="password"
														name="newPassword"
														value={passwordData.newPassword}
														onChange={handlePasswordChange}
														className="block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary transition-colors font-body text-gray-700"
														placeholder="Enter your new password"
													/>
													<p className="mt-1 text-sm text-gray-500 font-body">
														Password must be at least 8 characters long
													</p>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2 font-body">
														Confirm New Password
													</label>
													<input
														type="password"
														name="confirmPassword"
														value={passwordData.confirmPassword}
														onChange={handlePasswordChange}
														className="block w-full h-12 px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-primary/20 focus:border-purple-primary transition-colors font-body text-gray-700"
														placeholder="Confirm your new password"
													/>
												</div>
											</div>
											<div className="flex justify-end space-x-3">
												<button
													onClick={handleCancel}
													className="px-6 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors font-body"
													disabled={saving}
												>
													Cancel
												</button>
												<button
													onClick={handlePasswordSave}
													className="px-6 py-3 text-sm font-medium text-white bg-purple-primary hover:bg-purple-600 rounded-lg transition-colors shadow-sm font-body"
													disabled={saving}
												>
													{saving ? "Changing Password..." : "Change Password"}
												</button>
											</div>
										</div>
									) : (
										<div className="space-y-4">
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<div className="flex items-center space-x-3">
													<ShieldCheckIcon className="h-5 w-5 text-purple-primary" />
													<div>
														<label className="block text-sm font-medium text-gray-500 font-body">
															Password
														</label>
														<p className="mt-2 text-base text-gray-700 font-body">
															••••••••••••
														</p>
													</div>
												</div>
											</div>
											<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
												<div className="flex items-start space-x-3">
													<ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
													<div>
														<p className="text-sm font-medium text-blue-800 font-body">
															Security Tip
														</p>
														<p className="mt-1 text-sm text-blue-700 font-body">
															Use a strong password with at least 8 characters. Consider using a mix of letters, numbers, and symbols.
														</p>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Account Information Card */}
							<div className="bg-white rounded-xl lg:rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
								<div className="p-6 lg:p-8">
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center">
											<div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-primary/10 rounded-xl flex items-center justify-center mr-3">
												<ClockIcon className="h-6 w-6 lg:h-7 lg:w-7 text-purple-primary" />
											</div>
											<div>
												<h3 className="text-lg lg:text-xl font-heading font-bold text-gray-700 mb-1">
													Account Information
												</h3>
												<p className="text-sm lg:text-base text-purple-primary font-semibold">
													Account timeline & status
												</p>
											</div>
										</div>
									</div>

									<div className="space-y-6">
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<div className="flex items-center space-x-3">
													<CalendarIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
													<div className="min-w-0">
														<label className="block text-sm font-medium text-gray-500 font-body">
															Member Since
														</label>
														<p className="mt-1 text-base text-gray-700 font-body truncate">
															{formatDate(profile.createdAt)}
														</p>
													</div>
												</div>
											</div>
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<div className="flex items-center space-x-3">
													<ClockIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
													<div className="min-w-0">
														<label className="block text-sm font-medium text-gray-500 font-body">
															Last Updated
														</label>
														<p className="mt-1 text-base text-gray-700 font-body truncate">
															{formatDateTime(profile.updatedAt)}
														</p>
													</div>
												</div>
											</div>
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<div className="flex items-center space-x-3">
													<ClockIcon className="h-5 w-5 text-purple-primary flex-shrink-0" />
													<div className="min-w-0">
														<label className="block text-sm font-medium text-gray-500 font-body">
															Last Login
														</label>
														<p className="mt-1 text-base text-gray-700 font-body truncate">
															{profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : "Not available"}
														</p>
													</div>
												</div>
											</div>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<label className="block text-sm font-medium text-gray-500 mb-2 font-body">
													Onboarding Status
												</label>
												<div className="mt-2">
													{renderBadge(
														profile.isOnboardingComplete,
														profile.isOnboardingComplete
															? "Complete"
															: `In Progress (Step ${profile.onboardingStep}/4)`
													)}
												</div>
											</div>
											<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
												<label className="block text-sm font-medium text-gray-500 mb-2 font-body">
													KYC Status
												</label>
												<div className="mt-2">
													{renderBadge(
														profile.kycStatus,
														profile.kycStatus
															? "Verified"
															: "Not Verified"
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</>
	);
}
