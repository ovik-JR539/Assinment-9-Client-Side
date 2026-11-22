
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white">

            <div className="mx-auto max-w-7xl px-5 py-14">

                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Logo and Description */}
                    <div>
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/images/Fix-mate-logo.png"
                                alt="FixMate Logo"
                                width={140}
                                height={60}
                                priority
                                className="h-auto w-32 object-contain md:w-36"
                            />
                        </Link>

                        <p className="mt-5 text-sm leading-7 text-slate-400">
                            Your trusted platform for finding home appliance
                            repair services and technicians.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-5 font-bold">
                            Quick Links
                        </h3>

                        <div className="flex flex-col gap-3 text-sm text-slate-400">
                            <Link href="/" className="hover:text-teal-400">Home</Link>
                            <Link href="/services" className="hover:text-teal-400">Services</Link>
                            <Link href="/sign-in" className="hover:text-teal-400">Sign In</Link>
                            <Link href="/sign-up" className="hover:text-teal-400">Sign Up</Link>
                        </div>
                    </div>

                    {/* Repair Categories */}
                    <div>
                        <h3 className="mb-5 font-bold">
                            Repair Categories
                        </h3>

                        <div className="flex flex-col gap-3 text-sm text-slate-400">
                            <Link href="/services?category=Smartphone" className="hover:text-teal-400">
                                Smartphone
                            </Link>

                            <Link href="/services?category=Laptop%20%26%20PC" className="hover:text-teal-400">
                                Laptop & PC
                            </Link>

                            <Link href="/services?category=AC" className="hover:text-teal-400">
                                Air Conditioner
                            </Link>

                            <Link href="/services?category=Refrigerator" className="hover:text-teal-400">
                                Refrigerator
                            </Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="mb-5 font-bold">
                            Contact
                        </h3>

                        <div className="flex flex-col gap-4 text-sm text-slate-400">
                            <p className="flex items-center gap-3">
                                <Mail size={17} />
                                Contact through FixMate
                            </p>

                            <p className="flex items-center gap-3">
                                <MapPin size={17} />
                                Bangladesh
                            </p>
                        </div>
                    </div>

                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-slate-800 pt-7 text-center">
                    <p className="text-sm text-slate-500">
                        © 2026 FixMate. All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}
