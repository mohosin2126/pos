import React from "react";
import { HiOutlineCheck, HiOutlineX } from "react-icons/hi";
import Title from "@/components/title";

const ComparisonTable = () => {
  const features = [
    { name: "Basic POS features", weekly: true, monthly: true, lifetime: true },
    { name: "Transactions per month", weekly: false, monthly: true, lifetime: true },
    { name: "Inventory management", weekly: true, monthly: true, lifetime: true },
    { name: "Customer management", weekly: false, monthly: true, lifetime: true },
    { name: "Advanced reporting", weekly: false, monthly: true, lifetime: true },
    { name: "Multi-user accounts", weekly: false, monthly: true, lifetime: true },
    { name: "Payment integrations", weekly: false, monthly: true, lifetime: true },
    { name: "Email support", weekly: true, monthly: true, lifetime: true },
    { name: "Chat support", weekly: false, monthly: true, lifetime: true },
    { name: "Phone support", weekly: false, monthly: false, lifetime: true },
    { name: "Cloud backup", weekly: false, monthly: false, lifetime: true },
    { name: "Custom integrations", weekly: false, monthly: false, lifetime: true },
    { name: "Dedicated account manager", weekly: false, monthly: false, lifetime: true },
    { name: "API access", weekly: false, monthly: false, lifetime: true },
    { name: "Priority support", weekly: false, monthly: false, lifetime: true },
  ];

  const plans = [
    { name: "Weekly Plan", price: "$9.99" },
    { name: "Monthly Plan", price: "$29.99" },
    { name: "Lifetime Plan", price: "$199.99" },
  ];

  return (
    <section className="py-16 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Title
            title="Feature Comparison"
            description="Side-by-side comparison of all pricing plans"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(105,254,193,0.05),transparent_70%)]"></div>

        <div className="relative hidden md:block overflow-x-auto rounded-lg border border-[#253243]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#253243] bg-[#0f1a2a]">
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-semibold text-[#b0bac8]">Features</span>
                </th>
                {plans.map((plan) => (
                  <th key={plan.name} className="px-6 py-4 text-center border-l border-[#253243]">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-[#cfd7e2]">{plan.name}</span>
                      <span className="text-xl font-bold text-[#69fec1] mt-2">{plan.price}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#253243] hover:bg-[#1a2635] transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#a0aec0]">{feature.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center border-l border-[#253243]">
                    {feature.weekly ? (
                      <HiOutlineCheck className="mx-auto text-xl text-[#69fec1]" />
                    ) : (
                      <HiOutlineX className="mx-auto text-xl text-[#475569]" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center border-l border-[#253243]">
                    {feature.monthly ? (
                      <HiOutlineCheck className="mx-auto text-xl text-[#69fec1]" />
                    ) : (
                      <HiOutlineX className="mx-auto text-xl text-[#475569]" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center border-l border-[#253243]">
                    {feature.lifetime ? (
                      <HiOutlineCheck className="mx-auto text-xl text-[#69fec1]" />
                    ) : (
                      <HiOutlineX className="mx-auto text-xl text-[#475569]" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border border-[#253243] bg-gradient-to-b from-[#0f1620] via-[#0d141c] to-[#0b121a] p-6">
              <div className="mb-6 text-center">
                <h3 className="text-lg font-semibold text-[#cfd7e2]">{plan.name}</h3>
                <p className="text-2xl font-bold text-[#69fec1] mt-2">{plan.price}</p>
              </div>
              <div className="space-y-3">
                {features.map((feature, idx) => {
                  const included =
                    plan.name === "Weekly Plan"
                      ? feature.weekly
                      : plan.name === "Monthly Plan"
                        ? feature.monthly
                        : feature.lifetime;
                  return (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-[#253243]/50">
                      <span className="text-sm text-[#a0aec0]">{feature.name}</span>
                      {included ? (
                        <HiOutlineCheck className="text-lg text-[#69fec1]" />
                      ) : (
                        <HiOutlineX className="text-lg text-[#475569]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
