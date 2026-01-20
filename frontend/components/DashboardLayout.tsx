"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import NotificationsButton from "./NotificationsButton";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { checkAuth } from "@/lib/authUtils";

export default function DashboardLayout({
  children,
  title = "Dashboard",
  userName = "User",
}: {
  children: React.ReactNode;
  title?: string;
  userName?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify authentication on component mount
    const verifyAuth = async () => {
      try {
        setIsLoading(true);
        const isAuthenticated = await checkAuth();

        if (!isAuthenticated) {
          // Redirect to login if not authenticated or token refresh fails
          router.push("/login");
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Auth verification error:", error);
        router.push("/login");
      }
    };

    verifyAuth();

    // Add storage event listener for cross-device mobile updates
    const handleStorageChange = (e: StorageEvent) => {
      // Handle mobile profile update redirect
      if (e.key === "mobile_profile_update" && e.newValue) {
        try {
          const updateData = JSON.parse(e.newValue);
          if (updateData.action === "redirect_to_profile" && updateData.url) {
            // Clear the flag
            localStorage.removeItem("mobile_profile_update");
            // Redirect to profile page
            router.push(updateData.url);
          }
        } catch (error) {
          console.warn(
            "DashboardLayout: Failed to parse mobile profile update data:",
            error
          );
        }
      }
    };

    // Set up periodic token refresh (every 10 minutes)
    const refreshInterval = setInterval(async () => {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        // Only redirect if we're still on the dashboard
        router.push("/login");
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  // Update document title when title prop changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${title} | Andas Capital`;
    }
  }, [title]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar userName={userName} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-20 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-14">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-slate-600 hover:text-slate-900 hover:bg-gray-100" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-gray-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-heading font-semibold text-slate-900 truncate">
              {title}
            </h1>
            <p className="text-sm text-slate-500 font-body truncate">
              Welcome back,{" "}
              <Link
                href="/dashboard/profile"
                className="text-teal-500 font-medium hover:text-teal-600 transition-colors"
              >
                {userName}
              </Link>
            </p>
          </div>
          <div className="flex-shrink-0">
            <NotificationsButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
