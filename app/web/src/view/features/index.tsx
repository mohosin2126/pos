import React from "react";
import CommonBanner from "@/components/common/banner";
import FeaturesShowcase from "./showcase";
import HowItWorks from "./works";
import Integrations from "./integration";
import salesDashboardImg from "@/assets/illustrations/sales-dashboard.svg";
import reportsAnalyticsImg from "@/assets/illustrations/reports-analytics.svg";
import inventoryTrackingImg from "@/assets/illustrations/inventory-tracking.svg";

const highlights = [
  {
    title: "Realtime inventory",
    description: "See stock levels update instantly across locations and devices.",
    icon: inventoryTrackingImg,
    color: "#69fec1",
  },
  {
    title: "Fast checkout flow",
    description: "Keep lines moving with quick totals, discounts, and receipts.",
    icon: salesDashboardImg,
    color: "#4fe7c4",
  },
  {
    title: "Secure insights",
    description: "Track performance with role-based access and clean reporting.",
    icon: reportsAnalyticsImg,
    color: "#7ff6d0",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-12 lg:pb-16">
        <CommonBanner
          title="Features that feel effortless"
          description="A modern POS stack that stays calm under pressure and keeps your team fast."
        />
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-lg border border-[#2a3441] bg-[#0f1a2a] p-5 sm:p-6 transition-all duration-300 hover:border-[#7ff6d0] hover:bg-[#1a2635] hover:shadow-lg hover:shadow-[#7ff6d0]/10"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#0b1321] transition-all duration-300 group-hover:border-[#7ff6d0] group-hover:bg-[#0b1321]">
                <img src={item.icon} alt={item.title} className="w-6 h-6" />
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
      </div>
    </div>
  );
}
