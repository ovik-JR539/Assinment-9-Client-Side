
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
    Search,
    RefreshCw,
    ClipboardList,
    Loader2,
    UserRound,
    Wrench,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Tag,
    MapPin,
    CalendarDays,
    Trash2,
    X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

export default function AdminServicesPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [services, setServices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [actionLoading, setActionLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [clearLoading, setClearLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

    // ADMIN AUTHENTICATION
    useEffect(() => {
        if (isPending) return;

        if (!session?.user) {
            router.push("/sign-in");
            return;
        }

        if (session.user.role !== "admin") {
            router.push("/");
        }
    }, [session, isPending, router]);

    // FETCH ALL SERVICES
    const fetchServices = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");
            setSuccess("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${API_URL}/api/admin/services`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load services."
                );
            }

            setServices(
                Array.isArray(result.data) ? result.data : []
            );
        } catch (err) {
            console.error("Fetch services error:", err);
            setError(err.message || "Unable to load services.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [API_URL]);

    // LOAD SERVICES AFTER ADMIN AUTHENTICATION
    useEffect(() => {
        if (!isPending && session?.user?.role === "admin") {
            fetchServices();
        }
    }, [session, isPending, fetchServices]);

    // APPROVE OR REJECT SERVICE
    const handleServiceAction = async (serviceId, action) => {
        const actionText = action === "approve" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${actionText} this service?`)) {
            return;
        }

        try {
            setActionLoading(serviceId);
            setError("");
            setSuccess("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${API_URL}/api/admin/services/${serviceId}/${action}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Service update failed."
                );
            }

            setServices((previousServices) =>
                previousServices.map((service) =>
                    service._id === serviceId
                        ? {
                            ...service,
                            ...(result.data || {}),
                            approvalStatus:
                                action === "approve"
                                    ? "approved"
                                    : "rejected",
                        }
                        : service
                )
            );

            setSuccess(
                action === "approve"
                    ? "Service approved successfully."
                    : "Service rejected successfully."
            );
        } catch (err) {
            console.error("Service action error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setActionLoading(null);
        }
    };

    // DELETE ONE SERVICE
    const handleDeleteService = async (serviceId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this service permanently?"
        );

        if (!confirmed) return;

        try {
            setDeleteLoading(serviceId);
            setError("");
            setSuccess("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${API_URL}/api/admin/services/${serviceId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to delete service."
                );
            }

            setServices((previousServices) =>
                previousServices.filter(
                    (service) => service._id !== serviceId
                )
            );

            setSuccess("Service deleted successfully.");
        } catch (err) {
            console.error("Delete service error:", err);
            setError(err.message || "Unable to delete service.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // DELETE ALL SERVICES
    const handleClearAllServices = async () => {
        if (services.length === 0) {
            setError("There are no services to delete.");
            return;
        }

        const confirmed = window.confirm(
            `WARNING: You are about to permanently delete all ${services.length} services.\n\nThis includes pending, approved, and rejected services.\n\nThis action cannot be undone.\n\nDo you want to continue?`
        );

        if (!confirmed) return;

        try {
            setClearLoading(true);
            setError("");
            setSuccess("");

            const token = await getBackendToken();

            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch(
                `${API_URL}/api/admin/services`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to clear services."
                );
            }

            setServices([]);

            setSearchTerm("");
            setStatusFilter("all");

            setSuccess(
                `${result.deletedCount ?? services.length} services deleted successfully.`
            );
        } catch (err) {
            console.error("Clear services error:", err);
            setError(err.message || "Unable to delete all services.");
        } finally {
            setClearLoading(false);
        }
    };

    // FILTER SERVICES
    const filteredServices = services.filter((service) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            (service.title || "").toLowerCase().includes(search) ||
            (service.category || "").toLowerCase().includes(search) ||
            (service.technicianName || "").toLowerCase().includes(search) ||
            (service.technicianEmail || "").toLowerCase().includes(search);

        const matchesStatus =
            statusFilter === "all" ||
            service.approvalStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // LOADING
    if (isPending || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-gray-500">
                        Loading service applications...
                    </p>
                </div>
            </div>
        );
    }

    if (!session?.user || session.user.role !== "admin") {
        return null;
    }

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Service Approval
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Review services submitted by technicians and approve or reject their applications.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">

                    <button
                        onClick={handleClearAllServices}
                        disabled={clearLoading || services.length === 0}
                        className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {clearLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}

                        {clearLoading ? "Clearing..." : "All Clear"}
                    </button>

                    <button
                        onClick={() => fetchServices(true)}
                        disabled={refreshing || clearLoading}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>

                </div>
            </div>

            {/* MESSAGES */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {/* SUMMARY */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                    title="Total Services"
                    value={services.length}
                    icon={<ClipboardList size={22} />}
                    color="text-blue-600"
                />

                <SummaryCard
                    title="Pending Approval"
                    value={services.filter(
                        (service) => service.approvalStatus === "pending"
                    ).length}
                    icon={<Clock size={22} />}
                    color="text-yellow-600"
                />

                <SummaryCard
                    title="Approved Services"
                    value={services.filter(
                        (service) => service.approvalStatus === "approved"
                    ).length}
                    icon={<CheckCircle size={22} />}
                    color="text-green-600"
                />

                <SummaryCard
                    title="Rejected Services"
                    value={services.filter(
                        (service) => service.approvalStatus === "rejected"
                    ).length}
                    icon={<XCircle size={22} />}
                    color="text-red-600"
                />

            </div>

            {/* SEARCH AND FILTER */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#1c2029]">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search service or technician..."
                            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-gray-600 dark:bg-[#111318] dark:text-white"
                    >
                        <option value="all">All Services</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                </div>
            </div>

            {/* SERVICE APPLICATIONS */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#1c2029]">

                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                        Technician Service Applications
                    </h2>

                    <span className="text-sm text-gray-500">
                        {filteredServices.length} services
                    </span>
                </div>

                {filteredServices.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <Wrench
                            size={42}
                            className="mx-auto mb-3 text-gray-300"
                        />

                        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                            No services found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            No service applications match your search or filter.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">

                        {filteredServices.map((service) => (
                            <div
                                key={service._id}
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#111318]"
                            >

                                {/* SERVICE IMAGE */}
                                <div className="relative h-52 bg-gray-100 dark:bg-gray-800">

                                    <img
                                        src={
                                            service.image ||
                                            "/theme/Avater.png"
                                        }
                                        alt={service.title || "Service"}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "/theme/Avater.png";
                                        }}
                                    />

                                    {/* APPROVAL STATUS */}
                                    <div className="absolute right-3 top-3">
                                        <StatusBadge
                                            status={service.approvalStatus}
                                        />
                                    </div>

                                    {/* DELETE ONE CARD */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteService(service._id)
                                        }
                                        disabled={
                                            deleteLoading === service._id ||
                                            clearLoading
                                        }
                                        title="Delete this service"
                                        aria-label="Delete this service"
                                        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deleteLoading === service._id ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <X size={19} />
                                        )}
                                    </button>

                                </div>

                                {/* SERVICE INFORMATION */}
                                <div className="space-y-4 p-5">

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {service.title || "Untitled Service"}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {service.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    {/* CATEGORY AND PRICE */}
                                    <div className="flex flex-wrap gap-3">

                                        <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                            <Tag size={14} />
                                            {service.category || "Other"}
                                        </span>

                                        <span className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                            ৳{Number(
                                                service.basePrice || 0
                                            ).toLocaleString("en-BD")}
                                        </span>

                                    </div>

                                    {/* SERVICE DETAILS */}
                                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">

                                        <DetailItem
                                            icon={<MapPin size={15} />}
                                            label="Service Area"
                                            value={service.serviceArea}
                                        />

                                        <DetailItem
                                            icon={<Wrench size={15} />}
                                            label="Service Mode"
                                            value={service.serviceMode}
                                        />

                                        <DetailItem
                                            icon={<Clock size={15} />}
                                            label="Estimated Duration"
                                            value={service.estimatedDuration}
                                        />

                                        <DetailItem
                                            icon={<CalendarDays size={15} />}
                                            label="Submitted"
                                            value={
                                                service.createdAt
                                                    ? new Date(
                                                        service.createdAt
                                                    ).toLocaleDateString()
                                                    : "N/A"
                                            }
                                        />

                                    </div>

                                    {/* TECHNICIAN INFORMATION */}
                                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-[#1c2029]">

                                        <div className="mb-2 flex items-center gap-2">
                                            <UserRound
                                                size={17}
                                                className="text-gray-500"
                                            />

                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                Technician Information
                                            </p>
                                        </div>

                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {service.technicianName || "Unknown Technician"}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {service.technicianEmail || ""}
                                        </p>

                                    </div>

                                    {/* APPROVE AND REJECT */}
                                    {service.approvalStatus === "pending" ? (
                                        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">

                                            <button
                                                onClick={() =>
                                                    handleServiceAction(
                                                        service._id,
                                                        "approve"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === service._id ||
                                                    deleteLoading === service._id ||
                                                    clearLoading
                                                }
                                                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {actionLoading === service._id ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <CheckCircle size={16} />
                                                )}

                                                Approve
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleServiceAction(
                                                        service._id,
                                                        "reject"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === service._id ||
                                                    deleteLoading === service._id ||
                                                    clearLoading
                                                }
                                                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {actionLoading === service._id ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <XCircle size={16} />
                                                )}

                                                Reject
                                            </button>

                                        </div>
                                    ) : (
                                        <div className="border-t border-gray-100 pt-4 dark:border-gray-700">

                                            {service.approvalStatus === "approved" ? (
                                                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                                    <CheckCircle size={17} />
                                                    This service has been approved.
                                                </div>
                                            ) : service.approvalStatus === "rejected" ? (
                                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                                    <XCircle size={17} />
                                                    This service has been rejected.
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    No action available.
                                                </p>
                                            )}

                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

// SUMMARY CARD
function SummaryCard({
    title,
    value,
    icon,
    color = "text-blue-600",
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-[#1c2029]">
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-gray-500">{title}</p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </h3>
                </div>

                <div className={color}>
                    {icon}
                </div>

            </div>
        </div>
    );
}

// SERVICE STATUS BADGE
function StatusBadge({ status }) {
    const statusStyles = {
        pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
        approved: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    };

    const statusLabels = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
    };

    return (
        <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                statusStyles[status] || "bg-gray-100 text-gray-700"
            }`}
        >
            {statusLabels[status] || "Unknown"}
        </span>
    );
}

// SERVICE DETAIL ITEM
function DetailItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">

            <span className="mt-0.5 text-gray-400">
                {icon}
            </span>

            <div>
                <p className="text-xs text-gray-500">{label}</p>

                <p className="font-medium text-gray-800 dark:text-gray-200">
                    {value || "Not provided"}
                </p>
            </div>

        </div>
    );
}
