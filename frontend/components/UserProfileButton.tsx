import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TokenStorage } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export default function UserProfileButton() {
	const router = useRouter();

	const handleLogout = async () => {
		// Clear tokens using our utility
		TokenStorage.clearTokens();

		// Call logout API to invalidate refresh token on server
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${TokenStorage.getAccessToken()}`,
				},
			});
		} catch (error) {
			console.error("Error during logout:", error);
		}

		// Redirect to login page
		router.push("/login");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative bg-gray-800 hover:bg-gray-700 text-gray-100 hover:text-white transition-colors"
				>
					<User className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-48 bg-gray-800/95 backdrop-blur-lg border-gray-700"
			>
				<DropdownMenuItem asChild>
					<Link
						href="/dashboard/profile"
						className="w-full cursor-pointer text-gray-100 hover:text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
					>
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer text-gray-100 hover:text-white hover:bg-gray-700 focus:bg-gray-700 focus:text-white"
				>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
