"use client";

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
import { Settings } from "lucide-react";

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
					className="relative bg-white hover:bg-purple-primary/5 text-gray-700 hover:text-purple-primary border border-gray-200 hover:border-purple-primary/20 transition-colors shadow-sm"
				>
					<Settings className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-48 bg-white/95 backdrop-blur-lg border-gray-200 shadow-lg"
			>
				<DropdownMenuItem asChild>
					<Link
						href="/dashboard/profile"
						className="w-full cursor-pointer text-gray-700 hover:text-purple-primary hover:bg-purple-primary/5 focus:bg-purple-primary/5 focus:text-purple-primary font-body"
					>
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleLogout}
					className="cursor-pointer text-gray-700 hover:text-purple-primary hover:bg-purple-primary/5 focus:bg-purple-primary/5 focus:text-purple-primary font-body"
				>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
