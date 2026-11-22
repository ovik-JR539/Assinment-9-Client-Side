
import Link from "next/link";
import {
    MapPin,
    Clock,
    ArrowUpRight,
    Star,
} from "lucide-react";

export default function ServiceCard({ service }) {
    const rating = Number(service.rating);
    const hasRating =
        service.rating !== null &&
        service.rating !== undefined &&
        service.rating !== "" &&
        Number.isFinite(rating) &&
        rating > 0;

    const serviceId = service._id?.toString();

    if (!serviceId) return null;

    return (
        <Link
            href={`/services/${serviceId}`}
            className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            {/* Service Image */}
            <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100">
                {service.image ? (
                    <img
                        src={service.image}
                        alt={service.title || "Repair service"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                        No image available
                    </div>
                )}

                {/* Rating Badge */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow-md">
                    <Star
                        size={16}
                        className="fill-amber-400 text-amber-400"
                    />
                    <span className="text-sm font-bold text-slate-800">
                        {hasRating ? rating.toFixed(1) : "New"}
                    </span>
                </div>
            </div>

            {/* Service Information */}
            <div className="flex flex-1 flex-col p-5">
                <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {service.category}
                </span>

                <h3 className="mt-3 break-words text-lg font-bold text-slate-900 transition group-hover:text-teal-700">
                    {service.title}
                </h3>

                <p className="mt-2 line-clamp-2 break-words text-sm text-slate-500">
                    {service.description}
                </p>

                {/* Rating Details */}
                <div className="mt-3 flex items-center gap-2 text-sm">
                    <Star
                        size={16}
                        className="fill-amber-400 text-amber-400"
                    />

                    {hasRating ? (
                        <span className="font-semibold text-slate-700">
                            {rating.toFixed(1)} / 5
                        </span>
                    ) : (
                        <span className="text-slate-500">
                            No ratings yet
                        </span>
                    )}
                </div>

                {/* Location and Duration */}
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-start gap-2">
                        <MapPin size={16} className="mt-0.5 shrink-0" />
                        <span className="break-words">
                            {service.serviceArea || "Location unavailable"}
                        </span>
                    </div>

                    <div className="flex items-start gap-2">
                        <Clock size={16} className="mt-0.5 shrink-0" />
                        <span>
                            {service.estimatedDuration || "Duration unavailable"}
                        </span>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                        <p className="text-xs text-slate-500">
                            Starting from
                        </p>

                        <p className="text-xl font-bold text-slate-900">
                            ${service.basePrice}
                        </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-teal-800">
                        Details
                        <ArrowUpRight size={16} />
                    </span>
                </div>

                <p className="mt-4 break-words text-xs text-slate-500">
                    Technician: {service.technicianName || "Not specified"}
                </p>
            </div>
        </Link>
    );
}
