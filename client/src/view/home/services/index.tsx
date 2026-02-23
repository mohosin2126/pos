"use client";
import React from "react";
import {
    HiClock,
    HiShieldCheck,
    HiCloudUpload,
    HiSupport,
} from "react-icons/hi";
import {Link} from "react-router-dom";
import { useBasePath } from "@/hooks/common/use-base-path";

const Services = () => {
    const basePath = useBasePath();
    const servicesData = [
        {
            id: 1,
            title: "24/7 Support",
            description:
                "Our team is always available to assist you with any issues or questions.",
            icon: <HiSupport className="text-2xl text-[#4fe7c4]" />,
        },
        {
            id: 2,
            title: "Secure Payments",
            description:
                "All transactions are fully secure, keeping your business and customers safe.",
            icon: <HiShieldCheck className="text-2xl text-[#4fe7c4]" />,
        },
        {
            id: 3,
            title: "Cloud Backup",
            description:
                "Automatically backup your POS data to the cloud to prevent any loss.",
            icon: <HiCloudUpload className="text-2xl text-[#4fe7c4]" />,
        },
        {
            id: 4,
            title: "Real-time Analytics",
            description:
                "Track sales, inventory, and performance in real-time from anywhere.",
            icon: <HiClock className="text-2xl text-[#4fe7c4]" />,
        },
    ];

    return (
        <section className="bg-[#0f1a2a] py-20 px-4 lg:px-10 rounded-md">
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {servicesData.map((service) => (
                            <div
                                key={service.id}
                                className="bg-[#1a2332] rounded-lg p-6 border border-[#2a3441] hover:border-[#4fe7c4] transition-all duration-300"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-1 h-6 bg-[#4fe7c4] mr-3"></div>
                                    {service.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-3">
                                    {service.title}
                                </h3>
                                <p className="text-[#a0aec0] text-sm leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-bold text-[#4fe7c4] mb-4">
                                Services Tailored For Your Business
                            </h2>
                            <p className="text-xl text-white mb-4">
                                Our POS system provides essential services to help your shop run
                                smoothly and efficiently.
                            </p>
                            <div className="w-16 h-1 bg-[#4fe7c4]"></div>
                        </div>

                        <p className="text-[#a0aec0] text-lg leading-relaxed">
                            From secure payments to real-time analytics, we offer everything a
                            modern shopkeeper needs to manage inventory, track sales, and
                            ensure customer satisfaction effortlessly.
                        </p>

                        <Link
                            to={`${basePath}/dashboard`}
                            className="button inline-block bg-[#4fe7c4] text-[#0f1a2a] font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
                        >
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;
