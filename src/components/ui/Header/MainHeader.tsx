// components/Header.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  Grid3X3,
  User,
  Menu,
  X,
  Package,
  Info,
  Home,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MobileMenu from "./MobileHeader";
import { Logout } from "../auth-components/Logout";
import { useCategories } from "@/hooks/admin/useCategory";

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

// Category interface (adjust based on your actual Category type)
// interface Category {
//   _id: string;
//   categoryName: string;
//   serviceCount?: number;
// }

// Base navigation items (without dynamic categories)
const baseNavigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Services Categories",
    href: "/errand-services",
    icon: <Package className="h-4 w-4" />,
    children: [
      {
        title: "All Categories",
        href: "/errand-services",
        description: "Browse all available categories and their services",
        icon: <Grid3X3 className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "How It Works",
    href: "/how-it-works",
    icon: <Info className="h-4 w-4" />,
    children: [
      {
        title: "Getting Started",
        href: "/how-it-works",
        description: "Learn how our platform works",
        icon: <Info className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "About",
    href: "/about-us",
    children: [
      {
        title: "Our Story",
        href: "/about-us/story",
        description: "Learn about our journey",
      },
      {
        title: "Team",
        href: "/about-us/team",
        description: "Meet our amazing team",
      },
      {
        title: "Contact",
        href: "/about-us/our-contacts",
        description: "Get in touch with us",
      },
    ],
  },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const userSession = session?.user?.id;
  const pathname = usePathname();

  // Categories hook
  const { categories, getCategoriesWithCounts, getCategories } =
    useCategories();

  // Fetch categories on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch both regular categories and service counts
      await Promise.all([
        getCategories({ limit: 5 }),
        getCategoriesWithCounts(),
      ]);
    };

    fetchData();
  }, [getCategories, getCategoriesWithCounts]);

  // Enhanced navigation items with real categories
  const navigationItems = useMemo(() => {
    const items = [...baseNavigationItems];

    // Find the Services Categories item and enhance it with real data
    const servicesIndex = items.findIndex(
      (item) => item.title === "Services Categories"
    );

    if (servicesIndex !== -1 && categories.length > 0) {
      // Create category navigation items from real data
      const categoryChildren: NavigationChild[] = categories
        .filter(
          (category) =>
            category.categoryName &&
            category.serviceCount &&
            category.serviceCount > 0
        )
        .map((category) => ({
          title: category.categoryName,
          href: `/errand-services/categories/${category._id?.toString()}`,
          description: `Explore ${category.categoryName} services`,
          badge: category.serviceCount ? `${category.serviceCount}` : undefined,
        }));

      // Update services navigation with real categories
      items[servicesIndex].children = [
        {
          title: "All Categories",
          href: "/errand-services",
          description: "Browse all available categories and their services",
          icon: <Grid3X3 className="h-4 w-4" />,
        },
        ...categoryChildren,
      ];
    }

    return items;
  }, [categories]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out ${
          scrolled
            ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-800/30"
            : "bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"
        }`}
        style={{
          backdropFilter: scrolled
            ? "blur(20px) saturate(180%)"
            : "blur(10px) saturate(120%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/3 via-transparent to-blue-600/3 pointer-events-none" />

        <div className="relative w-full max-w-none">
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex justify-between items-center h-16 sm:h-18 lg:h-20">
              {/* Logo and Brand */}
              <div className="flex items-center flex-shrink-0 min-w-0">
                <Link href="/" className="group">
                  <div className="flex items-center space-x-2 sm:space-x-3 transition-all duration-300 group-hover:scale-105">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-blue-600/50 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Image
                        src="/errand_logo.jpg"
                        alt="Errand Mate"
                        width={32}
                        height={32}
                        className="relative object-cover w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full ring-2 ring-white/50 dark:ring-gray-800/50 shadow-lg"
                        priority
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-blue-600 text-transparent bg-clip-text tracking-tight truncate">
                        Errand Mate
                      </span>
                      <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide truncate">
                        Let us run it for you
                      </span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation - Hidden on smaller screens */}
              <nav className="hidden xl:flex xl:items-center xl:space-x-1">
                {navigationItems.map((item) =>
                  item.children ? (
                    <NavDropdown
                      key={item.title}
                      item={item}
                      isActive={isActive(item.href)}
                    />
                  ) : (
                    <NavLink
                      key={item.title}
                      href={item.href}
                      isActive={isActive(item.href)}
                      icon={item.icon}
                    >
                      {item.title}
                    </NavLink>
                  )
                )}
              </nav>

              {/* Desktop Auth Buttons and Theme Toggle */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                {!userSession ? (
                  <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
                    <Link
                      href="/auth/users/login"
                      className="relative px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 transition-all duration-300 group whitespace-nowrap"
                    >
                      <div className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Sign In
                      </span>
                    </Link>
                    <Link
                      href="/auth/users/register"
                      className="relative px-4 sm:px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base font-semibold text-white rounded-full overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-xl whitespace-nowrap"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-400 to-blue-600 transition-all duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative flex items-center gap-2">
                        Register
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:block">
                    <UserMenu />
                  </div>
                )}

                <ThemeSwitcher />

                {/* Mobile Menu Button - Shows on xl and below */}
                <div className="xl:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/20 dark:border-gray-700/20"
                    aria-label="Toggle mobile menu"
                  >
                    <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                      <Menu
                        className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                          mobileMenuOpen
                            ? "rotate-90 opacity-0"
                            : "rotate-0 opacity-100"
                        }`}
                      />
                      <X
                        className={`absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                          mobileMenuOpen
                            ? "rotate-0 opacity-100"
                            : "-rotate-90 opacity-0"
                        }`}
                      />
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigationItems={navigationItems}
        isActive={isActive}
        userSession={userSession}
      />
    </>
  );
}

// Theme Switcher Component
function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/20 dark:border-gray-700/20"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl min-w-[160px]"
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
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

// User Menu Component
function UserMenu() {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-2 h-10 sm:h-11 lg:h-12 rounded-full bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-white/20 dark:border-gray-700/20 max-w-[200px]"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden relative bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={`${session?.user?.name || "User"}'s avatar`}
                width={32}
                height={32}
                className="rounded-full object-cover w-full h-full"
                sizes="32px"
              />
            ) : (
              <span className="text-white text-xs sm:text-sm font-semibold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <span className="hidden md:inline text-sm lg:text-base font-medium truncate">
            {session?.user?.name || "Account"}
          </span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 sm:w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
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
            <Link href="/profile" className="flex w-full items-center gap-3">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link
              href="/user/dashboard"
              className="flex w-full items-center gap-3"
            >
              <Grid3X3 className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300">
            <Link
              href="/user/orders"
              className="flex w-full items-center gap-3"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(session?.user?.role === "super_admin" ||
          session?.user?.role === "admin") && (
          <>
            <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
            <DropdownMenuGroup className="p-2">
              <DropdownMenuItem className="rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/50 transition-all duration-300">
                <Link
                  href="/admin"
                  className="flex w-full items-center gap-3 text-blue-600 dark:text-blue-400"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
        <div className="p-2">
          <Logout className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/50 transition-all duration-300 text-sm" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Desktop Nav Link
function NavLink({
  href,
  children,
  isActive,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 group rounded-xl whitespace-nowrap ${
        isActive
          ? "text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-blue-950/30 shadow-lg"
          : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/20"
      }`}
    >
      {icon && (
        <span className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
          {icon}
        </span>
      )}
      <span>{children}</span>
      <div
        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-300 ${
          isActive
            ? "w-1/2 opacity-100"
            : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
        }`}
      />
    </Link>
  );
}

// Desktop Nav Dropdown
function NavDropdown({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 group rounded-xl whitespace-nowrap ${
            isActive
              ? "text-blue-600 dark:text-blue-400 bg-white/30 dark:bg-blue-950/30 shadow-lg"
              : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/20"
          }`}
        >
          {item.icon && (
            <span className="transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
              {item.icon}
            </span>
          )}
          <span>{item.title}</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180 flex-shrink-0" />
          <div
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-red-500 to-blue-600 transition-all duration-300 ${
              isActive
                ? "w-1/2 opacity-100"
                : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100"
            }`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 sm:w-96 p-4 sm:p-6 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-white/20 dark:border-gray-800/30 rounded-2xl shadow-2xl"
        align="center"
        sideOffset={12}
        style={{ backdropFilter: "blur(20px) saturate(180%)" }}
      >
        <div className="grid gap-2 sm:gap-3">
          {item.children?.map((child) => (
            <Link
              key={child.title}
              href={child.href}
              className="flex items-start p-3 sm:p-4 rounded-xl text-sm hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 group"
            >
              {child.icon && (
                <div className="mr-3 sm:mr-4 mt-0.5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 flex-shrink-0">
                  {child.icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                    {child.title}
                  </span>
                  {child.badge && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-r from-red-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/30 dark:border-blue-800/30 flex-shrink-0">
                      {child.badge}
                    </span>
                  )}
                </div>
                {child.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {child.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
