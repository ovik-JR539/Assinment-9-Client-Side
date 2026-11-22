
import { connection } from "next/server";

import Hero from "@/components/Hero";
import FeaturedServices from "@/components/FeaturedServices";
import HowItWorks from "@/components/HowItWorks";
import PopularCategories from "@/components/PopularCategories";
import WhyChooseUs from "@/components/WhyChooseUs";
import PaymentSection from "@/components/PaymentSection";

export default async function Home() {
    await connection();

    let services = [];

    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/api/services`, {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        services = Array.isArray(result.data) ? result.data : [];
    } catch (error) {
        console.error("Homepage services error:", error.message);
    }

    return (
        <main>
            <Hero />

            <div className="relative z-20 -mt-14">
                <PopularCategories />
            </div>

            <FeaturedServices services={services} />

            <HowItWorks />
            <WhyChooseUs />
            <PaymentSection />
        </main>
    );
}
