import React from "react";
import {
    HiOutlinePhone,
    HiOutlineDocumentText,
    HiOutlineCog,
    HiOutlineCheckCircle,
    HiOutlineUserGroup,
} from "react-icons/hi";
import { MdOutlineDoubleArrow } from "react-icons/md";


const DeliveryProcess = () => {

    const processSteps = [
        {
            id: 1,
            title: "Initial Consultation",
            description:
                "We discuss your business needs and goals in detail during a scheduled consultation session.",
            icon: <HiOutlinePhone className="text-3xl text-[#4fe7c4]" />,
            features: ["Business analysis", "Requirement gathering", "Customization needs"],
        },
        {
            id: 2,
            title: "Proposal & Demo",
            description:
                "You receive a tailored proposal and a live demo highlighting the main POS system features today.",
            icon: <HiOutlineDocumentText className="text-3xl text-[#4fe7c4]" />,
            features: ["Custom proposal", "Live demo", "Feature walkthrough"],
        },
        {
            id: 3,
            title: "System Setup",
            description:
                "Our team configures and customizes the POS system carefully to match your exact business needs.",
            icon: <HiOutlineCog className="text-3xl text-[#4fe7c4]" />,
            features: ["System configuration", "Data migration", "Custom branding"],
        },
        {
            id: 4,
            title: "Onboarding",
            description:
                "We provide clear onboarding so your staff can easily learn and adopt the POS system.",
            icon: <HiOutlineUserGroup className="text-3xl text-[#4fe7c4]" />,
            features: ["Staff training", "Best practices", "Support access"],
        },
        {
            id: 5,
            title: "Go Live & Support",
            description:
                "The POS system goes live smoothly and includes ongoing support, regular updates.",
            icon: <HiOutlineCheckCircle className="text-3xl text-[#4fe7c4]" />,
            features: ["24/7 support", "Regular updates", "Performance monitoring"],
        },
    ];


    return (
        <section className="bg-[#0f1a2a] py-20 pl-10 rounded-md">
            <div className="">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-bold text-[#4fe7c4]">
                        Our Delivery Process
                    </h2>
                    <p className="text-xl text-white mb-4 max-w-3xl mx-auto">
                        From initial consultation to full implementation, we ensure a smooth transition to your new POS system
                    </p>
                    <div className="w-20 h-[2px] bg-[#4fe7c4] mx-auto rounded-full"></div>
                </div>

                {/* Process Timeline */}
                <div className="relative">

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 relative z-10 items-stretch">
                        {processSteps.map((step, index) => (
                            <div key={step.id} className="relative group h-full">


                                <div className="flex items-stretch h-full">
                                    <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2a3441] hover:border-[#4fe7c4] transition-all duration-300 hover:shadow-lg hover:shadow-[#4fe7c4]/20 group-hover:transform group-hover:scale-105 h-full w-full flex flex-col">
                                        {/* Step Number */}
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#4fe7c4] rounded-full flex items-center justify-center text-black font-bold text-sm">
                                            {step.id}
                                        </div>

                                        {/* Icon */}
                                        <div className="flex justify-center mb-4 pt-2">
                                            <div className="p-3 bg-[#0f1a2a] rounded-full border border-[#4fe7c4]/30">
                                                {step.icon}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="text-center flex-1 flex flex-col">
                                            <h3 className="text-lg font-semibold text-white mb-3">
                                                {step.title}
                                            </h3>
                                            <p className="text-[#a0aec0] text-sm mb-4 leading-relaxed flex-1">
                                                {step.description}
                                            </p>

                                            {/* Features */}
                                            <div className="space-y-2 mt-auto">
                                                {step.features.map((feature, featureIndex) => (
                                                    <div key={featureIndex} className="flex items-center gap-2 text-xs text-[#a0aec0]">
                                                        <div className="w-1.5 h-1.5 bg-[#4fe7c4] rounded-full"></div>
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${index == 4 ? "opacity-0" : "opacity-100"} hidden xl:flex items-center text-2xl text-[#4fe7c4] mx-2`}>
                                        <MdOutlineDoubleArrow />
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DeliveryProcess;
