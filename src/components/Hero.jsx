
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Search,
    MapPin,
    ArrowRight,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Wrench,
    LoaderCircle,
    X,
} from "lucide-react";

const images = [
    "/images/PHONE-1.jpg",
    "/images/PHONE-2.jpg",
    "/images/PHONE-3.jpg",
    "/images/PHONE-4.jpg",
    "/images/PHONE-5.jpg",
    "/images/PHONE-6.jpg",
    "/images/PHONE-7.jpg",
];

const locations = [
    "All Location",
    "Gulshan",
    "Banani",
    "Baridhara",
    "Bashundhara Residential Area",
    "Dhanmondi",
    "Uttara",
    "Niketan",
    "DOHS Baridhara",
    "Banani DOHS",
    "Gulshan 1",
    "Gulshan 2",
    "Aftabnagar",
    "Lalmatia",
    "Nikunja",
    "Dhanmondi 27",
    "Mirpur-10",
    "Mohammadpur",
    "Farmgate",
    "Motijheel",
    "Jatrabari",
    "Badda",
    "Sadarghat",
];

const categories = [
    "Smartphone",
    "Laptop & PC",
    "TV",
    "Washing Machine",
    "Refrigerator",
    "AC",
    "Other",
];

export default function Hero() {
    const router = useRouter();

    const [activeSlide, setActiveSlide] = useState(0);

    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");

    const [services, setServices] = useState([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [serviceError, setServiceError] = useState("");

    const [hasFetched, setHasFetched] = useState(false);

    // Dropdown states
    const [activeDropdown, setActiveDropdown] = useState("");
    const [lockedDropdown, setLockedDropdown] = useState("");

    // Image slider
    useEffect(() => {
        const sliderInterval = setInterval(() => {
            setActiveSlide((previous) =>
                previous === images.length - 1 ? 0 : previous + 1
            );
        }, 5000);

        return () => clearInterval(sliderInterval);
    }, []);

    function previousSlide() {
        setActiveSlide((previous) =>
            previous === 0 ? images.length - 1 : previous - 1
        );
    }

    function nextSlide() {
        setActiveSlide((previous) =>
            previous === images.length - 1 ? 0 : previous + 1
        );
    }

    // Load approved services
    async function fetchServices() {
        if (hasFetched || loadingServices) return;

        try {
            setLoadingServices(true);
            setServiceError("");

            const apiUrl = (
                process.env.NEXT_PUBLIC_API_URL || ""
            ).replace(/\/$/, "");

            const response = await fetch(
                `${apiUrl}/api/services`,
                { cache: "no-store" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to load services"
                );
            }

            setServices(
                Array.isArray(result.data) ? result.data : []
            );

            setHasFetched(true);
        } catch (error) {
            console.error("Service loading error:", error);
            setServiceError(
                "Unable to load services. Please try again."
            );
        } finally {
            setLoadingServices(false);
        }
    }

    // Open dropdown when hovering
    function handleMouseEnter(name) {
        if (lockedDropdown) return;

        setActiveDropdown(name);

        if (name === "services") {
            fetchServices();
        }
    }

    // Close dropdown when mouse leaves
    function handleMouseLeave(name) {
        if (lockedDropdown === name) return;

        setActiveDropdown("");
    }

    // Click to keep dropdown open
    function handleDropdownClick(name) {
        if (lockedDropdown === name) {
            setLockedDropdown("");
            setActiveDropdown("");
            return;
        }

        setLockedDropdown(name);
        setActiveDropdown(name);

        if (name === "services") {
            fetchServices();
        }
    }

    // Close dropdown
    function closeDropdown() {
        setActiveDropdown("");
        setLockedDropdown("");
    }

    // Select location
    function selectLocation(value) {
        // All Location means no location filter
        setLocation(value === "All Location" ? "" : value);

        closeDropdown();

        // If category is selected, immediately show its matching services
        if (category) {
            setActiveDropdown("services");
            fetchServices();
        }
    }

    // Select category
    function selectCategory(value) {
        setCategory(value);
        closeDropdown();

        // Show all services from the selected category
        if (value) {
            setActiveDropdown("services");
            fetchServices();
        }
    }

    // Normalize text for comparison
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    // Filter services using category, location and search
    const filteredServices = services.filter((service) => {
        // Category filter
        const categoryMatch =
            !category ||
            normalize(service.category) === normalize(category);

        // Location filter
        const serviceAreas = Array.isArray(service.serviceArea)
            ? service.serviceArea
            : [service.serviceArea || service.location];

        const locationMatch =
            !location ||
            serviceAreas.some((area) =>
                normalize(area).includes(normalize(location))
            );

        // Search filter
        const searchMatch =
            !search ||
            normalize(service.title).includes(normalize(search)) ||
            normalize(service.description).includes(normalize(search)) ||
            normalize(service.category).includes(normalize(search)) ||
            serviceAreas.some((area) =>
                normalize(area).includes(normalize(search))
            );

        return categoryMatch && locationMatch && searchMatch;
    });

    // Open service details
    function openService(service) {
        if (!service?._id) return;

        closeDropdown();

        router.push(`/services/${service._id}`);
    }

    // Search button
    function handleSearch(event) {
        event.preventDefault();

        const params = new URLSearchParams();

        if (location) {
            params.set("area", location);
        }

        if (category) {
            params.set("category", category);
        }

        if (search.trim()) {
            params.set("search", search.trim());
        }

        closeDropdown();

        router.push(
            params.toString()
                ? `/services?${params.toString()}`
                : "/services"
        );
    }

    function dropdownClasses(name) {
        return activeDropdown === name ? "block" : "hidden";
    }

    return (
        <section className="relative min-h-[850px] w-full overflow-hidden bg-slate-900">

            {/* Background Image Slider */}
            {images.map((image, index) => (
                <div
                    key={image}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                        activeSlide === index
                            ? "opacity-100"
                            : "opacity-0"
                    }`}
                >
                    <Image
                        src={image}
                        alt={`FixMate home repair service ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </div>
            ))}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/65" />

            {/* Hero Content */}
            <div className="relative z-10 mx-auto flex min-h-[750px] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center">

                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    <ShieldCheck size={17} className="text-purple-400" />
                    Reliable Home Repair Services
                </div>

                {/* Heading */}
                <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                    Your Home Deserves
                    <span className="block text-purple-400">
                        Expert Care
                    </span>
                </h1>

                {/* Description */}
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                    Find trusted technicians for your appliances.
                    Book professional repair services quickly and easily.
                </p>

                {/* Search Form */}
                <form
                    onSubmit={handleSearch}
                    className="mt-10 flex w-full max-w-6xl flex-col gap-2 rounded-2xl bg-white p-3 shadow-2xl md:flex-row md:items-center md:rounded-xl"
                >

                    {/* LOCATION */}
                    <div
                        className="relative rounded-lg md:w-[230px]"
                        onMouseEnter={() => handleMouseEnter("location")}
                        onMouseLeave={() => handleMouseLeave("location")}
                    >
                        <button
                            type="button"
                            onClick={() => handleDropdownClick("location")}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                            <MapPin
                                className="shrink-0 text-purple-600"
                                size={22}
                            />

                            <div className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Your Location
                                </span>

                                <span className="block truncate text-sm font-semibold text-slate-800">
                                    {location || "Select your area"}
                                </span>
                            </div>

                            <ChevronDown
                                size={17}
                                className={`text-slate-400 transition ${
                                    activeDropdown === "location"
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        <div
                            className={`${dropdownClasses("location")} absolute left-0 top-full z-50 mt-2 max-h-72 w-full min-w-[260px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 text-left shadow-2xl`}
                        >
                            <div className="flex items-center justify-between px-3 py-2">
                                <p className="text-xs font-bold uppercase text-slate-400">
                                    Available Service Areas
                                </p>

                                <button
                                    type="button"
                                    onClick={closeDropdown}
                                    aria-label="Close locations"
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {locations.map((area) => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => selectLocation(area)}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition hover:bg-purple-50 hover:text-purple-700 ${
                                        (area === "All Location" && !location) ||
                                        location === area
                                            ? "bg-purple-50 font-semibold text-purple-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    <MapPin size={15} />
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden h-12 w-px bg-slate-200 md:block" />

                    {/* CATEGORY */}
                    <div
                        className="relative rounded-lg md:w-[210px]"
                        onMouseEnter={() => handleMouseEnter("category")}
                        onMouseLeave={() => handleMouseLeave("category")}
                    >
                        <button
                            type="button"
                            onClick={() => handleDropdownClick("category")}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition hover:bg-slate-50"
                        >
                            <Wrench
                                className="shrink-0 text-purple-600"
                                size={22}
                            />

                            <div className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Category
                                </span>

                                <span className="block truncate text-sm font-semibold text-slate-800">
                                    {category || "All Categories"}
                                </span>
                            </div>

                            <ChevronDown
                                size={17}
                                className={`text-slate-400 transition ${
                                    activeDropdown === "category"
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        <div
                            className={`${dropdownClasses("category")} absolute left-0 top-full z-50 mt-2 w-full min-w-[230px] rounded-xl border border-slate-200 bg-white p-2 text-left shadow-2xl`}
                        >
                            <div className="flex items-center justify-between px-3 py-2">
                                <p className="text-xs font-bold uppercase text-slate-400">
                                    Select Category
                                </p>

                                <button
                                    type="button"
                                    onClick={closeDropdown}
                                    aria-label="Close categories"
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => selectCategory("")}
                                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-purple-50 ${
                                    !category
                                        ? "bg-purple-50 text-purple-700"
                                        : "text-slate-700"
                                }`}
                            >
                                All Categories
                            </button>

                            {categories.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => selectCategory(item)}
                                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-purple-50 hover:text-purple-700 ${
                                        category === item
                                            ? "bg-purple-50 font-semibold text-purple-700"
                                            : "text-slate-700"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="hidden h-12 w-px bg-slate-200 md:block" />

                    {/* SERVICE SEARCH */}
                    <div
                        className="relative flex-1"
                        onMouseEnter={() => handleMouseEnter("services")}
                        onMouseLeave={() => handleMouseLeave("services")}
                    >
                        <div className="flex items-center gap-3 rounded-lg px-4 py-3">
                            <Search
                                className="shrink-0 text-slate-400"
                                size={22}
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setActiveDropdown("services");
                                    fetchServices();
                                }}
                                onFocus={() => {
                                    setActiveDropdown("services");
                                    fetchServices();
                                }}
                                onClick={() => {
                                    setLockedDropdown("services");
                                    setActiveDropdown("services");
                                    fetchServices();
                                }}
                                placeholder="Search repair services..."
                                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                            />

                            {loadingServices && (
                                <LoaderCircle
                                    size={19}
                                    className="animate-spin text-purple-600"
                                />
                            )}
                        </div>

                        {/* Service Results Dropdown */}
                        <div
                            className={`${dropdownClasses("services")} absolute left-0 top-full z-50 mt-2 max-h-80 w-full min-w-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 text-left shadow-2xl`}
                        >
                            <div className="flex items-center justify-between px-3 py-2">
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">
                                        Available Repair Services
                                    </p>

                                    {(category || location) && (
                                        <p className="mt-1 text-xs text-purple-600">
                                            {category || "All Categories"}
                                            {location ? ` · ${location}` : ""}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={closeDropdown}
                                    aria-label="Close services"
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {loadingServices && (
                                <p className="px-3 py-5 text-center text-sm text-slate-500">
                                    Loading services...
                                </p>
                            )}

                            {!loadingServices && serviceError && (
                                <div className="px-3 py-5 text-center">
                                    <p className="text-sm text-red-500">
                                        {serviceError}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setHasFetched(false);
                                            fetchServices();
                                        }}
                                        className="mt-2 text-sm font-semibold text-purple-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {!loadingServices &&
                                !serviceError &&
                                filteredServices.length === 0 && (
                                    <p className="px-3 py-5 text-center text-sm text-slate-500">
                                        No matching services found.
                                    </p>
                                )}

                            {!loadingServices &&
                                !serviceError &&
                                filteredServices.map((service) => (
                                    <button
                                        key={service._id}
                                        type="button"
                                        onClick={() => openService(service)}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-purple-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-purple-100">
                                            {service.image ? (
                                                <img
                                                    src={service.image}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Wrench
                                                    size={19}
                                                    className="text-purple-700"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                {service.title}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {service.category}
                                                {serviceAreasForDisplay(service)}
                                            </p>
                                        </div>

                                        <ArrowRight
                                            size={16}
                                            className="shrink-0 text-purple-600"
                                        />
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* SEARCH BUTTON */}
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 rounded-lg bg-purple-800 px-8 py-4 font-semibold text-white transition hover:bg-purple-900"
                    >
                        <Search size={19} />
                        <span>Search</span>
                        <ArrowRight size={17} />
                    </button>
                </form>

                <p className="mt-5 text-sm text-slate-300">
                    Find the right repair service for your home.
                </p>
            </div>

            {/* Previous Button */}
            <button
                onClick={previousSlide}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-purple-700 sm:left-8 sm:h-14 sm:w-14"
            >
                <ChevronLeft size={28} />
            </button>

            {/* Next Button */}
            <button
                onClick={nextSlide}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition hover:bg-white hover:text-purple-700 sm:right-8 sm:h-14 sm:w-14"
            >
                <ChevronRight size={28} />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeSlide === index
                                ? "w-8 bg-purple-400"
                                : "w-2.5 bg-white/60 hover:bg-white"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}

// Helper for displaying a service's area
function serviceAreasForDisplay(service) {
    const areas = Array.isArray(service.serviceArea)
        ? service.serviceArea
        : [service.serviceArea || service.location];

    const firstArea = areas.find(Boolean);

    return firstArea ? ` · ${firstArea}` : "";
}
