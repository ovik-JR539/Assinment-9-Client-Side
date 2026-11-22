
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    CalendarDays,
    ClipboardList,
    PlusCircle,
    UserRound,
    Users,
    Wrench,
    CreditCard,
    CheckCircle,
    Settings,
    UserPlus,
    FilePlus2,
    Eye,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function Dashboard() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session) {
            router.replace("/sign-in");
        }
    }, [session, isPending, router]);

    if (isPending || !session) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
                <p className="font-medium text-slate-600">
                    Checking your account...
                </p>
            </div>
        );
    }

    const user = session.user;
    const role = user.role;

    // Customer navigation
    const customerMenu = [
        {
            name: "My Bookings",
            href: "/dashboard/my-bookings",
            icon: CalendarDays,
        },
        {
            name: "My Listings",
            href: "/dashboard/my-listings",
            icon: ClipboardList,
        },
        {
            name: "Add New Booking",
            href: "/dashboard/add-booking",
            icon: PlusCircle,
        },
        {
            name: "Profile Edit",
            href: "/dashboard/profile",
            icon: UserRound,
        },
    ];

    // Technician navigation
    const technicianMenu = [
        {
            name: "New Requests",
            href: "/dashboard/technician/requests",
            icon: ClipboardList,
            description: "Manage your customer repair bookings.",
        },
        {
            name: "My Services",
            href: "/dashboard/technician/services",
            icon: Wrench,
            description: "Manage your existing repair services.",
        },
        {
            name: "New Request",
            href: "/dashboard/technician/requests",
            icon: FilePlus2,
            description: "Manage your technician application.",
        },
        {
            name: "Apply Service",
            href: "/dashboard/technician/apply-service",
            icon: UserPlus,
            description: "Submit a new service for admin approval.",
        },
        {
            name: "View Service Requests",
            href: "/dashboard/technician/view-request",
            icon: Eye,
            description: "View your submitted service applications.",
        },
        {
            name: "Profile Edit",
            href: "/dashboard/profile",
            icon: UserRound,
            description: "Update your account information.",
        },
    ];

    // Admin navigation
    const adminMenu = [
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
        {
            name: "Profile Edit",
            href: "/dashboard/profile",
            icon: UserRound,
        },
    ];

    // Select navigation according to user role
    let menu = [];

    if (role === "customer") {
        menu = customerMenu;
    } else if (role === "technician") {
        menu = technicianMenu;
    } else if (role === "admin") {
        menu = adminMenu;
    }

    // Card icon colors
    const colors = [
        "bg-teal-50 text-teal-700",
        "bg-blue-50 text-blue-700",
        "bg-purple-50 text-purple-700",
        "bg-orange-50 text-orange-700",
        "bg-rose-50 text-rose-700",
        "bg-indigo-50 text-indigo-700",
    ];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Heading */}
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
                        {role} dashboard
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Welcome back, {user.name}!
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage your FixMate account and activities from here.
                    </p>
                </div>

                {/* Account Overview */}
                <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-lg font-bold text-slate-900">
                        Account Overview
                    </h2>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {/* Full Name */}
                        <div>
                            <p className="text-sm text-slate-500">
                                Full Name
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                                {user.name}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <p className="text-sm text-slate-500">
                                Email Address
                            </p>

                            <p className="mt-1 break-all font-semibold text-slate-900">
                                {user.email}
                            </p>
                        </div>

                        {/* Role */}
                        <div>
                            <p className="text-sm text-slate-500">
                                Account Role
                            </p>

                            <p className="mt-1 font-semibold capitalize text-teal-700">
                                {role}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Access Heading */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-900">
                        Quick Access
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Choose an option to manage your activities.
                    </p>
                </div>

                {/* Navigation Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {menu.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                href={item.href}
                                key={item.name}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                            >
                                {/* Icon */}
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                        colors[index % colors.length]
                                    }`}
                                >
                                    <Icon size={23} />
                                </div>

                                {/* Title */}
                                <h3 className="mt-5 font-bold text-slate-900 transition group-hover:text-teal-700">
                                    {item.name}
                                </h3>

                                {/* Description */}
                                <p className="mt-2 text-sm text-slate-500">
                                    {item.description ||
                                        `Manage your ${item.name.toLowerCase()}.`}
                                </p>

                                {/* Link Text */}
                                <p className="mt-5 text-sm font-semibold text-teal-700">
                                    Open section →
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* Profile Section */}
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-bold text-slate-900">
                            Keep your account updated
                        </h2>

                        <p className="mt-1 text-sm text-slate-600">
                            Update your personal information from your profile.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                        <Settings size={17} />
                        Edit Profile
                    </Link>
                </div>

            </div>
        </main>
    );
}
