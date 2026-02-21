import React from "react";
import Footer from "../home/footer";
import CommonBanner from "@/components/common/banner";
import FeaturesShowcase from "./showcase/features-showcase";
import HowItWorks from "./works/how-it-works";
import Integrations from "./integration/integrations";
import { HiChartBar, HiClock, HiShieldCheck } from "react-icons/hi";

const highlights = [
  {
    title: "Realtime inventory",
    description: "See stock levels update instantly across locations and devices.",
    icon: <HiChartBar />,
    color: "#69fec1",
  },
  {
    title: "Fast checkout flow",
    description: "Keep lines moving with quick totals, discounts, and receipts.",
    icon: <HiClock />,
    color: "#4fe7c4",
  },
  {
    title: "Secure insights",
    description: "Track performance with role-based access and clean reporting.",
    icon: <HiShieldCheck />,
    color: "#7ff6d0",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto space-y-6 pb-12 lg:space-y-16 lg:pb-16">
      <CommonBanner
        title="Features that feel effortless"
        description="A modern POS stack that stays calm under pressure and keeps your team fast."
      />
      <div className="relative -mt-10 px-4 sm:px-6 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-lg border border-[#2a3441] bg-[#0f1a2a] p-5 sm:p-6 transition-all duration-300 hover:border-[#7ff6d0] hover:bg-[#1a2635] hover:shadow-lg hover:shadow-[#7ff6d0]/10"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0b1321] text-lg transition-all duration-300 group-hover:border-[#7ff6d0] group-hover:bg-[#0b1321]" style={{ color: item.color }}>
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[#a0aec0] group-hover:text-[#b5c2d4]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <FeaturesShowcase />
      <HowItWorks />
      <Integrations />
      <Footer />
    </div>
  );
}
