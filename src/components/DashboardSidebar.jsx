
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    PlusCircle,
    UserRound,
    Users,
    Wrench,
    CreditCard,
    CheckCircle,
    LogOut,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    async function handleLogout() {
        await authClient.signOut();
        router.replace("/sign-in");
    }

    if (isPending || !session) {
        return null;
    }

    const user = session.user;
    const role = user.role;

    // Customer menu
    const customerMenu = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
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

    // Technician menu
    const technicianMenu = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
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
         {
            name: "apply-service",
            href: "/dashboard/technician/apply-service",
            icon: PlusCircle,
        },
           {
            name: "view-request",
            href: "/dashboard/technician/view-request",
            icon: ClipboardList,
        },
        {
            name: "Profile Edit",
            href: "/dashboard/profile",
            icon: UserRound,
        },
    ];

    // Admin menu
    const adminMenu = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
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

    let menu = [];

    if (role === "customer") {
        menu = customerMenu;
    } else if (role === "technician") {
        menu = technicianMenu;
    } else if (role === "admin") {
        menu = adminMenu;
    }

    return (
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-full flex flex-col">

            {/* User Information */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xl font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <h2 className="font-bold text-slate-900 truncate">
                            {user.name}
                        </h2>

                        <p className="text-xs text-slate-500 truncate">
                            {user.email}
                        </p>

                        <p className="text-xs text-teal-700 capitalize font-semibold mt-1">
                            {role}
                        </p>
                    </div>

                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menu.map((item) => {
                    const Icon = item.icon;

                    const active =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.href;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                                active
                                    ? "bg-teal-50 text-teal-700 font-semibold border border-teal-200"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-teal-700"
                            }`}
                        >
                            <Icon size={19} />

                            <span className="text-sm">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
                >
                    <LogOut size={19} />

                    <span className="text-sm font-semibold">
                        Sign Out
                    </span>
                </button>
            </div>

        </aside>
    );
}
