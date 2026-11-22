
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

import {
    Users,
    Search,
    RefreshCw,
    ShieldCheck,
    UserRound,
    Wrench,
    Loader2,
} from "lucide-react";

export default function ManageUsers() {
    const router = useRouter();

    const { data: session, isPending } = authClient.useSession();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchUsers() {
        try {
            setLoading(true);
            setError("");

            const token = await getBackendToken();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to fetch users");
            }

            setUsers(result.data || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isPending) return;

        if (!session) {
            router.push("/sign-in");
            return;
        }

        if (session.user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }

        fetchUsers();
    }, [session, isPending, router]);

    async function handleRoleChange(userId, role) {
        try {
            setUpdatingId(userId);
            setError("");
            setSuccess("");

            const token = await getBackendToken();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to update role");
            }

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user._id === userId
                        ? { ...user, role }
                        : user
                )
            );

            setSuccess("User role updated successfully.");
        } catch (error) {
            setError(error.message);
        } finally {
            setUpdatingId("");
        }
    }

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            user.name?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText);

        const matchesRole =
            roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    function formatDate(date) {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    function getRoleStyle(role) {
        if (role === "admin") {
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        }

        if (role === "technician") {
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        }

        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    if (isPending || (loading && users.length === 0 && !error)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-[#E85D35]" size={30} />
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-gray-500">Checking admin access...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">

            {/* Heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-900 sm:text-3xl">
                        Manage Users
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        View registered users and manage their account roles.
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#E85D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d94b27] disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh Users
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <Users size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Users
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.length}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-green-600">
                            <UserRound size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Customers
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.filter((user) => user.role === "customer").length}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1c2029]">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                            <Wrench size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Technicians
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {users.filter((user) => user.role === "technician").length}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-blue-700 dark:border-blue-900 dark:bg-green-950/30 dark:text-blue-500">
                    {success}
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#1c2029] sm:flex-row">
                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#E85D35] dark:border-gray-700 dark:bg-[#151922] dark:text-white"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#E85D35] dark:border-gray-700 dark:bg-[#151922] dark:text-white"
                >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="technician">Technicians</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#1c2029]">
                <div className="border-b border-gray-200 p-5 dark:border-gray-800">
                    <h2 className="font-bold text-gray-900 dark:text-white">
                        Registered Users ({filteredUsers.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading users...
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 dark:bg-[#151922] dark:text-gray-400">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Joined</th>
                                    <th className="px-5 py-4">Current Role</th>
                                    <th className="px-5 py-4">Change Role</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredUsers.map((user) => {
                                    const isCurrentUser =
                                        user._id === session.user.id;

                                    return (
                                        <tr
                                            key={user._id}
                                            className="text-gray-700 dark:text-gray-300"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.image ? (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name || "User"}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-600 dark:bg-gray-700 dark:text-white">
                                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                        </div>
                                                    )}

                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {user.name || "Unnamed User"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {user.email}
                                            </td>

                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {formatDate(user.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {isCurrentUser ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                        <ShieldCheck size={15} />
                                                        Your Account
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={user.role || "customer"}
                                                        disabled={updatingId === user._id}
                                                        onChange={(e) =>
                                                            handleRoleChange(
                                                                user._id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#E85D35] disabled:opacity-50 dark:border-gray-700 dark:bg-[#151922] dark:text-white"
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="technician">Technician</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                )}

                                                {updatingId === user._id && (
                                                    <Loader2
                                                        size={15}
                                                        className="ml-2 inline animate-spin"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}
