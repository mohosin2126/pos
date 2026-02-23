import productManagementImg from "@/assets/illustrations/product-management.svg";
import reportsAnalyticsImg from "@/assets/illustrations/reports-analytics.svg";
import inventoryTrackingImg from "@/assets/illustrations/inventory-tracking.svg";
import paymentsBillingImg from "@/assets/illustrations/payments-billing.svg";
import { HiOutlineCheckCircle, HiOutlineArrowRight } from "react-icons/hi";

const HowItWorks = () => {
   const steps = [
    {
      id: 1,
      title: "Set up your catalog",
      description:
        "Add products, prices, and tax rules in minutes. Import from a spreadsheet, organize categories, and set variants like size or color. Build a clean catalog once, then reuse it across every register and location.",
      icon: productManagementImg,
      accentColor: "#69fec1",
    },
    {
      id: 2,
      title: "Connect your store",
      description:
        "Link users, registers, and inventory locations. Assign roles and permissions, connect barcode scanners and printers, and configure receipts. Your team can sign in instantly and every device stays synced in real time.",
      icon: reportsAnalyticsImg,
      accentColor: "#4fe7c4",
    },
    {
      id: 3,
      title: "Start selling",
      description:
        "Scan items, apply discounts, and take payments fast. Support split tenders, refunds, and custom fees with a couple taps. The checkout flow stays smooth even during rush hours—so lines move and customers stay happy.",
      icon: inventoryTrackingImg,
      accentColor: "#7ff6d0",
    },
    {
      id: 4,
      title: "Track results",
      description:
        "Monitor revenue, stock, and performance in real time. See best-sellers, low-stock alerts, and daily summaries across locations. Export reports for accounting and make confident decisions using live store insights.",
      icon: paymentsBillingImg,
      accentColor: "#46d4b5",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-md bg-[#0f1a2a] py-16 sm:py-20 lg:py-24">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7ff6d0]">
              How it works
            </div>
            <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              From setup to sale in a single afternoon.
            </h2>
            <p className="text-sm leading-relaxed text-[#a9b6c8] sm:text-base">
              Launch fast with guided steps that stay simple. Your catalog,
              registers, and insights are ready without long onboarding cycles.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Day 1 setup",
                  description: "Import products, set prices, and assign roles.",
                },
                {
                  title: "Week 1 rollout",
                  description: "Train staff, connect devices, and go live.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-md border border-[#2a3441] bg-[#1a2332] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7ff6d0]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-white">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-4 h-full w-px bg-gradient-to-b from-[#7ff6d0] via-[#2a3f52] to-transparent"></div>
            <div className="space-y-6 pl-10">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 sm:p-6 backdrop-blur transition-all duration-300 hover:border-[#7ff6d0] hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:-translate-x-2 hover:shadow-lg hover:shadow-[#7ff6d0]/20"
                >
                  <div className="absolute top-0 left-0 h-1 w-0 bg-[#7ff6d0] rounded-full group-hover:w-8 transition-all duration-300"></div>
                  
                  <div className="absolute -left-10 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#0b1321] text-xs font-semibold text-white transition-all duration-300 group-hover:border-[#7ff6d0] group-hover:shadow-lg group-hover:shadow-[#7ff6d0]/50">
                    0{step.id}
                  </div>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1321] transition-all duration-300 group-hover:border-[#7ff6d0] group-hover:shadow-md group-hover:shadow-[#7ff6d0]/30">
                    <img src={step.icon} alt={step.title} className="w-8 h-8 group-hover:[animation:bounce_0.6s_ease-in-out_infinite]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#7ff6d0]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#a9b6c8] transition-colors duration-300 group-hover:text-[#b5c2d4]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
