"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
	const router = useRouter();

	useEffect(() => {
		// Redirect to loans page with applications tab
		router.replace("/dashboard/loans?tab=applications");
	}, [router]);

	return (
		<div className="flex items-center justify-center h-64">
			<div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
		</div>
	);
}
