"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
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
	postalCode: string | null;
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

type EditingSections = "personal" | "address" | "employment" | "banking" | null;

export default function ProfilePage() {
	const router = useRouter();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingSection, setEditingSection] = useState<EditingSections>(null);
	const [formData, setFormData] = useState<Partial<UserProfile>>({});

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
			} catch (error) {
				console.error("Error fetching profile:", error);
				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [router]);

	const handleEdit = (section: EditingSections) => {
		setEditingSection(section);
	};

	const handleCancel = () => {
		setEditingSection(null);
		setFormData(profile || {});
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

	const handleSave = async () => {
		if (!profile) return;

		setSaving(true);
		try {
			const dataToSend = { ...formData };

			if (dataToSend.dateOfBirth) {
				// Keep the date as is since it's already in YYYY-MM-DD format
				// The API will handle the conversion to UTC
			}

			// Use token refresh utility to update the profile
			const updatedData = await fetchWithTokenRefresh<UserProfile>(
				"/api/users/me",
				{
					method: "PUT",
					body: JSON.stringify(dataToSend),
				}
			);

			if (updatedData.dateOfBirth) {
				updatedData.dateOfBirth = new Date(updatedData.dateOfBirth)
					.toISOString()
					.split("T")[0];
			}
			setProfile(updatedData);
			setEditingSection(null);
		} catch (error) {
			console.error("Error updating profile:", error);
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
		// Convert to GMT+8
		const gmt8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);

		return gmt8Date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		// Convert to GMT+8
		const gmt8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);

		return (
			gmt8Date.toLocaleString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
				timeZone: "UTC",
			}) + " GMT+8"
		);
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
	) => (
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

	const renderInfoCard = (
		title: string,
		icon: React.ReactNode,
		section: EditingSections,
		content: React.ReactNode,
		iconColor: string
	) => (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center space-x-3">
						<div
							className={`p-2 ${iconColor} rounded-lg border ${iconColor
								.replace("bg-", "border-")
								.replace("/10", "/20")}`}
						>
							{icon}
						</div>
						<h2 className="text-xl font-bold font-heading text-purple-primary">
							{title}
						</h2>
					</div>
					{editingSection !== section && renderEditButton(section)}
				</div>
				{content}
			</div>
		</div>
	);

	const renderField = (
		label: string,
		value: string | null,
		icon?: React.ReactNode
	) => (
		<div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
			{icon && (
				<div className="flex-shrink-0 text-purple-primary">{icon}</div>
			)}
			<div>
				<label className="block text-sm font-medium text-gray-500 font-body">
					{label}
				</label>
				<p className="mt-2 text-base text-gray-700 font-body">
					{value || "Not provided"}
				</p>
			</div>
		</div>
	);

	return (
		<DashboardLayout
			userName={profile.fullName?.split(" ")[0] || "User"}
			title="Profile"
		>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Personal Information */}
				{renderInfoCard(
					"Personal Information",
					<UserCircleIcon className="h-6 w-6 text-purple-primary" />,
					"personal",
					editingSection === "personal" ? (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{renderInput("fullName", "Full Name")}
								{renderInput("email", "Email", "email")}
								{renderInput(
									"phoneNumber",
									"Phone Number",
									"tel"
								)}
								{renderInput(
									"dateOfBirth",
									"Date of Birth",
									"date"
								)}
							</div>
							{renderSaveButtons()}
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{renderField(
								"Full Name",
								profile.fullName,
								<IdentificationIcon className="h-5 w-5" />
							)}
							{renderField(
								"Email",
								profile.email,
								<EnvelopeIcon className="h-5 w-5" />
							)}
							{renderField(
								"Phone Number",
								profile.phoneNumber,
								<PhoneIcon className="h-5 w-5" />
							)}
							{renderField(
								"Date of Birth",
								profile.dateOfBirth
									? formatDate(profile.dateOfBirth)
									: null,
								<CalendarIcon className="h-5 w-5" />
							)}
						</div>
					),
					"bg-purple-primary/10"
				)}

				{/* Address */}
				{renderInfoCard(
					"Address",
					<HomeIcon className="h-6 w-6 text-purple-primary" />,
					"address",
					editingSection === "address" ? (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="md:col-span-2">
									{renderInput("address1", "Address Line 1")}
								</div>
								<div className="md:col-span-2">
									{renderInput("address2", "Address Line 2")}
								</div>
								{renderInput("city", "City")}
								{renderInput("state", "State")}
								{renderInput("postalCode", "Postal Code")}
							</div>
							{renderSaveButtons()}
						</div>
					) : (
						<div className="space-y-4">
							{renderField(
								"Address Line 1",
								profile.address1,
								<MapPinIcon className="h-5 w-5" />
							)}
							{renderField("Address Line 2", profile.address2)}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{renderField("City", profile.city)}
								{renderField("State", profile.state)}
								{renderField("Postal Code", profile.postalCode)}
							</div>
						</div>
					),
					"bg-purple-primary/10"
				)}

				{/* Employment */}
				{renderInfoCard(
					"Employment Information",
					<BriefcaseIcon className="h-6 w-6 text-purple-primary" />,
					"employment",
					editingSection === "employment" ? (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{renderInput(
									"employmentStatus",
									"Employment Status",
									"text",
									employmentStatuses
								)}
								{formData.employmentStatus &&
									formData.employmentStatus !== "Student" &&
									formData.employmentStatus !==
										"Unemployed" && (
										<>
											{renderInput(
												"employerName",
												"Employer Name"
											)}
										</>
									)}
								{renderInput(
									"monthlyIncome",
									"Monthly Income",
									"text",
									incomeRanges
								)}
							</div>
							{renderSaveButtons()}
						</div>
					) : (
						<div className="space-y-4">
							{renderField(
								"Employment Status",
								profile.employmentStatus,
								<BriefcaseIcon className="h-5 w-5" />
							)}
							{renderField(
								"Employer Name",
								profile.employerName,
								<BuildingOfficeIcon className="h-5 w-5" />
							)}
							{renderField(
								"Monthly Income",
								profile.monthlyIncome,
								<CurrencyDollarIcon className="h-5 w-5" />
							)}
						</div>
					),
					"bg-purple-primary/10"
				)}

				{/* Banking Information */}
				{renderInfoCard(
					"Banking Information",
					<BanknotesIcon className="h-6 w-6 text-purple-primary" />,
					"banking",
					editingSection === "banking" ? (
						<div className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{renderInput("bankName", "Bank Name")}
								{renderInput("accountNumber", "Account Number")}
							</div>
							{renderSaveButtons()}
						</div>
					) : (
						<div className="space-y-4">
							{renderField(
								"Bank Name",
								profile.bankName,
								<BanknotesIcon className="h-5 w-5" />
							)}
							{renderField(
								"Account Number",
								profile.accountNumber
									? "••••" + profile.accountNumber.slice(-4)
									: null,
								<ShieldCheckIcon className="h-5 w-5" />
							)}
						</div>
					),
					"bg-purple-primary/10"
				)}

				{/* Account Information */}
				{renderInfoCard(
					"Account Information",
					<ClockIcon className="h-6 w-6 text-purple-primary" />,
					null,
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{renderField(
								"Member Since",
								formatDate(profile.createdAt),
								<CalendarIcon className="h-5 w-5" />
							)}
							{renderField(
								"Last Updated",
								formatDate(profile.updatedAt),
								<ClockIcon className="h-5 w-5" />
							)}
							{renderField(
								"Last Login",
								profile.lastLoginAt
									? formatDateTime(profile.lastLoginAt)
									: "Not available",
								<ClockIcon className="h-5 w-5" />
							)}
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
					</div>,
					"bg-purple-primary/10"
				)}
			</div>
		</DashboardLayout>
	);
}
