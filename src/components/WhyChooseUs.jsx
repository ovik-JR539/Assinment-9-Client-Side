
import Image from "next/image";
import {
    ShieldCheck,
    Headset,
    Wrench,
    BadgeCheck,
} from "lucide-react";

const benefits = [
    {
        icon: ShieldCheck,
        title: "Trusted Technicians",
        description: "Find skilled technicians for your repair needs.",
    },
    {
        icon: Headset,
        title: "Customer Support",
        description: "Get assistance throughout your repair journey.",
    },
    {
        icon: Wrench,
        title: "Quality Repairs",
        description: "Get professional care for your home appliances.",
    },
    {
        icon: BadgeCheck,
        title: "Transparent Pricing",
        description: "See service prices before requesting a repair.",
    },
];

export default function WhyChooseUs() {
    return (
        <section
            id="about"
            className="relative min-h-[950px] w-full overflow-hidden"
        >

            {/* Background Image */}
            <Image
                src="/images/Group people.jpg"
                alt="Professional home repair service"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-slate-950/75" />

            {/* Section Content */}
            <div className="relative z-10 mx-auto flex min-h-[850px] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center">

                {/* Section Heading */}
                <div className="mb-12 flex flex-col items-center">

                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span className="h-[2px] w-8 bg-purple-400"></span>

                        <p className="text-sm font-bold uppercase tracking-wider text-purple-400">
                            Why Choose FixMate
                        </p>

                        <span className="h-[2px] w-8 bg-purple-400"></span>
                    </div>

                    <h2 className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                        Because Your Home Deserves
                        <span className="block text-purple-400">
                            the Best Care.
                        </span>
                    </h2>

                    <p className="mt-5 max-w-2xl leading-7 text-slate-200">
                        We make appliance repair easier by connecting you
                        with trusted technicians and helping you find the
                        right service for your needs.
                    </p>

                </div>

                {/* Benefit Cards */}
                <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                key={index}
                                className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:bg-white/20"
                            >

                                {/* Icon */}
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white">
                                    <Icon size={30} />
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white">
                                    {benefit.title}
                                </h3>

                                {/* Description */}
                                <p className="mt-3 text-sm leading-6 text-slate-200">
                                    {benefit.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}
