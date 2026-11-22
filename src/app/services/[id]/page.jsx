
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import RequestRepairForm from "@/components/RequestRepairForm";
import AddToMyListingsButton from "@/components/AddToMyListingsButton";

import {
    MapPin,
    Clock,
    Wrench,
    User,
    Mail,
    ArrowLeft,
    CheckCircle,
    Star,
} from "lucide-react";

import Link from "next/link";

// Fetch one service from Express API
async function getService(id) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
            throw new Error("API URL is missing");
        }

        const response = await fetch(
            `${apiUrl}/api/services/${id}`,
            {
                cache: "no-store",
            }
        );

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        return result.data;

    } catch (error) {
        console.error("Service details error:", error.message);
        return null;
    }
}

export default async function ServiceDetailsPage({ params }) {
    const { id } = await params;

    const service = await getService(id);

    if (!service) {
        notFound();
    }

    const rating = Number(service.rating);
    const hasRating = Number.isFinite(rating) && rating > 0;

    return (
        <main className="min-h-screen bg-slate-50">

            <section className="mx-auto max-w-7xl px-5 py-12">

                {/* Back button */}
                <Link
                    href="/services"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
                >
                    <ArrowLeft size={18} />
                    Back to Services
                </Link>

                <div className="grid gap-10 lg:grid-cols-2">

                    {/* Service image */}
                    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

                        {service.image ? (
                            <img
                                src={service.image}
                                alt={service.title}
                                className="h-[350px] w-full object-cover sm:h-[500px]"
                            />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center bg-slate-200 text-slate-500 sm:h-[500px]">
                                No image available
                            </div>
                        )}

                    </div>

                    {/* Service information */}
                    <div className="flex flex-col justify-center">

                        <span className="w-fit rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                            {service.category}
                        </span>

                        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            {service.title}
                        </h1>

                        {/* Rating */}
                        <div className="mt-4 flex items-center gap-2">

                            <Star
                                size={20}
                                className="fill-amber-400 text-amber-400"
                            />

                            {hasRating ? (
                                <span className="font-bold text-slate-800">
                                    {rating.toFixed(1)} / 5
                                </span>
                            ) : (
                                <span className="text-sm text-slate-500">
                                    No ratings yet
                                </span>
                            )}

                        </div>

                        <p className="mt-5 leading-7 text-slate-600">
                            {service.description}
                        </p>

                        {/* Price */}
                        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5">

                            <p className="text-sm text-slate-500">
                                Starting Price
                            </p>

                            <h2 className="mt-1 text-3xl font-extrabold text-teal-700">
                                ${service.basePrice}
                            </h2>

                        </div>

                        {/* Service details */}
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">

                            <div className="flex items-center gap-3 rounded-xl bg-white p-4">
                                <Clock className="text-teal-700" size={22} />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Estimated Duration
                                    </p>

                                    <p className="font-semibold text-slate-800">
                                        {service.estimatedDuration}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-white p-4">
                                <Wrench className="text-teal-700" size={22} />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Service Mode
                                    </p>

                                    <p className="font-semibold text-slate-800">
                                        {service.serviceMode}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-xl bg-white p-4 sm:col-span-2">
                                <MapPin className="text-teal-700" size={22} />

                                <div>
                                    <p className="text-xs text-slate-500">
                                        Service Area
                                    </p>

                                    <p className="font-semibold text-slate-800">
                                        {service.serviceArea}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Availability and Add to My Listings */}
                        <div className="mt-6 flex flex-wrap items-center gap-4">

                            <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                <CheckCircle size={18} />
                                Available for repair requests
                            </div>

                            <AddToMyListingsButton
                                serviceId={service._id.toString()}
                            />

                        </div>

                    </div>

                </div>

                {/* Technician information */}
                <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

                    <h2 className="text-2xl font-bold text-slate-900">
                        About the Technician
                    </h2>

                    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                            <User size={32} />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {service.technicianName}
                            </h3>

                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <Mail size={16} />
                                {service.technicianEmail}
                            </p>

                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                <MapPin size={16} />
                                {service.serviceArea}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Repair Request Form */}
                <RequestRepairForm
                    serviceId={service._id.toString()}
                />

            </section>

            <Footer />

        </main>
    );
}
