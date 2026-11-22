
import Link from "next/link";
import {
    Smartphone,
    Laptop,
    Snowflake,
    Refrigerator,
    Tv,
    WashingMachine,
    Zap,
    Wrench,
    ArrowUpRight,

} from "lucide-react";

export default function PopularCategories() {

    const categories = [
        {
            name: "Smartphone",
            icon: Smartphone,
            description: "Mobile phone repairs",
        },
        {
            name: "Laptop & PC",
            icon: Laptop,
            description: "Computer repair services",
        },
        {
            name: "AC",
            icon: Snowflake,
            description: "Air conditioner services",
        },
        {
            name: "Refrigerator",
            icon: Refrigerator,
            description: "Fridge repair services",
        },
        {
            name: "TV",
            icon: Tv,
            description: "Television repair services",
        },
        {
            name: "Washing Machine",
            icon: WashingMachine,
            description: "Washing machine repairs",
        },
        {
            name: "Other Appliance",
            icon: Zap,
            description: "Electrical repair services",
        },
           {
            name: "All Sevice",
            icon: Wrench ,
            description: "service on all appliance",
        },
    ];

    return (

        <section className="max-w-7xl mx-auto px-5 py-20">

            <div className="text-center max-w-2xl mx-auto mb-12">

                <p className="text-purple-700 font-bold text-sm uppercase tracking-wider">
                    What Needs Fixing?
                </p>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
                    Explore Repair Categories
                </h2>

                <p className="text-slate-500 mt-4">
                    Find the right repair service for your home appliances.
                </p>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

                {categories.map((category) => {

                    const Icon = category.icon;

                    return (

                        <Link
                            key={category.name}
                            href={`/services?category=${encodeURIComponent(category.name)}`}
                            className="group border border-slate-200 rounded-2xl p-6 hover:border-teal-600 hover:shadow-lg transition"
                        >

                            <div className="flex items-center justify-between">

                                <div className="bg-blue-50 text-purple-700 p-4 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                                    <Icon size={27} />
                                </div>

                                <ArrowUpRight
                                    size={19}
                                    className="text-slate-300 group-hover:text-purple-700"
                                />

                            </div>

                            <h3 className="font-bold text-slate-900 mt-5">
                                {category.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-2">
                                {category.description}
                            </p>

                        </Link>

                    );

                })}

            </div>

        </section>

    );

}
