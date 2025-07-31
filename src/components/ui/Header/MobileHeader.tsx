// components/MobileMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  User,
  Grid3X3,
  Package,
  Shield,
  Crown,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Logout } from "../auth-components/Logout";

// Navigation item interfaces
interface NavigationItem {
  title: string;
  href: string;
  children?: NavigationChild[];
  icon?: React.ReactNode;
}

interface NavigationChild {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  isActive: (path: string) => boolean;
  userSession?: string; // Added userSession prop
}

export default function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  isActive,
  userSession, // Now accepting userSession as a prop
}: MobileMenuProps) {
  const { data: session } = useSession();

  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-out ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`absolute top-20 right-4 left-4 max-h-[calc(100vh-6rem)] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/30 transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
        }`}
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      >
        <div className="flex flex-col h-full max-h-[calc(100vh-6rem)]">
          {/* User Profile Section - Show if logged in */}
          {userSession && (
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-red-500/5 via-transparent to-blue-600/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={`${session?.user?.name || "User"}'s avatar`}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="text-white text-lg font-semibold">
                      {session?.user?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <MobileNavItem
                    key={item.title}
                    item={item}
                    isActive={isActive(item.href)}
                    onItemClick={onClose}
                  />
                ))}
              </nav>

              {/* User Menu Items - Show if logged in */}
              {userSession && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                      Account
                    </h3>

                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Profile</span>
                    </Link>

                    <Link
                      href="/user/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <Grid3X3 className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                      href="/user/orders"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <Package className="h-5 w-5" />
                      <span className="font-medium">My Orders</span>
                    </Link>

                    {/* Admin Menu Items */}
                    {(session?.user?.role === "super_admin" ||
                      session?.user?.role === "admin") && (
                      <div className="pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-2">
                          Administration
                        </h4>

                        <Link
                          href="/admin"
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300"
                        >
                          <Shield className="h-5 w-5" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>

                        {session?.user?.role === "super_admin" && (
                          <Link
                            href="/admin/super"
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/50 transition-all duration-300"
                          >
                            <Crown className="h-5 w-5" />
                            <span className="font-medium">Super Admin</span>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Sign Out */}
                    <div className="pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
                      <Logout className="flex items-center gap-3 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-all duration-300 w-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Buttons - Only show for logged out users */}
              {!userSession && (
                <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-3">
                  <Link
                    href="/auth/users/login"
                    onClick={onClose}
                    className="block w-full px-6 py-3 text-center font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 border border-gray-200/30 dark:border-gray-700/30"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/auth/users/register"
                    onClick={onClose}
                    className="block w-full px-6 py-3 text-center font-semibold text-white rounded-xl bg-gradient-to-r from-red-500 via-red-400 to-blue-600 hover:from-red-600 hover:via-red-500 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Nav Item Component
function MobileNavItem({
  item,
  isActive,
  onItemClick,
}: {
  item: NavigationItem;
  isActive: boolean;
  onItemClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
            isActive
              ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50 shadow-sm"
              : "text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon && <span className="text-lg">{item.icon}</span>}
            <span className="font-medium text-base">{item.title}</span>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            } ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pl-2 space-y-1 mt-2">
            {item.children.map((child) => (
              <Link
                key={child.title}
                href={child.href}
                onClick={onItemClick}
                className="flex items-center gap-3 p-3 ml-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-300 border-l-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-400/50"
              >
                {child.icon && (
                  <span className="text-gray-400">{child.icon}</span>
                )}
                <span className="flex-1">{child.title}</span>
                {child.badge && (
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-red-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/30 dark:border-blue-800/30">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
        isActive
          ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/50 shadow-sm"
          : "text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50"
      }`}
    >
      {item.icon && <span className="text-lg">{item.icon}</span>}
      <span className="font-medium text-base">{item.title}</span>
    </Link>
  );
}
