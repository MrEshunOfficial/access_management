"use client";

import { Logout } from "@/components/ui/auth-components/Logout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  User,
  Shield,
  Laptop,
  Moon,
  Sun,
  Home,
  AlertCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Session } from "next-auth";

interface AdminAccessButtonProps {
  session: Session | null;
}

export default function AdminHomePage() {
  const { data: session, status } = useSession();

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-pulse flex justify-center items-center min-h-screen">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const AdminAccessButton: React.FC<AdminAccessButtonProps> = ({ session }) => {
    const router = useRouter();
    const [showAccessDenied, setShowAccessDenied] = useState(false);

    const handleAccess = () => {
      const role = session?.user?.role;
      if (role !== "admin" && role !== "super_admin") {
        setShowAccessDenied(true);
        // Hide the alert after 5 seconds
        setTimeout(() => setShowAccessDenied(false), 5000);
        return;
      }

      router.push("/admin");
    };

    return (
      <div className="flex flex-col items-center gap-4">
        {showAccessDenied && (
          <Alert className="max-w-md bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Access denied. You don&apos;t have admin privileges.
            </AlertDescription>
          </Alert>
        )}
        <Button
          className="relative group px-8 py-6 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px]"
          onClick={handleAccess}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 transition-all duration-300" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-3">
            <Shield className="w-6 h-6" />
            Admin Dashboard
          </span>
        </Button>
      </div>
    );
  };

  // Render different content based on authentication status
  const renderMainContent = () => {
    if (!session) {
      // User is not authenticated - show login encouragement
      return (
        <div className="text-center space-y-8 px-4">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Welcome to ErrandMate
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Please sign in to access your account and start managing your
              errands
            </p>
          </div>

          {/* Login Encouragement Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/auth/users/login">
              <Button className="relative group px-8 py-6 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  <LogIn className="w-6 h-6" />
                  Sign In
                </span>
              </Button>
            </Link>
            <Link href="/auth/users/register">
              <Button
                variant="outline"
                className="relative group px-8 py-6 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 min-w-[200px]"
              >
                <span className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  <UserPlus className="w-6 h-6" />
                  Create Account
                </span>
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    // User is authenticated - show admin and main platform buttons
    return (
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Welcome, {session?.user?.name || "User"}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Choose your destination to access ErrandMate features
          </p>
        </div>

        {/* Action Buttons for authenticated users */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <AdminAccessButton session={session} />
          <Link href={`${process.env.NEXT_PUBLIC_USER_SERVICE_URL || "*"}`}>
            <Button
              variant="outline"
              className="relative group px-8 py-6 text-lg font-semibold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 min-w-[200px]"
            >
              <span className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                <Home className="w-6 h-6" />
                Main Platform
              </span>
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <Image
                src="/favicon.png"
                alt="ErrandMate Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                ErrandMate
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {session?.user ? <UserMenu /> : <AuthButtons />}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        {renderMainContent()}
      </main>
    </div>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center space-x-3">
      <Link href="/auth/users/login">
        <Button
          variant="ghost"
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Sign In
        </Button>
      </Link>
      <Link href="/auth/users/register">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6">
          Register
        </Button>
      </Link>
    </div>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-3 px-3 py-2 h-10 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/20 dark:border-gray-700/20"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={`${session?.user?.name}`}
                width={32}
                height={32}
                className="rounded-full object-cover w-full h-full"
                sizes="32px"
              />
            )}
          </div>
          <span className="hidden sm:inline text-sm font-medium truncate">
            {session?.user?.name}
          </span>
          <ChevronDown className="h-4 w-4 transition-transform duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
      >
        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {session?.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session?.user?.email}
          </p>
        </div>
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link
              href={`/${process.env.USER_SERVICE_URL}`}
              className="flex w-full items-center gap-3 p-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="p-2">
          <Logout className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-all duration-300 text-sm" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/20 dark:border-gray-700/20"
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl min-w-[160px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Sun className="mr-3 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-blue-600">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Moon className="mr-3 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-blue-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
        >
          <Laptop className="mr-3 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <span className="ml-auto text-blue-600">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
