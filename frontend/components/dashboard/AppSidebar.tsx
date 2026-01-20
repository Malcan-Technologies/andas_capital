"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Banknote,
  ArrowLeftRight,
  User,
  Plus,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { TokenStorage } from "@/lib/authUtils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Loans", href: "/dashboard/loans", icon: Banknote },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userName?: string;
}

export function AppSidebar({ userName = "User", ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useSidebar();

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

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Logo size="sm" variant="white" linkTo="" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Apply for Loan CTA - Top */}
        <SidebarGroup className="px-2 pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  tooltip="Apply for Loan"
                  className="bg-teal-400 text-white hover:bg-teal-500 hover:text-white py-4 px-4 h-auto rounded-xl shadow-md shadow-teal-200/50"
                >
                  <Link href="/dashboard/apply" className="flex items-center gap-3">
                    <Plus className="size-5" />
                    <span className="font-body font-semibold text-base">Apply for Loan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 font-body">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={
                        isActive
                          ? "bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700"
                          : "text-slate-600 hover:bg-gray-100 hover:text-slate-900"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span className="font-body">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-teal-100 text-teal-600 font-medium">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-slate-900 font-body">
                      {userName}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2"
                  >
                    <User className="size-4 text-slate-500" />
                    <span className="font-body">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="size-4" />
                  <span className="font-body">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
