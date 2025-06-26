"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
	HomeIcon,
	WalletIcon,
	StarIcon,
	BanknotesIcon,
	ArrowPathIcon,
	Cog6ToothIcon,
	PlusIcon,
	UserIcon,
} from "@heroicons/react/24/outline";

const navigation = [
	{
		name: "Overview",
		href: "/dashboard",
		icon: <HomeIcon className="h-5 w-5" />,
	},
	{
		name: "Wallet",
		href: "/dashboard/wallet",
		icon: <WalletIcon className="h-5 w-5" />,
	},
	{
		name: "Credit Score",
		href: "/dashboard/credit-score",
		icon: <StarIcon className="h-5 w-5" />,
	},
	{
		name: "Loans & Applications",
		href: "/dashboard/loans",
		icon: <BanknotesIcon className="h-5 w-5" />,
	},
	{
		name: "Transactions",
		href: "/dashboard/transactions",
		icon: <ArrowPathIcon className="h-5 w-5" />,
	},
	// {
	// 	name: "Settings",
	// 	href: "/dashboard/settings",
	// 	icon: <Cog6ToothIcon className="h-5 w-5" />,
	// },
];

export default function DashboardNav() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col h-full bg-white border-r border-purple-primary/20">
			<div className="p-4 flex justify-center">
				<Logo size="lg" variant="white" linkTo="/dashboard" />
			</div>

			<nav className="flex-1 p-4 space-y-1">
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 font-body ${
								isActive
									? "bg-purple-primary/20 text-purple-primary border border-purple-primary/30 shadow-lg shadow-purple-primary/10"
									: "text-gray-700 hover:bg-purple-primary/5 hover:text-purple-primary hover:border-purple-primary/20 border border-transparent"
							}`}
						>
							<span
								className={`mr-3 transition-colors duration-200 ${
									isActive
										? "text-purple-primary"
										: "text-gray-500 group-hover:text-purple-primary"
								}`}
							>
								{item.icon}
							</span>
							{item.name}
						</Link>
					);
				})}
			</nav>

			{/* Featured Apply Button - Moved to bottom for better visual hierarchy */}
			<div className="px-4 pb-4">
				<Link
					href="/dashboard/apply"
					className="group relative flex items-center w-full px-4 py-3 text-sm font-medium text-purple-primary bg-purple-primary/5 hover:bg-purple-primary/10 rounded-xl transition-all duration-200 border border-purple-primary/20 hover:border-purple-primary/30 font-body"
				>
					<PlusIcon className="w-5 h-5 mr-3 text-purple-primary group-hover:rotate-90 transition-transform duration-200" />
					<span className="font-semibold">Apply for a Loan</span>
				</Link>
			</div>

			<div className="p-4 border-t border-purple-primary/20">
				<Link
					href="/dashboard/profile"
					className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-purple-primary/5 hover:text-purple-primary transition-all duration-200 border border-transparent hover:border-purple-primary/20 font-body group"
				>
					<UserIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-purple-primary transition-colors duration-200" />
					Profile
				</Link>
			</div>
		</div>
	);
}
