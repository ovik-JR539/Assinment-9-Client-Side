
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import {
    Menu,
    X,
    Sun,
    Moon,
    ChevronDown,
    UserRound,
    LayoutDashboard,
    CalendarDays,
    BriefcaseBusiness,
    PlusCircle,
    ClipboardList,
    Wrench,
    Users,
    CheckCircle,
    CreditCard,
    Settings,
    LogOut,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    const headerRef = useRef(null);

    // Get logged-in user information
    const { data: session, isPending } = authClient.useSession();

    const user = session?.user;
    const role = String(user?.role || "customer").toLowerCase();

    // Get user's first capital letter
    const avatarLetter =
        user?.name?.trim()?.charAt(0).toUpperCase() ||
        user?.email?.trim()?.charAt(0).toUpperCase() ||
        "U";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                headerRef.current &&
                !headerRef.current.contains(event.target)
            ) {
                setAccountOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                setAccountOpen(false);
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Services", href: "/services" },
        { name: "How It Works", href: "/#how-it-works" },
        { name: "About", href: "/#about" },
    ];

    // Role-based account links
    const roleLinks = {
        customer: [
            {
                name: "My Bookings",
                href: "/dashboard/my-bookings",
                icon: CalendarDays,
            },
            {
                name: "My Listings",
                href: "/dashboard/my-listings",
                icon: BriefcaseBusiness,
            },
            {
                name: "Add New Booking",
                href: "/dashboard/add-booking",
                icon: PlusCircle,
            },
        ],

        technician: [
            {
                name: "New Requests",
                href: "/dashboard/technician/requests",
                icon: ClipboardList,
            },
            {
                name: "My Services",
                href: "/dashboard/technician/services",
                icon: Wrench,
            },
        ],

        admin: [
            {
                name: "Booking Progress",
                href: "/dashboard/admin/bookings",
                icon: CalendarDays,
            },
            {
                name: "Manage Users",
                href: "/dashboard/admin/users",
                icon: Users,
            },
            {
                name: "Approve Services",
                href: "/dashboard/admin/services",
                icon: CheckCircle,
            },
            {
                name: "Transactions",
                href: "/dashboard/admin/transactions",
                icon: CreditCard,
            },
        ],
    };

    const accountLinks = roleLinks[role] || roleLinks.customer;

    // Check active navigation link
    function isActive(link) {
        if (link.href === "/") {
            return pathname === "/";
        }

        if (link.href === "/#how-it-works") {
            return (
                pathname === "/" &&
                typeof window !== "undefined" &&
                window.location.hash === "#how-it-works"
            );
        }

        if (link.href === "/#about") {
            return (
                pathname === "/" &&
                typeof window !== "undefined" &&
                window.location.hash === "#about"
            );
        }

        return (
            pathname === link.href ||
            pathname.startsWith(link.href + "/")
        );
    }

    // Change theme
    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    // Navigation styles
    function getLinkStyle(link) {
        return isActive(link)
            ? "text-orange-500 font-bold dark:text-orange-400"
            : "text-slate-600 font-medium hover:text-orange-500 dark:text-slate-300 dark:hover:text-orange-400";
    }

    // Close menus
    function closeMenus() {
        setAccountOpen(false);
        setMenuOpen(false);
    }

    // Sign out
    async function handleSignOut() {
        try {
            await authClient.signOut();

            closeMenus();
            window.location.assign("/");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    }

    // Avatar component
    function UserAvatar() {
        return (
            <div
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-orange-500 bg-orange-100 text-lg font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                title={user?.name || user?.email || "My Account"}
            >
                {user?.image ? (
                    <img
                        src={user.image}
                        alt={user.name || "User Avatar"}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    avatarLetter
                )}
            </div>
        );
    }

    // Account dropdown content
    function AccountDropdown() {
        return (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

                {/* User Information */}
                <div className="border-b border-slate-100 p-4 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <UserAvatar />

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {user?.name || "User"}
                            </p>

                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                {user?.email}
                            </p>

                            <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold capitalize text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                                {role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Account Navigation */}
                <div className="p-2">
                    <Link
                        href="/dashboard"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-orange-400"
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </Link>

                    {accountLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMenus}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-orange-400"
                            >
                                <Icon size={18} />
                                {link.name}
                            </Link>
                        );
                    })}

                    <Link
                        href="/dashboard/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-orange-400"
                    >
                        <Settings size={18} />
                        Profile Edit
                    </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-slate-100 p-2 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <header
            ref={headerRef}
            className="sticky top-0 z-50 border-b border-slate-100 bg-white transition-colors duration-300 dark:border-slate-700 dark:bg-slate-950"
        >
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center"
                    onClick={closeMenus}
                >
                    <Image
                        src="/images/Fix-mate-logo.png"
                        alt="FixMate Logo"
                        width={140}
                        height={60}
                        priority
                        className="h-auto w-32 object-contain md:w-36"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            aria-current={
                                isActive(link) ? "page" : undefined
                            }
                            className={`relative py-2 text-sm transition-colors duration-200 ${getLinkStyle(link)}`}
                        >
                            {link.name}

                            {isActive(link) && (
                                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-orange-500" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden items-center gap-3 md:flex">

                    {/* Theme Switch */}
                    <button
                        onClick={toggleTheme}
                        type="button"
                        aria-label="Change theme"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-orange-100 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300 dark:hover:bg-slate-700"
                    >
                        {!mounted ? (
                            <Moon size={20} />
                        ) : theme === "dark" ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>

                    {/* User Avatar or Authentication Buttons */}
                    {isPending ? (
                        <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                    ) : user ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountOpen(!accountOpen)}
                                aria-label="Open account menu"
                                aria-expanded={accountOpen}
                                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-orange-50 dark:hover:bg-slate-800"
                            >
                                <UserAvatar />

                                <ChevronDown
                                    size={17}
                                    className={`text-slate-500 transition-transform ${
                                        accountOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {accountOpen && (
                                <div className="absolute right-0 top-full z-50 mt-3 w-72">
                                    <AccountDropdown />
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-orange-500 dark:text-slate-200 dark:hover:text-orange-400"
                            >
                                Sign In
                            </Link>

                            <Link
                                href="/sign-up"
                                className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Buttons */}
                <div className="flex items-center gap-2 md:hidden">

                    {/* Theme Switch */}
                    <button
                        onClick={toggleTheme}
                        type="button"
                        aria-label="Change theme"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300"
                    >
                        {!mounted ? (
                            <Moon size={20} />
                        ) : theme === "dark" ? (
                            <Sun size={20} />
                        ) : (
                            <Moon size={20} />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            setMenuOpen(!menuOpen);
                            setAccountOpen(false);
                        }}
                        type="button"
                        className="p-2 text-slate-700 dark:text-white"
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <X size={23} />
                        ) : (
                            <Menu size={23} />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="max-h-[80vh] overflow-y-auto border-t border-slate-100 bg-white px-5 py-5 dark:border-slate-700 dark:bg-slate-950 md:hidden">

                    <div className="flex flex-col gap-3">

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={closeMenus}
                                aria-current={
                                    isActive(link) ? "page" : undefined
                                }
                                className={`rounded-lg px-3 py-2 transition-colors ${getLinkStyle(link)} ${
                                    isActive(link)
                                        ? "bg-orange-50 dark:bg-orange-500/10"
                                        : ""
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <hr className="border-slate-100 dark:border-slate-700" />

                        {!isPending && !user && (
                            <>
                                <Link
                                    href="/sign-in"
                                    onClick={closeMenus}
                                    className="font-semibold text-slate-700 dark:text-slate-200"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    href="/sign-up"
                                    onClick={closeMenus}
                                    className="rounded-lg bg-orange-500 py-3 text-center font-semibold text-white transition hover:bg-orange-600"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}

                        {user && (
                            <div className="mt-2">
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen(!accountOpen)}
                                    className="flex w-full items-center justify-between rounded-lg p-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <UserAvatar />

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-800 dark:text-white">
                                                {user.name || "User"}
                                            </p>

                                            <p className="truncate text-xs text-slate-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <ChevronDown
                                        size={18}
                                        className={`shrink-0 text-slate-500 transition-transform ${
                                            accountOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {accountOpen && (
                                    <div className="mt-3">
                                        <AccountDropdown />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
