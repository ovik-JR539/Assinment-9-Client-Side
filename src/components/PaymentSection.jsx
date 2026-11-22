
import Image from "next/image";

import {
    CreditCard,
    ShieldCheck,
    Wallet,
} from "lucide-react";

const paymentMethods = [
    {
        name: "bKash",
        shortName: "bK",
        description: "Mobile financial service",
        color: "#E2136E",
        background: "#FFF0F6",
    },
    {
        name: "Nagad",
        shortName: "N",
        description: "Digital payment service",
        color: "#F05A28",
        background: "#FFF3ED",
    },
    {
        name: "Rocket",
        shortName: "R",
        description: "Mobile banking service",
        color: "#8B3FC7",
        background: "#F5EDFF",
    },
];

export default function PaymentSection() {
    return (
        <section className="relative isolate flex min-h-[750px] items-center overflow-hidden bg-slate-50 py-24 transition-colors duration-300 dark:bg-slate-950">

            {/* Background Image */}
            <Image
                src="/images/Payment-section.jpg"
                alt="Technician repairing a home appliance"
                fill
                sizes="100vw"
                className="absolute inset-0 -z-20 object-cover object-center"
            />

            {/* Light and Dark Overlays */}
            <div className="absolute inset-0 -z-10 bg-white/75 dark:bg-slate-950/85" />

            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/80 via-white/60 to-purple-50/50 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-purple-950/50" />

            {/* Main Content */}
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">

                {/* Section Heading */}
                <div className="mx-auto mb-12 max-w-3xl text-center">

                    <div className="mb-5 flex items-center justify-center gap-3">
                        <span className="h-[2px] w-9 bg-purple-600 dark:bg-purple-400" />

                        <p className="text-sm font-bold uppercase tracking-[3px] text-purple-700 dark:text-purple-400">
                            Easy & Secure Payments
                        </p>

                        <span className="h-[2px] w-9 bg-purple-600 dark:bg-purple-400" />
                    </div>

                    <h2 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
                        Simple Payments,
                        <span className="block text-purple-700 dark:text-purple-400">
                            Stress-Free Repairs.
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                        Getting your appliances repaired is easy.
                        Choose from popular payment services in Bangladesh
                        and pay conveniently after your repair.
                    </p>

                </div>

                {/* Payment Methods Container */}
                <div className="mx-auto max-w-5xl rounded-3xl border border-white/80 bg-white/90 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-md transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/90 sm:p-10">

                    {/* Card Heading */}
                    <div className="mb-8 flex flex-col items-center text-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                            <CreditCard size={28} />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Available Payment Methods
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Choose the payment option that works best for you.
                        </p>

                    </div>

                    {/* Payment Method Cards */}
                    <div className="grid gap-5 md:grid-cols-3">

                        {paymentMethods.map((method) => (
                            <div
                                key={method.name}
                                className="group rounded-2xl border border-slate-200 bg-white p-6 text-center transition duration-300 hover:-translate-y-2 hover:border-purple-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-500"
                            >

                                {/* Payment Logo */}
                                <div
                                    className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold shadow-sm transition duration-300 group-hover:scale-110"
                                    style={{
                                        backgroundColor: method.background,
                                        color: method.color,
                                    }}
                                >
                                    {method.shortName}
                                </div>

                                {/* Payment Name */}
                                <h4
                                    className="text-xl font-extrabold"
                                    style={{ color: method.color }}
                                >
                                    {method.name}
                                </h4>

                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                                    {method.description}
                                </p>

                                <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                                    <ShieldCheck size={17} />
                                    Supported payment option
                                </div>

                            </div>
                        ))}

                    </div>

                    {/* Payment Information */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl bg-purple-50 px-5 py-5 text-center transition-colors duration-300 dark:bg-purple-500/10 sm:flex-row">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                            <Wallet size={22} />
                        </div>

                        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Select your preferred payment method when
                            completing your repair booking.
                        </p>

                    </div>

                </div>

                {/* Bottom Trust Message */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <ShieldCheck size={19} className="text-green-600 dark:text-green-400" />
                    Convenient payment options for your repair service.
                </div>

            </div>

        </section>
    );
}
