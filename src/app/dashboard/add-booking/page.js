
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    Phone,
    User,
    Mail,
    Wrench,
    Star,
    LoaderCircle,
    CheckCircle,
    BadgeCheck,
    Tag,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { getBackendToken } from "@/lib/getBackendToken";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function AddBookingPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [checkingRole, setCheckingRole] = useState(true);
    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");

    const [formData, setFormData] = useState({
        serviceId: "",
        customerName: "",
        customerEmail: "",
        phone: "",
        address: "",
        bookingDate: "",
        bookingTime: "",
        repairMethod: "",
        problemDescription: "",
    });

    // ==========================================
    // THEME CLASSES
    // ==========================================

    const cardStyle =
        "rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900";

    const headingStyle =
        "font-bold text-gray-900 dark:text-white";

    const textStyle =
        "text-gray-600 dark:text-white";

    const labelStyle =
        "mb-2 block text-sm font-semibold text-gray-700 dark:text-white";

    const inputStyle =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-300 dark:focus:border-orange-500 dark:focus:ring-orange-500/20";

    const iconStyle =
        "absolute left-3 top-3.5 text-gray-400 dark:text-gray-300";

    const mutedBox =
        "rounded-xl bg-gray-50 p-4 dark:bg-slate-800";

    // ==========================================
    // BANGLADESH DATE AND TIME
    // ==========================================

    function getBangladeshDate() {
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).formatToParts(new Date());

        const year = parts.find((part) => part.type === "year").value;
        const month = parts.find((part) => part.type === "month").value;
        const day = parts.find((part) => part.type === "day").value;

        return `${year}-${month}-${day}`;
    }

    function getBangladeshTime() {
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Dhaka",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }).format(new Date());
    }

    const today = getBangladeshDate();

    const currentBangladeshTime = getBangladeshTime();

    const minimumTime =
        formData.bookingDate === today
            ? currentBangladeshTime
            : undefined;

    // ==========================================
    // SELECTED SERVICE
    // ==========================================

    const selectedService = services.find(
        (service) =>
            String(service._id || service.id) === formData.serviceId
    );

    // ==========================================
    // AVAILABLE CATEGORIES
    // ==========================================

    const categories = [
        ...new Set(
            services
                .map((service) => service.category)
                .filter(Boolean)
        ),
    ];

    // ==========================================
    // FILTER SERVICES BY CATEGORY
    // ==========================================

    const categoryServices = services.filter(
        (service) => service.category === selectedCategory
    );

    // ==========================================
    // VERIFY CUSTOMER
    // ==========================================

    useEffect(() => {
        async function checkCustomer() {
            if (isPending) return;

            if (!session?.user) {
                router.replace("/sign-in");
                return;
            }

            if (session.user.role !== "customer") {
                setMessage("Only customers can create repair bookings.");
                setMessageType("error");
                setCheckingRole(false);
                return;
            }

            try {
                const token = await getBackendToken();

                if (!token) {
                    throw new Error(
                        "Could not generate your authentication token. Please sign in again."
                    );
                }

                const response = await fetch(
                    `${API_URL}/api/bookings/my-bookings`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        `Account verification failed. Server status: ${response.status}`
                    );
                }

                setFormData((previous) => ({
                    ...previous,
                    customerName: session.user.name || "",
                    customerEmail: session.user.email || "",
                }));
            } catch (error) {
                console.error("Customer verification error:", error);

                setMessage(
                    error.message || "Could not verify your account."
                );

                setMessageType("error");
            } finally {
                setCheckingRole(false);
            }
        }

        checkCustomer();
    }, [session, isPending, router]);

    // ==========================================
    // LOAD AVAILABLE SERVICES
    // ==========================================

    useEffect(() => {
        async function loadServices() {
            try {
                const response = await fetch(
                    `${API_URL}/api/services`,
                    {
                        cache: "no-store",
                    }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load services."
                    );
                }

                const serviceList = Array.isArray(result)
                    ? result
                    : result.data || result.services || [];

                const availableServices = serviceList.filter(
                    (service) =>
                        service.isAvailable !== false &&
                        service.isDeleted !== true &&
                        service.approvalStatus === "approved"
                );

                setServices(availableServices);
            } catch (error) {
                console.error("Load services error:", error);

                setMessage(error.message || "Unable to load services.");
                setMessageType("error");
            } finally {
                setLoadingServices(false);
            }
        }

        loadServices();
    }, []);

    // ==========================================
    // HANDLE CATEGORY CHANGE
    // ==========================================

    function handleCategoryChange(event) {
        const category = event.target.value;

        setSelectedCategory(category);

        setFormData((previous) => ({
            ...previous,
            serviceId: "",
        }));

        setMessage("");
    }

    // ==========================================
    // HANDLE SERVICE CHANGE
    // ==========================================

    function handleServiceChange(event) {
        setFormData((previous) => ({
            ...previous,
            serviceId: event.target.value,
        }));

        setMessage("");
    }

    // ==========================================
    // HANDLE INPUT CHANGES
    // ==========================================

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setMessage("");
    }

    // ==========================================
    // HANDLE REPAIR METHOD
    // ==========================================

    function handleRepairMethod(method) {
        setFormData((previous) => ({
            ...previous,
            repairMethod: method,
        }));

        setMessage("");
    }

    // ==========================================
    // SUBMIT BOOKING
    // ==========================================

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setMessageType("");

        if (!selectedService) {
            setMessage("Please select an available repair service.");
            setMessageType("error");
            return;
        }

        if (
            !formData.phone.trim() ||
            formData.phone.trim().length < 8 ||
            formData.phone.trim().length > 20
        ) {
            setMessage("Please enter a valid phone number.");
            setMessageType("error");
            return;
        }

        if (
            !formData.address.trim() ||
            formData.address.trim().length < 5
        ) {
            setMessage("Please enter your complete contact address.");
            setMessageType("error");
            return;
        }

        if (
            formData.repairMethod !== "Home Visit" &&
            formData.repairMethod !== "Shop Drop-off"
        ) {
            setMessage("Please select Home Visit or Shop Drop-off.");
            setMessageType("error");
            return;
        }

        if (!formData.bookingDate || !formData.bookingTime) {
            setMessage("Please select your preferred booking date and time.");
            setMessageType("error");
            return;
        }

        // Interpret the selected date and time as Bangladesh time (UTC+6).
        const selectedDateTime = new Date(
            `${formData.bookingDate}T${formData.bookingTime}:00+06:00`
        );

        if (
            Number.isNaN(selectedDateTime.getTime()) ||
            formData.bookingDate < today ||
            selectedDateTime.getTime() <= Date.now()
        ) {
            setMessage("Please select a future booking date and time.");
            setMessageType("error");
            return;
        }

        if (formData.problemDescription.trim().length < 20) {
            setMessage(
                "Please describe your problem using at least 20 characters."
            );
            setMessageType("error");
            return;
        }

        if (formData.problemDescription.trim().length > 1000) {
            setMessage("Your description cannot exceed 1000 characters.");
            setMessageType("error");
            return;
        }

        setSubmitting(true);

        try {
            const token = await getBackendToken();

            if (!token) {
                throw new Error(
                    "Your session has expired. Please sign in again."
                );
            }

            const response = await fetch(
                `${API_URL}/api/bookings`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        serviceId: formData.serviceId,
                        phone: formData.phone.trim(),
                        address: formData.address.trim(),

                        // These names and values must match bookingRoutes.js.
                        repairMethod: formData.repairMethod,
                        bookingDate: formData.bookingDate,
                        bookingTime: formData.bookingTime,

                        problemDescription:
                            formData.problemDescription.trim(),
                    }),
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to submit booking."
                );
            }

            setMessage(
                result.message ||
                "Your booking request has been submitted successfully!"
            );

            setMessageType("success");

            setSelectedCategory("");

            setFormData((previous) => ({
                ...previous,
                serviceId: "",
                phone: "",
                address: "",
                bookingDate: "",
                bookingTime: "",
                repairMethod: "",
                problemDescription: "",
            }));
        } catch (error) {
            console.error("Booking submission error:", error);

            setMessage(
                error.message || "Something went wrong. Please try again."
            );

            setMessageType("error");
        } finally {
            setSubmitting(false);
        }
    }

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (isPending || checkingRole) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
                <LoaderCircle
                    className="animate-spin text-orange-500"
                    size={36}
                />
            </div>
        );
    }

    // ==========================================
    // CUSTOMER ACCESS CHECK
    // ==========================================

    if (session?.user?.role !== "customer") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white px-5 dark:bg-slate-950">
                <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-7 dark:border-amber-800 dark:bg-amber-950">
                    <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">
                        Booking Unavailable
                    </h2>

                    <p className="mt-3 text-amber-700 dark:text-amber-200">
                        {message || "Only customers can create repair bookings."}
                    </p>

                    <Link
                        href="/dashboard"
                        className="mt-5 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-white text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto w-full max-w-[1500px] px-5 py-8 md:px-10 lg:px-14">

                {/* HEADER */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href="/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-orange-500 dark:text-white dark:hover:text-orange-400"
                        >
                            <ArrowLeft size={17} />
                            Back to Dashboard
                        </Link>

                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                            Book a Repair Service
                        </h1>

                        <p className="mt-2 text-gray-500 dark:text-white">
                            Choose a service, meet your technician, and schedule your repair.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <BadgeCheck size={19} />
                        Customer Booking
                    </div>
                </div>

                {/* NOTIFICATION */}
                {message && (
                    <div
                        role="alert"
                        className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                            messageType === "success"
                                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                                : "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                    >
                        {messageType === "success" ? (
                            <CheckCircle size={20} />
                        ) : (
                            <Wrench size={20} />
                        )}

                        <p className="text-sm">{message}</p>
                    </div>
                )}

                {/* MAIN LAYOUT */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">

                    {/* LEFT: SERVICE INFORMATION */}
                    <div className="lg:col-span-5">
                        <div className={cardStyle}>
                            <div className="border-b border-gray-100 p-6 dark:border-slate-700">
                                <h2 className={`text-xl ${headingStyle}`}>
                                    Service Information
                                </h2>

                                <p className={`mt-1 text-sm ${textStyle}`}>
                                    First choose a category, then choose your preferred service.
                                </p>
                            </div>

                            <div className="p-6">

                                {/* CATEGORY */}
                                <div className="mb-5">
                                    <label className={labelStyle}>
                                        1. Select Service Category
                                    </label>

                                    <div className="relative">
                                        <Tag size={18} className={iconStyle} />

                                        <select
                                            value={selectedCategory}
                                            onChange={handleCategoryChange}
                                            disabled={loadingServices}
                                            required
                                            className={`${inputStyle} pl-10`}
                                        >
                                            <option value="">
                                                {loadingServices
                                                    ? "Loading categories..."
                                                    : "Choose a category"}
                                            </option>

                                            {categories.map((category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* SERVICE TITLE */}
                                <div>
                                    <label className={labelStyle}>
                                        2. Select Service Title
                                    </label>

                                    <div className="relative">
                                        <Wrench size={18} className={iconStyle} />

                                        <select
                                            name="serviceId"
                                            value={formData.serviceId}
                                            onChange={handleServiceChange}
                                            disabled={
                                                !selectedCategory ||
                                                loadingServices ||
                                                categoryServices.length === 0
                                            }
                                            required
                                            className={`${inputStyle} pl-10 disabled:bg-gray-100 disabled:text-gray-400 dark:disabled:bg-slate-800 dark:disabled:text-gray-300`}
                                        >
                                            <option value="">
                                                {!selectedCategory
                                                    ? "Choose a category first"
                                                    : categoryServices.length === 0
                                                        ? "No services in this category"
                                                        : "Choose a service title"}
                                            </option>

                                            {categoryServices.map((service) => (
                                                <option
                                                    key={service._id || service.id}
                                                    value={service._id || service.id}
                                                >
                                                    {service.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* SELECTED SERVICE DETAILS */}
                                {selectedService ? (
                                    <div className="mt-6">
                                        <div className="h-56 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-800">
                                            <img
                                                src={
                                                    selectedService.image ||
                                                    "/placeholder.png"
                                                }
                                                alt={selectedService.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="mt-5">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                                                <Tag size={13} />
                                                {selectedService.category}
                                            </span>

                                            <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                                                {selectedService.title}
                                            </h3>

                                            <div className="mt-2 flex items-center gap-2">
                                                <Star
                                                    size={17}
                                                    className="fill-yellow-400 text-yellow-400"
                                                />

                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {selectedService.rating || "New"}
                                                </span>

                                                <span className="text-sm text-gray-500 dark:text-white">
                                                    Service Rating
                                                </span>
                                            </div>
                                        </div>

                                        {/* SERVICE DETAILS */}
                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <div className={mutedBox}>
                                                <p className="mb-2 text-xs text-gray-500 dark:text-white">
                                                    Base Price
                                                </p>

                                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                    ৳{selectedService.basePrice}
                                                </p>
                                            </div>

                                            <div className={mutedBox}>
                                                <p className="mb-2 text-xs text-gray-500 dark:text-white">
                                                    Estimated Duration
                                                </p>

                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {selectedService.estimatedDuration || "Not specified"}
                                                </p>
                                            </div>

                                            <div className={mutedBox}>
                                                <p className="mb-2 text-xs text-gray-500 dark:text-white">
                                                    Service Mode
                                                </p>

                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {selectedService.serviceMode || "Not specified"}
                                                </p>
                                            </div>

                                            <div className={mutedBox}>
                                                <p className="mb-2 text-xs text-gray-500 dark:text-white">
                                                    Service Area
                                                </p>

                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                    {selectedService.serviceArea || "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* TECHNICIAN INFORMATION */}
                                        <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50/50 p-5 dark:border-orange-900 dark:bg-orange-950/40">
                                            <div className="mb-4 flex items-center gap-2">
                                                <User
                                                    size={19}
                                                    className="text-orange-500"
                                                />

                                                <h4 className="font-bold text-gray-900 dark:text-white">
                                                    Your Technician
                                                </h4>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                                                    <User size={24} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        {selectedService.technicianName || "Technician not assigned"}
                                                    </p>

                                                    <p className="break-all text-sm text-gray-500 dark:text-white">
                                                        {selectedService.technicianEmail || "No email available"}
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedService.technicianName && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                                    <BadgeCheck size={17} />
                                                    Assigned Service Technician
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-xl border border-dashed border-gray-200 py-10 text-center dark:border-slate-700">
                                        <Wrench
                                            size={35}
                                            className="mx-auto mb-3 text-gray-300 dark:text-gray-400"
                                        />

                                        <p className="font-semibold text-gray-600 dark:text-white">
                                            No service selected
                                        </p>

                                        <p className="mt-1 text-sm text-gray-400 dark:text-gray-300">
                                            Choose a category and service title above.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: BOOKING FORM */}
                    <div className="lg:col-span-7">
                        <div className={cardStyle}>
                            <div className="border-b border-gray-100 p-6 dark:border-slate-700 md:p-8">
                                <h2 className={`text-xl ${headingStyle}`}>
                                    Booking Details
                                </h2>

                                <p className={`mt-1 text-sm ${textStyle}`}>
                                    Provide your information to schedule the repair.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-6 p-6 md:p-8"
                            >
                                {/* CUSTOMER INFORMATION */}
                                <div>
                                    <h3 className={`mb-4 ${headingStyle}`}>
                                        Customer Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div>
                                            <label className={labelStyle}>
                                                Full Name
                                            </label>

                                            <div className="relative">
                                                <User size={18} className={iconStyle} />

                                                <input
                                                    type="text"
                                                    value={formData.customerName}
                                                    readOnly
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>
                                                Email Address
                                            </label>

                                            <div className="relative">
                                                <Mail size={18} className={iconStyle} />

                                                <input
                                                    type="email"
                                                    value={formData.customerEmail}
                                                    readOnly
                                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-700" />

                                {/* CONTACT DETAILS */}
                                <div>
                                    <h3 className={`mb-4 ${headingStyle}`}>
                                        Contact Details
                                    </h3>

                                    <div className="space-y-5">
                                        <div>
                                            <label className={labelStyle}>
                                                Phone Number
                                            </label>

                                            <div className="relative">
                                                <Phone size={18} className={iconStyle} />

                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    placeholder="01XXXXXXXXX"
                                                    minLength={8}
                                                    maxLength={20}
                                                    required
                                                    className={`${inputStyle} pl-10`}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelStyle}>
                                                Your Contact Address
                                            </label>

                                            <div className="relative">
                                                <MapPin size={18} className={iconStyle} />

                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="House, Road, Area, City"
                                                    minLength={5}
                                                    required
                                                    className={`${inputStyle} pl-10`}
                                                />
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500 dark:text-white">
                                                This address is for customer contact purposes.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-700" />

                                {/* REPAIR METHOD */}
                                <div>
                                    <h3 className={`mb-4 ${headingStyle}`}>
                                        Choose Repair Method
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        {/* HOME VISIT */}
                                        <button
                                            type="button"
                                            onClick={() => handleRepairMethod("Home Visit")}
                                            aria-pressed={formData.repairMethod === "Home Visit"}
                                            className={`rounded-xl border-2 p-5 text-left transition ${
                                                formData.repairMethod === "Home Visit"
                                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40"
                                                    : "border-gray-200 bg-white hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500"
                                            }`}
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <MapPin
                                                    size={27}
                                                    className="text-orange-500"
                                                />

                                                {formData.repairMethod === "Home Visit" && (
                                                    <CheckCircle
                                                        size={21}
                                                        className="text-orange-500"
                                                    />
                                                )}
                                            </div>

                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                Home Visit
                                            </h4>

                                            <p className="mt-1 text-sm text-gray-600 dark:text-white">
                                                The technician visits your home to repair your device.
                                            </p>
                                        </button>

                                        {/* SHOP DROP-OFF */}
                                        <button
                                            type="button"
                                            onClick={() => handleRepairMethod("Shop Drop-off")}
                                            aria-pressed={formData.repairMethod === "Shop Drop-off"}
                                            className={`rounded-xl border-2 p-5 text-left transition ${
                                                formData.repairMethod === "Shop Drop-off"
                                                    ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40"
                                                    : "border-gray-200 bg-white hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500"
                                            }`}
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <Wrench
                                                    size={27}
                                                    className="text-orange-500"
                                                />

                                                {formData.repairMethod === "Shop Drop-off" && (
                                                    <CheckCircle
                                                        size={21}
                                                        className="text-orange-500"
                                                    />
                                                )}
                                            </div>

                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                Shop Drop-off
                                            </h4>

                                            <p className="mt-1 text-sm text-gray-600 dark:text-white">
                                                You take your device to the technician's shop.
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-700" />

                                {/* SCHEDULE */}
                                <div>
                                    <h3 className={`mb-4 ${headingStyle}`}>
                                        Schedule Your Repair
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                        {/* BOOKING DATE */}
                                        <div>
                                            <label className={labelStyle}>
                                                Preferred Repair Date
                                            </label>

                                            <div className="relative">
                                                <CalendarDays
                                                    size={18}
                                                    className={iconStyle}
                                                />

                                                <input
                                                    type="date"
                                                    name="bookingDate"
                                                    value={formData.bookingDate}
                                                    onChange={(event) => {
                                                        setFormData((previous) => ({
                                                            ...previous,
                                                            bookingDate: event.target.value,
                                                            bookingTime: "",
                                                        }));
                                                        setMessage("");
                                                    }}
                                                    min={today}
                                                    required
                                                    className={`${inputStyle} pl-10`}
                                                />
                                            </div>
                                        </div>

                                        {/* BOOKING TIME */}
                                        <div>
                                            <label className={labelStyle}>
                                                Preferred Repair Time
                                            </label>

                                            <div className="relative">
                                                <Clock
                                                    size={18}
                                                    className={iconStyle}
                                                />

                                                <input
                                                    type="time"
                                                    name="bookingTime"
                                                    value={formData.bookingTime}
                                                    onChange={handleChange}
                                                    min={minimumTime}
                                                    required
                                                    disabled={!formData.bookingDate}
                                                    className={`${inputStyle} pl-10 disabled:cursor-not-allowed disabled:opacity-60`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500 dark:text-white">
                                        Select a future date and time. All booking times use Bangladesh Standard Time (UTC+6).
                                    </p>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-700" />

                                {/* PROBLEM DESCRIPTION */}
                                <div>
                                    <label className={labelStyle}>
                                        Describe Your Problem
                                    </label>

                                    <textarea
                                        name="problemDescription"
                                        value={formData.problemDescription}
                                        onChange={handleChange}
                                        rows={4}
                                        minLength={20}
                                        maxLength={1000}
                                        required
                                        placeholder="Describe the repair problem and any important details..."
                                        className={`${inputStyle} resize-none`}
                                    />

                                    <p className="mt-2 text-xs text-gray-500 dark:text-white">
                                        Minimum 20 characters, maximum 1000 characters.
                                        {" "}
                                        {formData.problemDescription.length}/1000
                                    </p>
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        loadingServices ||
                                        !selectedService
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-700"
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle
                                                size={20}
                                                className="animate-spin"
                                            />
                                            Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            Confirm Booking Request
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-gray-500 dark:text-white">
                                    Your booking request will be sent to the selected technician.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
