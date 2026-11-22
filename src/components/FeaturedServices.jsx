
"use client";

import { useRef } from "react";
import ServiceCard from "./ServiceCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Reusable slider for Popular and Other services
function ServiceSlider({ title, description, services, emptyMessage }) {
    const sliderRef = useRef(null);

    function slideLeft() {
        sliderRef.current?.scrollBy({
            left: -364,
            behavior: "smooth",
        });
    }

    function slideRight() {
        sliderRef.current?.scrollBy({
            left: 364,
            behavior: "smooth",
        });
    }

    return (
        <section className="mb-16">
            <div className="mb-7 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                {services.length > 0 && (
                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={slideLeft}
                            className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                            aria-label="Previous services"
                        >
                            <ChevronLeft size={22} />
                        </button>

                        <button
                            onClick={slideRight}
                            className="rounded-full border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                            aria-label="Next services"
                        >
                            <ChevronRight size={22} />
                        </button>
                    </div>
                )}
            </div>

            {services.length > 0 ? (
                <div
                    ref={sliderRef}
                    className="flex w-full flex-nowrap gap-6 overflow-x-auto scroll-smooth pb-4"
                    style={{ scrollbarWidth: "none" }}
                >
                    {services.map((service) => (
                        <div
                            key={service._id}
                            className="shrink-0"
                            style={{
                                width: "340px",
                                flex: "0 0 340px",
                            }}
                        >
                            <ServiceCard service={service} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="rounded-xl bg-gray-100 p-8 text-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {emptyMessage}
                </p>
            )}
        </section>
    );
}

export default function FeaturedServices({ services = [] }) {
    // Only available services
    const allServices = services.filter(
        (service) => service.isAvailable !== false
    );

    // Popular services: rating 4.0 or higher
    const popularServices = allServices.filter((service) => {
        const rating = Number(service.rating);

        return (
            service.rating !== null &&
            service.rating !== undefined &&
            service.rating !== "" &&
            Number.isFinite(rating) &&
            rating >= 4
        );
    });

    // Other services: rating below 4.0 or no rating
    const otherServices = allServices.filter((service) => {
        const rating = Number(service.rating);

        const isPopular =
            service.rating !== null &&
            service.rating !== undefined &&
            service.rating !== "" &&
            Number.isFinite(rating) &&
            rating >= 4;

        return !isPopular;
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-16">
            {/* Popular Repair Services */}
            <ServiceSlider
                title="Popular Repair Services"
                description="Our highest-rated repair services."
                services={popularServices}
                emptyMessage="No popular repair services available yet."
            />

            {/* Other Home Services */}
            <ServiceSlider
                title="Other Home Services"
                description="Explore more repair services for your home."
                services={otherServices}
                emptyMessage="No other home services available yet."
            />

            {/* All Services - Automatic Right to Left */}
            <section className="mb-10">
                <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                        All Services
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Explore all available repair services.
                    </p>
                </div>

                {allServices.length > 0 ? (
                    <div className="w-full overflow-hidden">
                        <div className="all-services-track">
                            {/* First group */}
                            <div className="all-services-group">
                                {allServices.map((service) => (
                                    <div
                                        key={service._id}
                                        className="shrink-0"
                                        style={{
                                            width: "340px",
                                            flex: "0 0 340px",
                                        }}
                                    >
                                        <ServiceCard service={service} />
                                    </div>
                                ))}
                            </div>

                            {/* Duplicate group for continuous animation */}
                            <div
                                className="all-services-group"
                                aria-hidden="true"
                                    >
                                {allServices.map((service, index) => (
                                    <div
                                        key={`${service._id}-copy-${index}`}
                                        className="shrink-0"
                                        style={{
                                            width: "340px",
                                            flex: "0 0 340px",
                                        }}
                                    >
                                        <ServiceCard service={service} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="rounded-xl bg-gray-100 p-8 text-center text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        No services available yet.
                    </p>
                )}
            </section>
        </div>
    );
}
