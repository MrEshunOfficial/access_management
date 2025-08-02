"use client";

import { Logout } from "@/components/ui/auth-components/Logout";
import { Button } from "@/components/ui/button";
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
  LogIn,
  UserPlus,
  ArrowRight,
  Settings,
  Bell,
  Star,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "admin";
  disabled?: boolean;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  href,
  onClick,
  variant = "secondary",
  disabled = false,
}) => {
  const baseClasses = `
    group relative p-6 rounded-2xl transition-all duration-300 
    border backdrop-blur-sm min-h-[160px] flex flex-col justify-between
    ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:scale-[1.02] hover:shadow-xl cursor-pointer"
    }
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30
      border-blue-200/60 dark:border-blue-800/40
      hover:from-blue-100 hover:to-indigo-200 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50
    `,
    secondary: `
      bg-white/60 dark:bg-gray-800/30 
      border-gray-200/40 dark:border-gray-700/40
      hover:bg-white/80 dark:hover:bg-gray-800/50
    `,
    admin: `
      bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30
      border-purple-200/60 dark:border-purple-800/40
      hover:from-purple-100 hover:to-pink-200 dark:hover:from-purple-950/50 dark:hover:to-pink-950/50
    `,
  };

  const content = (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );

  if (disabled) {
    return <div>{content}</div>;
  }

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default function AdminHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Memoize user role check for better performance and security
  const userPermissions = useMemo(() => {
    if (!session?.user?.role) {
      return { isAdmin: false, canAccessAdmin: false, role: null };
    }

    const role = session.user.role;
    const isAdmin = role === "admin";
    const isSuperAdmin = role === "super_admin";
    const canAccessAdmin = isAdmin || isSuperAdmin;

    return { isAdmin, isSuperAdmin, canAccessAdmin, role };
  }, [session?.user?.role]);

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="animate-pulse flex justify-center items-center min-h-screen">
          <div className="space-y-4 text-center">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleAdminAccess = () => {
    if (userPermissions.canAccessAdmin) {
      router.push("/admin");
    }
  };

  // Enhanced greeting based on user role and time
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good morning";
    if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
    else if (hour >= 17) timeGreeting = "Good evening";

    const userName = session?.user?.name || "User";
    const roleTitle = userPermissions.isSuperAdmin
      ? "Super Admin"
      : userPermissions.isAdmin
      ? "Administrator"
      : "User";

    return {
      greeting: `${timeGreeting}, ${userName}`,
      subtitle: session
        ? `Welcome back to your ${roleTitle} dashboard`
        : "Welcome to ErrandMate",
    };
  };

  // Render different content based on authentication status
  const renderMainContent = () => {
    const { greeting, subtitle } = getGreeting();

    if (!session) {
      // User is not authenticated - show login encouragement
      return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Welcome to ErrandMate
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Your Personal
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Errand Assistant
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Streamline your daily tasks, manage errands efficiently, and
                stay organized with our comprehensive platform.
              </p>
            </div>

            {/* Action Cards for Unauthenticated Users */}
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12">
              <QuickActionCard
                title="Sign In"
                description="Access your existing account and continue managing your errands"
                icon={<LogIn className="w-6 h-6 text-blue-600" />}
                href="/auth/users/login"
                variant="primary"
              />
              <QuickActionCard
                title="Create Account"
                description="Join ErrandMate and start organizing your tasks today"
                icon={
                  <UserPlus className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                }
                href="/auth/users/register"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      );
    }

    // User is authenticated - show personalized dashboard
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Personalized Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {greeting}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
            {userPermissions.canAccessAdmin && (
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                {userPermissions.isSuperAdmin
                  ? "Super Admin Access"
                  : "Admin Access"}
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Always show main platform access */}
            <QuickActionCard
              title="Main Platform"
              description="Access your personal dashboard, manage errands, and track your progress"
              icon={<Home className="w-6 h-6 text-blue-600" />}
              href={`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}`}
              variant="primary"
            />

            {/* Conditionally show admin dashboard - only for admins */}
            {userPermissions.canAccessAdmin && (
              <QuickActionCard
                title="Admin Dashboard"
                description={`Access administrative controls and manage system ${
                  userPermissions.isSuperAdmin
                    ? "with full privileges"
                    : "settings"
                }`}
                icon={<Shield className="w-6 h-6 text-purple-600" />}
                onClick={handleAdminAccess}
                variant="admin"
              />
            )}

            {/* Additional user-specific features */}
            <QuickActionCard
              title="Profile Settings"
              description="Manage your account preferences, security settings, and personal information"
              icon={
                <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              }
              href={`/${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile`}
              variant="secondary"
            />

            {/* Show notifications if user has admin privileges */}
            {userPermissions.canAccessAdmin && (
              <QuickActionCard
                title="System Notifications"
                description="View important system alerts and administrative announcements"
                icon={<Bell className="w-6 h-6 text-orange-600" />}
                href="/admin/notifications"
                variant="secondary"
              />
            )}
          </div>

          {/* Status Footer */}
          <div className="text-center pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last login: {new Date().toLocaleDateString()} • Status:{" "}
              <span className="text-green-600 dark:text-green-400 font-medium">
                Active
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Image
                  src="/favicon.png"
                  alt="ErrandMate Logo"
                  width={24}
                  height={24}
                  className="rounded-md"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ErrandMate
                </h1>
                {userPermissions.canAccessAdmin && (
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Admin Portal
                  </span>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {session?.user ? (
                <UserMenu userPermissions={userPermissions} />
              ) : (
                <AuthButtons />
              )}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 min-h-[calc(100vh-4rem)] flex items-center">
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
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-300"
        >
          Sign In
        </Button>
      </Link>
      <Link href="/auth/users/register">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          Get Started
        </Button>
      </Link>
    </div>
  );
}

interface UserMenuProps {
  userPermissions: {
    isAdmin: boolean;
    isSuperAdmin?: boolean;
    canAccessAdmin: boolean;
    role: string | null;
  };
}

function UserMenu({ userPermissions }: UserMenuProps) {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-3 px-3 py-2 h-12 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-300 border border-white/30 dark:border-gray-700/30 shadow-lg"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session?.user?.name || "User"}
                width={32}
                height={32}
                className="rounded-full object-cover w-full h-full"
                sizes="32px"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
              {session?.user?.name || "User"}
            </p>
            {userPermissions.canAccessAdmin && (
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {userPermissions.isSuperAdmin ? "Super Admin" : "Admin"}
              </p>
            )}
          </div>
          <ChevronDown className="h-4 w-4 transition-transform duration-300 text-gray-600 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl p-2"
      >
        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {session?.user?.name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session?.user?.email}
          </p>
          {userPermissions.canAccessAdmin && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium">
                <Shield className="w-3 h-3 mr-1" />
                {userPermissions.isSuperAdmin ? "Super Admin" : "Administrator"}
              </span>
            </div>
          )}
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 cursor-pointer">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/profile`}
              className="flex w-full items-center gap-3 p-2"
            >
              <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Profile Settings
              </span>
            </Link>
          </DropdownMenuItem>
          {userPermissions.canAccessAdmin && (
            <DropdownMenuItem className="rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-300 cursor-pointer">
              <Link
                href="/admin"
                className="flex w-full items-center gap-3 p-2"
              >
                <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">
                  Admin Dashboard
                </span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50 my-2" />
        <div className="p-1">
          <Logout className="w-full px-3 py-2 text-left text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-all duration-300 text-sm font-medium" />
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
          className="relative w-10 h-10 rounded-xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-300 border border-white/30 dark:border-gray-700/30 shadow-lg"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0 text-gray-700" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-gray-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl min-w-[160px] p-2"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 p-3"
        >
          <Sun className="mr-3 h-4 w-4 text-gray-600" />
          <span className="text-gray-700 dark:text-gray-300">Light</span>
          {theme === "light" && (
            <span className="ml-auto text-blue-600 font-medium">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 p-3"
        >
          <Moon className="mr-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-blue-600 font-medium">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 p-3"
        >
          <Laptop className="mr-3 h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">System</span>
          {theme === "system" && (
            <span className="ml-auto text-blue-600 font-medium">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
