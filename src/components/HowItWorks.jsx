
"use client";

import { useState } from "react";
import {
    Search,
    ClipboardList,
    Wrench,
    CheckCircle,
} from "lucide-react";

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            number: "01",
            title: "Find a Repair Service",
            description:
                "Browse our available services and choose the appliance that needs repair.",
            icon: Search,
            iconBg: "from-pink-100 to-pink-50",
            iconColor: "text-pink-600",
        },
        {
            number: "02",
            title: "Request a Repair",
            description:
                "Submit your repair request with your preferred date and problem details.",
            icon: ClipboardList,
            iconBg: "from-purple-100 to-purple-50",
            iconColor: "text-purple-600",
        },
        {
            number: "03",
            title: "Get It Repaired",
            description:
                "A technician accepts your request and takes care of your appliance.",
            icon: Wrench,
            iconBg: "from-orange-100 to-orange-50",
            iconColor: "text-orange-600",
        },
        {
            number: "04",
            title: "Complete Payment",
            description:
                "Once the repair is completed, pay using your preferred payment method.",
            icon: CheckCircle,
            iconBg: "from-green-100 to-green-50",
            iconColor: "text-green-600",
        },
    ];

    return (
        <section
            id="how-it-works"
            className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-5 pt-28 pb-[200px] sm:px-8 sm:pt-28 lg:px-12"
        >
            {/* Background Decorations */}
            <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl">

                {/* Section Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[4px] text-white/80">
                        Simple Process
                    </p>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                        How FixMate Works
                    </h2>

                    <p className="mt-5 text-base leading-8 text-white/85 sm:text-lg">
                        Getting your home appliances repaired has never been easier.
                        Follow these four simple steps.
                    </p>
                </div>

                {/* Main Content */}
                <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

                    {/* Left Column: Repair Image */}

                    {/* Left Column: Repair Image */}
                    <div className="relative mx-auto w-full max-w-lg">
                        <div className="overflow-hidden rounded-3xl shadow-2xl shadow-indigo-950/30 ring-1 ring-white/20">
                            <img
                                src="/images/repairing.jpg"
                                alt="FixMate technician repairing a home appliance"
                                className="aspect-[4/4.6] w-full object-cover"
                            />
                        </div>
                    </div>


                    {/* Right Column: Interactive Step Cards */}
                    <div className="space-y-5">

                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = activeStep === index;

                            return (
                                <div
                                    key={step.number}
                                    onMouseEnter={() => setActiveStep(index)}
                                    onClick={() => setActiveStep(index)}
                                    className={`group relative flex cursor-pointer items-start gap-5 overflow-hidden rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${isActive
                                            ? "border-white/50 bg-white shadow-xl shadow-indigo-950/20"
                                            : "border-white/20 bg-white/10 backdrop-blur-sm hover:-translate-y-1 hover:bg-white/20"
                                        }`}
                                >
                                    {/* Active Accent */}
                                    <div
                                        className={`absolute bottom-0 left-0 top-0 w-1 bg-purple-500 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"
                                            }`}
                                    />

                                    {/* Icon */}
                                    <div
                                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.iconBg} ${step.iconColor} transition-transform duration-300 ${isActive ? "scale-105 shadow-md" : "group-hover:scale-105"
                                            }`}
                                    >
                                        <Icon size={27} strokeWidth={1.8} />
                                    </div>

                                    {/* Step Details */}
                                    <div className="flex-1 pt-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">

                                            <h3
                                                className={`text-base font-bold transition-colors sm:text-lg ${isActive
                                                        ? "text-purple-700"
                                                        : "text-white"
                                                    }`}
                                            >
                                                {step.title}
                                            </h3>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider ${isActive
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-white/20 text-white"
                                                    }`}
                                            >
                                                {step.number}
                                            </span>
                                        </div>

                                        <p
                                            className={`mt-2 text-sm leading-6 ${isActive
                                                    ? "text-slate-500"
                                                    : "text-white/80"
                                                }`}
                                        >
                                            {step.description}
                                        </p>

                                        {/* Active Indicator */}
                                        <div
                                            className={`mt-4 h-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500 ${isActive ? "w-16" : "w-0"
                                                }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </section>
    );
}
