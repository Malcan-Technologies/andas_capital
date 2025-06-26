"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
	HomeIcon,
	UserGroupIcon,
	DocumentTextIcon,
	BanknotesIcon,
	ChartBarIcon,
	Cog6ToothIcon,
	Bars3Icon,
	XMarkIcon,
	ArrowPathIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	CheckCircleIcon,
	ClockIcon,
	BellIcon,
	CubeIcon,
	CreditCardIcon,
	ReceiptPercentIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
	AdminTokenStorage,
	fetchWithAdminTokenRefresh,
	checkAdminAuth,
} from "../../lib/authUtils";
import Logo from "./Logo";

interface AdminLayoutProps {
	children: React.ReactNode;
	userName?: string;
	title?: string;
	description?: string;
}

export default function AdminLayout({
	children,
	userName = "Admin",
	title = "Admin Dashboard",
	description = "Overview of your Kapital's performance",
}: AdminLayoutProps) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [adminName, setAdminName] = useState(userName);
	const [loanWorkflowOpen, setLoanWorkflowOpen] = useState(false);
	const [managementOpen, setManagementOpen] = useState(false);
	const [applicationsOpen, setApplicationsOpen] = useState(false);
	const [loansOpen, setLoansOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	// Function to check if a navigation item is active
	const isActive = (href: string) => {
		if (href === "/dashboard") {
			return pathname === "/dashboard";
		}

		// Handle query parameters for filtered pages
		if (href.includes("?")) {
			const [basePath, queryString] = href.split("?");
			if (pathname === basePath) {
				// Check if current URL contains the same query parameters
				if (typeof window !== "undefined") {
					const currentParams = new URLSearchParams(
						window.location.search
					);
					const targetParams = new URLSearchParams(queryString);

					// Check if all target parameters match current parameters
					const targetEntries = Array.from(targetParams.entries());
					for (const [key, value] of targetEntries) {
						if (currentParams.get(key) !== value) {
							return false;
						}
					}
					return true;
				}
			}
			return false;
		}

		return pathname.startsWith(href);
	};

	useEffect(() => {
		// Check if user is authenticated
		const checkAuthentication = async () => {
			try {
				console.log("AdminLayout - Starting authentication check");
				const accessToken = AdminTokenStorage.getAccessToken();
				const refreshToken = AdminTokenStorage.getRefreshToken();

				console.log("AdminLayout - Tokens exist:", {
					accessToken: !!accessToken,
					refreshToken: !!refreshToken,
				});

				const isAuthenticated = await checkAdminAuth();
				console.log("AdminLayout - isAuthenticated:", isAuthenticated);

				if (!isAuthenticated) {
					console.log(
						"AdminLayout - Not authenticated, redirecting to login"
					);
					router.push("/login");
					return;
				}

				// Fetch admin user information
				try {
					console.log("AdminLayout - Fetching user data");
					const userData = await fetchWithAdminTokenRefresh<any>(
						"/api/admin/me"
					);
					console.log("AdminLayout - User data:", userData);

					if (userData.fullName) {
						setAdminName(userData.fullName);
					}
				} catch (error) {
					console.error(
						"AdminLayout - Error fetching admin info:",
						error
					);
				} finally {
					setLoading(false);
				}
			} catch (error) {
				console.error("AdminLayout - Auth check failed:", error);
				router.push("/login");
			}
		};

		checkAuthentication();
	}, [router]);

	const handleLogout = async () => {
		try {
			const refreshToken = AdminTokenStorage.getRefreshToken();

			if (refreshToken) {
				// Call the logout API
				await fetch("/api/admin/logout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${
							AdminTokenStorage.getAccessToken() || ""
						}`,
					},
					body: JSON.stringify({ refreshToken }),
				});
			}

			// Clear tokens regardless of API response
			AdminTokenStorage.clearTokens();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			// Clear tokens even if the API call fails
			AdminTokenStorage.clearTokens();
			router.push("/login");
		}
	};

	const navigation = [
		{ name: "Dashboard", href: "/dashboard", icon: HomeIcon },
		{
			name: "Disbursements",
			href: "/dashboard/disbursements",
			icon: CreditCardIcon,
		},
		{
			name: "Payments",
			href: "/dashboard/payments",
			icon: ReceiptPercentIcon,
		},
		{
			name: "Overdue Payments",
			href: "/dashboard/late-fees",
			icon: ExclamationTriangleIcon,
		},
		{ name: "Users", href: "/dashboard/users", icon: UserGroupIcon },
		{ name: "Reports", href: "/dashboard/reports", icon: ChartBarIcon },
	];

	const loanWorkflowItems = [
		{
			name: "All Applications",
			href: "/dashboard/applications",
			icon: DocumentTextIcon,
			subItems: [
				{
					name: "Pending Approval",
					href: "/dashboard/applications?filter=pending-approval",
					icon: ClockIcon,
				},
				{
					name: "Pending Disbursement",
					href: "/dashboard/applications?filter=pending-disbursement",
					icon: CheckCircleIcon,
				},
			],
		},
		{
			name: "All Loans",
			href: "/dashboard/loans",
			icon: BanknotesIcon,
			subItems: [
				{
					name: "Pending Discharge",
					href: "/dashboard/loans?filter=pending_discharge",
					icon: ClockIcon,
				},
			],
		},
		{
			name: "Workflow Overview",
			href: "/dashboard/applications/workflow",
			icon: ArrowPathIcon,
		},
	];

	const managementItems = [
		{
			name: "Products",
			href: "/dashboard/products",
			icon: CubeIcon,
		},
		{
			name: "Notifications",
			href: "/dashboard/notifications",
			icon: BellIcon,
		},
		{
			name: "Settings",
			href: "/dashboard/settings",
			icon: Cog6ToothIcon,
		},
	];

	// Function to check if any sub-item in a dropdown is active
	const isDropdownActive = (items: any[]) => {
		return items.some((item) => isActive(item.href));
	};

	// Auto-expand dropdowns based on current path
	useEffect(() => {
		const isLoanPath = loanWorkflowItems.some((item) => {
			const isMainActive = isActive(item.href);
			const isSubActive = item.subItems?.some((subItem) =>
				isActive(subItem.href)
			);
			return isMainActive || isSubActive;
		});
		const isManagementPath = managementItems.some((item) =>
			isActive(item.href)
		);

		// Check for specific applications and loans paths
		const isApplicationsPath = pathname.startsWith(
			"/dashboard/applications"
		);
		const isLoansPath = pathname.startsWith("/dashboard/loans");

		setLoanWorkflowOpen(isLoanPath);
		setManagementOpen(isManagementPath);
		setApplicationsOpen(isApplicationsPath);
		setLoansOpen(isLoansPath);
	}, [pathname]);

	// Function to render navigation items
	const renderNavigation = (isMobile = false) => {
		const getBaseClasses = (active: boolean) => {
			const baseSize = isMobile
				? "group flex items-center rounded-md px-2 py-2 text-base font-medium transition-colors duration-200"
				: "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-200";

			return active
				? `${baseSize} bg-blue-600/20 text-blue-200 border border-blue-500/30`
				: `${baseSize} text-gray-300 hover:bg-gray-800/50 hover:text-white`;
		};

		const getIconClasses = (active: boolean) => {
			const baseSize = isMobile
				? "mr-4 h-6 w-6 flex-shrink-0"
				: "mr-3 h-6 w-6 flex-shrink-0";

			return active
				? `${baseSize} text-blue-300`
				: `${baseSize} text-gray-400 group-hover:text-gray-300`;
		};

		const getSubItemClasses = (active: boolean) => {
			const baseSize = isMobile
				? "group flex items-center rounded-md px-2 py-2 pl-11 text-sm font-medium transition-colors duration-200"
				: "group flex items-center rounded-md px-2 py-2 pl-9 text-sm font-medium transition-colors duration-200";

			return active
				? `${baseSize} bg-blue-600/20 text-blue-200 border border-blue-500/30`
				: `${baseSize} text-gray-400 hover:bg-gray-800/30 hover:text-gray-200`;
		};

		const getSubIconClasses = (active: boolean) => {
			const baseSize = isMobile
				? "mr-3 h-5 w-5 flex-shrink-0"
				: "mr-3 h-5 w-5 flex-shrink-0";

			return active
				? `${baseSize} text-blue-300`
				: `${baseSize} text-gray-500 group-hover:text-gray-400`;
		};

		const getSubSubItemClasses = (active: boolean) => {
			const baseSize = isMobile
				? "group flex items-center rounded-md px-2 py-2 pl-16 text-sm transition-colors duration-200"
				: "group flex items-center rounded-md px-2 py-2 pl-14 text-sm transition-colors duration-200";

			return active
				? `${baseSize} text-blue-200 font-semibold`
				: `${baseSize} text-gray-400 hover:text-gray-200`;
		};

		const getSubSubIconClasses = (active: boolean) => {
			const baseSize = isMobile
				? "mr-3 h-4 w-4 flex-shrink-0"
				: "mr-3 h-4 w-4 flex-shrink-0";

			return active
				? `${baseSize} text-blue-300`
				: `${baseSize} text-gray-500 group-hover:text-gray-400`;
		};

		return (
			<>
				{navigation.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.name}
							href={item.href}
							className={getBaseClasses(active)}
						>
							<item.icon className={getIconClasses(active)} />
							{item.name}
						</Link>
					);
				})}

				{/* Loans Dropdown */}
				<div>
					<button
						onClick={() => setLoanWorkflowOpen(!loanWorkflowOpen)}
						className={getBaseClasses(false)}
					>
						<DocumentTextIcon className={getIconClasses(false)} />
						Loans
						{loanWorkflowOpen ? (
							<ChevronDownIcon className="ml-auto h-5 w-5 text-gray-400" />
						) : (
							<ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
						)}
					</button>
					{loanWorkflowOpen && (
						<div className="mt-1 space-y-1">
							{loanWorkflowItems.map((item) => {
								const active = isActive(item.href);
								const hasSubItems =
									item.subItems && item.subItems.length > 0;
								const isExpanded =
									(item.name === "All Applications" &&
										applicationsOpen) ||
									(item.name === "All Loans" && loansOpen);

								return (
									<div key={item.name}>
										{hasSubItems ? (
											<div className="flex items-center">
												<Link
													href={item.href}
													className={`${getSubItemClasses(
														active
													)} flex-1 mr-2`}
												>
													<item.icon
														className={getSubIconClasses(
															active
														)}
													/>
													{item.name}
												</Link>
												<button
													onClick={() => {
														if (
															item.name ===
															"All Applications"
														) {
															setApplicationsOpen(
																!applicationsOpen
															);
														} else if (
															item.name ===
															"All Loans"
														) {
															setLoansOpen(
																!loansOpen
															);
														}
													}}
													className="p-1 rounded hover:bg-gray-800/30 transition-colors"
												>
													{isExpanded ? (
														<ChevronDownIcon className="h-4 w-4 text-gray-400" />
													) : (
														<ChevronRightIcon className="h-4 w-4 text-gray-400" />
													)}
												</button>
											</div>
										) : (
											<Link
												href={item.href}
												className={getSubItemClasses(
													active
												)}
											>
												<item.icon
													className={getSubIconClasses(
														active
													)}
												/>
												{item.name}
											</Link>
										)}

										{hasSubItems && isExpanded && (
											<div className="mt-1 space-y-1">
												{item.subItems.map(
													(subItem) => {
														const subActive =
															isActive(
																subItem.href
															);
														return (
															<Link
																key={
																	subItem.name
																}
																href={
																	subItem.href
																}
																className={getSubSubItemClasses(
																	subActive
																)}
															>
																<subItem.icon
																	className={getSubSubIconClasses(
																		subActive
																	)}
																/>
																{subItem.name}
															</Link>
														);
													}
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Management Dropdown */}
				<div>
					<button
						onClick={() => setManagementOpen(!managementOpen)}
						className={getBaseClasses(false)}
					>
						<Cog6ToothIcon className={getIconClasses(false)} />
						Management
						{managementOpen ? (
							<ChevronDownIcon className="ml-auto h-5 w-5 text-gray-400" />
						) : (
							<ChevronRightIcon className="ml-auto h-5 w-5 text-gray-400" />
						)}
					</button>
					{managementOpen && (
						<div className="mt-1 space-y-1">
							{managementItems.map((item) => {
								const active = isActive(item.href);
								return (
									<Link
										key={item.name}
										href={item.href}
										className={getSubItemClasses(active)}
									>
										<item.icon
											className={getSubIconClasses(
												active
											)}
										/>
										{item.name}
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-900">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Mobile sidebar */}
			<div
				className={`fixed inset-0 z-40 lg:hidden ${
					sidebarOpen ? "" : "hidden"
				}`}
			>
				<div
					className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"
					onClick={() => setSidebarOpen(false)}
				></div>
				<div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-md border-r border-gray-700/30">
					<div className="flex h-16 items-center justify-between px-4">
						<div className="flex items-center">
							<Logo
								size="md"
								variant="black"
								linkTo="/dashboard"
							/>
							<span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-amber-600 rounded-full">
								Admin
							</span>
						</div>
						<button
							onClick={() => setSidebarOpen(false)}
							className="text-gray-400 hover:text-white"
						>
							<XMarkIcon className="h-6 w-6" />
						</button>
					</div>
					<div className="flex-1 overflow-y-auto">
						<nav className="px-2 py-4 space-y-1">
							{renderNavigation(true)}
						</nav>
					</div>
					<div className="border-t border-gray-700/30 p-4">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
									<span className="text-gray-200 font-medium">
										{adminName.charAt(0)}
									</span>
								</div>
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-200">
									{adminName}
								</p>
								<button
									onClick={handleLogout}
									className="text-xs font-medium text-gray-400 hover:text-gray-200"
								>
									Logout
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
				<div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-md border-r border-gray-700/30">
					<div className="flex h-16 items-center px-4">
						<Logo size="md" variant="black" linkTo="/dashboard" />
						<span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-amber-600 rounded-full">
							Admin
						</span>
					</div>
					<div className="flex-1 overflow-y-auto">
						<nav className="px-2 py-4 space-y-1">
							{renderNavigation(false)}
						</nav>
					</div>
					<div className="border-t border-gray-700/30 p-4">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
									<span className="text-gray-200 font-medium">
										{adminName.charAt(0)}
									</span>
								</div>
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-200">
									{adminName}
								</p>
								<button
									onClick={handleLogout}
									className="text-xs font-medium text-gray-400 hover:text-gray-200"
								>
									Logout
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main content */}
			<div className="lg:pl-64">
				<div className="sticky top-0 z-10 flex h-24 flex-shrink-0 bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 shadow-xl">
					<button
						type="button"
						className="border-r border-gray-700/50 px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
						onClick={() => setSidebarOpen(true)}
					>
						<span className="sr-only">Open sidebar</span>
						<Bars3Icon className="h-6 w-6" aria-hidden="true" />
					</button>
					<div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
						<div className="flex items-center">
							<div>
								<h1 className="text-2xl font-bold text-white">
									{title}
								</h1>
								<p className="text-sm text-gray-400">
									{description}
								</p>
							</div>
						</div>
						<div className="ml-4 flex items-center md:ml-6">
							<div className="flex items-center space-x-4">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
											<span className="text-gray-200 text-sm font-medium">
												{adminName.charAt(0)}
											</span>
										</div>
									</div>
									<div className="ml-3 hidden md:block">
										<p className="text-sm font-medium text-gray-200">
											{adminName}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<main className="flex-1">
					<div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
				</main>
			</div>
		</div>
	);
}
