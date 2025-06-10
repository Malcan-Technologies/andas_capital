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
			>
				<div className="flex items-center justify-center h-full">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
				</div>
			</DashboardLayout>
		);
	}

	if (!profile) {
		return (
			<DashboardLayout userName="User">
				<div className="bg-gradient-to-br from-red-700/70 via-red-700/70 to-rose-800/70 rounded-2xl p-6 backdrop-blur-md">
					<p className="text-white">
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
			className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
				status
					? "bg-green-500/20 text-green-200 border border-green-400/20"
					: "bg-yellow-500/20 text-yellow-200 border border-yellow-400/20"
			}`}
		>
			<span
				className={`h-2 w-2 mr-1.5 rounded-full ${
					status ? "bg-green-400" : "bg-yellow-400"
				}`}
			></span>
			{label}
		</span>
	);

	const renderEditButton = (section: EditingSections) => (
		<button
			onClick={() => handleEdit(section)}
			className="text-blue-200 hover:text-blue-100 flex items-center text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10"
		>
			<PencilIcon className="h-4 w-4 mr-1" />
			Edit
		</button>
	);

	const renderSaveButtons = () => (
		<div className="flex justify-end space-x-3 mt-6">
			<button
				onClick={handleCancel}
				className="px-6 py-3 text-sm font-medium text-white/80 hover:text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-md"
				disabled={saving}
			>
				Cancel
			</button>
			<button
				onClick={handleSave}
				className="px-6 py-3 text-sm font-medium text-white bg-blue-500/80 hover:bg-blue-500/90 rounded-lg transition-colors backdrop-blur-md border border-blue-400/50"
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
			<label className="block text-sm font-medium text-blue-100 mb-2">
				{label}
			</label>
			{options ? (
				<select
					name={name}
					value={String(formData[name] || "")}
					onChange={handleInputChange}
					className="block w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500/50 focus:ring-blue-500/50 text-base py-3 px-4 backdrop-blur-md transition-colors"
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
					className="block w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50 focus:border-blue-500/50 focus:ring-blue-500/50 text-base py-3 px-4 backdrop-blur-md transition-colors"
				/>
			)}
		</div>
	);

	const renderInfoCard = (
		title: string,
		icon: React.ReactNode,
		section: EditingSections,
		content: React.ReactNode,
		titleColor: string
	) => (
		<div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-2xl shadow-2xl text-white overflow-hidden">
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center space-x-3">
						<div
							className={`p-3 ${titleColor} rounded-xl backdrop-blur-md border border-white/20`}
						>
							{icon}
						</div>
						<h2 className={`text-xl font-bold ${titleColor}`}>
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
		<div className="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/10">
			{icon && <div className="flex-shrink-0 text-blue-200">{icon}</div>}
			<div>
				<label className="block text-sm font-medium text-blue-100">
					{label}
				</label>
				<p className="mt-2 text-base text-white">
					{value || "Not provided"}
				</p>
			</div>
		</div>
	);

	return (
		<DashboardLayout userName={profile.fullName?.split(" ")[0] || "User"}>
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Personal Information */}
				{renderInfoCard(
					"Personal Information",
					<UserCircleIcon className="h-8 w-8 text-white" />,
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
						<div className="space-y-4">
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
					"text-violet-300"
				)}

				{/* Address */}
				{renderInfoCard(
					"Address",
					<HomeIcon className="h-8 w-8 text-white" />,
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
					"text-blue-300"
				)}

				{/* Employment */}
				{renderInfoCard(
					"Employment Information",
					<BriefcaseIcon className="h-8 w-8 text-white" />,
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
					"text-emerald-300"
				)}

				{/* Banking Information */}
				{renderInfoCard(
					"Banking Information",
					<BanknotesIcon className="h-8 w-8 text-white" />,
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
					"text-amber-300"
				)}

				{/* Account Information */}
				{renderInfoCard(
					"Account Information",
					<ClockIcon className="h-8 w-8 text-white" />,
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
							<div className="bg-white/5 p-4 rounded-lg border border-white/10">
								<label className="block text-sm font-medium text-blue-100 mb-2">
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
							<div className="bg-white/5 p-4 rounded-lg border border-white/10">
								<label className="block text-sm font-medium text-blue-100 mb-2">
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
					"text-gray-300"
				)}
			</div>
		</DashboardLayout>
	);
}
