
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    SlidersHorizontal,
    MapPin,
    Wrench,
    ArrowUpDown,
    X,
} from "lucide-react";


import ServiceCard from "@/components/ServiceCard";

const categories = [
    "Smartphone",
    "Laptop & PC",
    "AC",
    "Refrigerator",
    "TV",
    "Washing Machine",
    "Other",
];

export default function ServicesClient({
    services = [],
    initialSearch = "",
    initialArea = "",
    initialCategory = "",
}) {

    const [search, setSearch] = useState(initialSearch);
    const [area, setArea] = useState(initialArea);
    const [category, setCategory] = useState(initialCategory);
    const [serviceMode, setServiceMode] = useState("");
    const [sort, setSort] = useState("newest");
    console.log("Services received:", services);
    console.log("Services count:", services.length);

    // Filter services
    let filteredServices = services.filter((service) => {

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            service.title?.toLowerCase().includes(searchText) ||
            service.category?.toLowerCase().includes(searchText) ||
            service.description?.toLowerCase().includes(searchText) ||
            service.technicianName?.toLowerCase().includes(searchText);


        const matchesArea =
            !area ||
            service.serviceArea?.toLowerCase().includes(area.toLowerCase());

        const matchesCategory =
            !category || service.category === category;

        const matchesMode =
            !serviceMode || service.serviceMode === serviceMode;

        return (
            matchesSearch &&
            matchesArea &&
            matchesCategory &&
            matchesMode
        );
    });

    // Sort services
    if (sort === "low-to-high") {
        filteredServices.sort(
            (a, b) => a.basePrice - b.basePrice
        );
    }

    if (sort === "high-to-low") {
        filteredServices.sort(
            (a, b) => b.basePrice - a.basePrice
        );
    }

    if (sort === "newest") {
        filteredServices.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        );
    }

    function clearFilters() {
        setSearch("");
        setArea("");
        setCategory("");
        setServiceMode("");
        setSort("newest");
    }

    return (
        <main className="min-h-screen bg-slate-50">



            {/* Page heading */}
            <section className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 py-16 text-white">

                <div className="mx-auto max-w-7xl px-5">

                    <p className="text-sm font-semibold uppercase tracking-widest text-pink-200">
                        Find Your Repair Solution
                    </p>

                    <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl md:text-5xl">
                        Explore Our Services
                    </h1>

                    <p className="mt-4 max-w-2xl text-purple-100">
                        Find the right repair service for your home appliances
                        and connect with technicians.
                    </p>

                </div>

            </section>

            <div className="mx-auto max-w-7xl px-5 py-12">

                {/* Search and filters */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        {/* Search */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Search Services
                            </label>

                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                                <Search size={18} className="text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search appliance..."
                                    className="w-full py-3 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Location
                            </label>

                            <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
                                <MapPin size={18} className="text-slate-400" />

                                <input
                                    type="text"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    placeholder="Enter your area..."
                                    className="w-full py-3 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                            >
                                <option value="">All Categories</option>

                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service mode */}
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Service Mode
                            </label>

                            <select
                                value={serviceMode}
                                onChange={(e) => setServiceMode(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                            >
                                <option value="">All Modes</option>
                                <option value="Home Visit">Home Visit</option>
                                <option value="Shop Drop-off">Shop Drop-off</option>
                            </select>
                        </div>

                    </div>

                    {/* Sort and clear */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">

                        <div className="flex items-center gap-2">
                            <ArrowUpDown size={18} className="text-slate-500" />

                            <span className="text-sm font-semibold text-slate-700">
                                Sort by:
                            </span>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                            >
                                <option value="newest">Newest First</option>
                                <option value="low-to-high">Price: Low to High</option>
                                <option value="high-to-low">Price: High to Low</option>
                            </select>
                        </div>

                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700"
                        >
                            <X size={16} />
                            Clear Filters
                        </button>

                    </div>

                </div>

                {/* Service results */}
                <div className="mt-10">

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                Available Repair Services
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Find the right technician for your needs.
                            </p>
                        </div>

                        <span className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
                            {filteredServices.length} Services Found
                        </span>

                    </div>

                    {filteredServices.length > 0 ? (

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {filteredServices.map((service) => (
                                <ServiceCard
                                    key={service._id}
                                    service={service}
                                />
                            ))}

                        </div>

                    ) : (

                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                                <Wrench size={30} />
                            </div>

                            <h3 className="mt-5 text-xl font-bold text-slate-900">
                                No Services Found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                We couldn`t find any repair services matching
                                your search. Try changing your search or filters.
                            </p>

                            <button
                                onClick={clearFilters}
                                className="mt-6 rounded-lg bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                            >
                                Clear All Filters
                            </button>

                        </div>

                    )}

                </div>

            </div>



        </main>
    );
}
