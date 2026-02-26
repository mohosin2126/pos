import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineCash, HiOutlineCalendar, HiOutlineShieldCheck } from "react-icons/hi";
import { useBasePath } from "@/hooks/common/use-base-path";
export default function Packages() {
    const basePath = useBasePath();
    const packagesData = [
        {
            id: 1,
            tagIcon: <HiOutlineCalendar className="text-xl" />,
            tag: "Weekly Plan",
            price: "$9.99",
            theme: "dim",
            features: [
                "Basic POS features",
                "Up to 100 transactions",
                "Inventory management",
                "Email support",
            ],
        },
        {
            id: 2,
            tagIcon: <HiOutlineCash className="text-xl" />,
            tag: "Monthly Plan",
            price: "$29.99",
            theme: "primary",
            features: [
                "All Weekly Plan features",
                "Unlimited transactions",
                "Advanced reporting",
                "Multi-user support",
                "Priority email & chat support",
            ],
        },
        {
            id: 3,
            tagIcon: <HiOutlineShieldCheck className="text-xl" />,
            tag: "Lifetime Plan",
            price: "$199.99",
            theme: "dim",
            features: [
                "All Monthly Plan features",
                "Cloud backup",
                "Dedicated account manager",
                "Custom integrations",
            ],
        },
    ];
    const themeClasses = (theme: "primary" | "dim") => {
        if (theme === "primary") {
            return {
                card:
                    "bg-gradient-to-b from-[#102725] via-[#0f2321] to-[#0c1b19] border border-[#1e524d] shadow-[0_0_40px_rgba(105,254,193,0.06)]",
                tag: "bg-[#18413d] text-[#69fec1] border border-[#2a6e63]",
                price: "text-[#69fec1]",
                dash: "bg-[#69fec1]",
                button: "bg-[#114e48] text-[#69fec1] border border-[#69fec1]",
                side: "border-[#225a55]",
                notch: "bg-[#69fec1]",
                sep: "border-[#245d57]",
            };
        }
        return {
            card:
                "bg-gradient-to-b from-[#0f1620] via-[#0d141c] to-[#0b121a] border border-[#1f2833]",
            tag: "bg-[#0f1722] text-[#c9d2df] border border-[#263344]",
            price: "text-white",
            dash: "bg-[#69fec1]",
            button: "bg-[#0e1620] text-[#c9d2df] border border-[#263344]",
            side: "border-[#253243]",
            notch: "bg-[#1f2833]",
            sep: "border-[#253243]",
        };
    };

    return (
        <section className="pb-10 px-4 relative overflow-hidden">
            <h2 className="text-center text-2xl xl:text-4xl font-bold uppercase">
                Our Packages
            </h2>

            {/* soft vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,231,196,0.06),transparent_60%)]"></div>

            <div className="relative mt-14">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {packagesData.map((pkg) => {
                        const t = themeClasses(pkg.theme as any);
                        const isPrimary = pkg.theme === "primary";
                        return (
                            <div key={pkg.id} className={`relative ${isPrimary ? "md:-mt-6" : ""}`}>
                                {/* top ribbon with side folds */}
                                <div className="relative flex justify-center -mb-7 z-10">
                                    <div
                                        className={`relative ${t.tag} rounded-md px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-[0_4px_18px_rgba(0,0,0,0.3)]`}
                                    >
                                        <span>{pkg.tagIcon}</span>
                                        <span>{pkg.tag}</span>
                                        {/* side folds */}
                                        <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rotate-45 rounded-[2px]"></span>
                                        <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rotate-45 rounded-[2px]"></span>
                                    </div>
                                </div>

                                {/* card */}
                                <div
                                    className={`${t.card} rounded-md pt-12 pb-9 px-7 relative overflow-hidden transition-transform duration-300 ${
                                        isPrimary
                                            ? "ring-1 ring-[#69fec1]/30 hover:ring-[#69fec1]/50"
                                            : "hover:border-[#28485a]"
                                    } hover:-translate-y-1`}
                                >
                                    {/* side dashed rails */}
                                    <span
                                        className={`absolute top-20 bottom-24 left-4 border-l border-dashed ${t.side} opacity-60`}
                                    ></span>
                                    <span
                                        className={`absolute top-20 bottom-24 right-4 border-l border-dashed ${t.side} opacity-60`}
                                    ></span>
                                    {/* little tabs */}
                                    <span className={`absolute top-20 -left-1 w-3 h-3 rounded-full ${t.side}`}></span>
                                    <span className={`absolute top-20 -right-1 w-3 h-3 rounded-full ${t.side}`}></span>

                                    {/* price */}
                                    <div className="text-center mb-6">
                                        <div className={`text-5xl font-extrabold tracking-tight ${t.price}`}>
                                            {pkg.price}
                                            <span className="text-xs lg:text-sm text-[#b0bac8] font-normal">
                        {" "}
                                                / Only
                      </span>
                                        </div>
                                    </div>

                                    {/* features */}
                                    <ul className="space-y-4 mt-6">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[14px] text-[#cfd7e2]">
                                                <span className={`mt-[9px] w-4 h-[2px] ${t.dash} inline-block rounded`}></span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* dotted separator */}
                                    <div className={`my-6 border-t border-dashed ${t.sep} opacity-70`}></div>

                                    {/* dashboard button (replaces CHOOSE PLAN) */}
                                    <div>
                                        <Link
                                            to={`${basePath}/dashboard`}
                                            className={`${t.button} w-full inline-block text-center py-3 rounded-md font-semibold tracking-wide hover:brightness-110 transition`}
                                        >
                                            Dashboard
                                        </Link>
                                    </div>

                                    {/* bottom notch/chevron for primary */}
                                    {isPrimary && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                                            <div className={`w-7 h-7 ${t.notch} rotate-45`}></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
