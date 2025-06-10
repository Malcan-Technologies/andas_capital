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
		<div className="flex flex-col h-full bg-gray-800 border-r border-gray-700">
			<div className="p-4">
				<Logo />
			</div>

			<div className="p-4">
				<Link
					href="/dashboard/apply"
					className="flex items-center justify-center w-full px-4 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600/90 to-blue-600/90 hover:from-indigo-600 hover:to-blue-600 rounded-lg transition-all duration-200 backdrop-blur-sm border border-indigo-400/30 hover:border-indigo-400/50 shadow-lg hover:shadow-indigo-500/20 group transform hover:-translate-y-0.5"
				>
					<PlusIcon className="w-5 h-5 mr-2 text-white/90 group-hover:text-white transition-colors" />
					<span className="text-white/90 group-hover:text-white transition-colors">
						Apply for a Loan
					</span>
				</Link>
			</div>

			<nav className="flex-1 p-4 space-y-1">
				{navigation.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
								isActive
									? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
									: "text-gray-300 hover:bg-gray-700/50 hover:text-white"
							}`}
						>
							<span
								className={`mr-3 ${
									isActive ? "text-blue-400" : "text-gray-400"
								}`}
							>
								{item.icon}
							</span>
							{item.name}
						</Link>
					);
				})}
			</nav>

			<div className="p-4 border-t border-gray-700">
				<Link
					href="/dashboard/profile"
					className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700/50 hover:text-white transition-colors"
				>
					<UserIcon className="w-6 h-6 mr-3 text-gray-400" />
					Profile
				</Link>
			</div>
		</div>
	);
}
