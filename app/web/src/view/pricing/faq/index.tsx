import React, { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi";
import Title from "@/components/title";
export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Can I switch plans or upgrade anytime?",
      answer:
        "Yes, absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, and downgrades will apply at the next billing cycle.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "We offer a 14-day free trial for all plans. No credit card required to start. After the trial period, you can choose the plan that best fits your needs.",
    },
    {
      question: "What happens if I exceed transaction or user limits?",
      answer:
        "For the Weekly Plan, once you reach 100 transactions, you'll be prompted to upgrade. For Monthly and Lifetime plans, there are no limits on transactions. Additional users can be added for a small fee if needed.",
    },
    {
      question: "Do you offer annual or multi-year discounts?",
      answer:
        "Yes! We offer 20% discount for annual billing and 30% discount for two-year commitments. Contact our sales team for more details on bulk discounts.",
    },
    {
      question: "Is my data secure with cloud backup?",
      answer:
        "Absolutely. All data is encrypted both in transit and at rest using industry-standard encryption (AES-256). We perform daily automated backups and comply with GDPR and PCI-DSS standards.",
    },
    {
      question: "How do custom integrations work?",
      answer:
        "Our API allows you to integrate with virtually any third-party service. The Lifetime Plan includes dedicated support for custom integrations. Our team will help you set up and maintain your integrations.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets. Monthly and Lifetime Plans include access to 50+ payment gateways.",
    },
    {
      question: "Is there a money-back guarantee?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, we'll refund your payment in full, no questions asked.",
    },
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Title
            title="Frequently Asked Questions"
            description="Get answers to common questions about our pricing and plans"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(105,254,193,0.05),transparent_70%)]"></div>

        <div className="relative space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group rounded-lg border border-[#253243] bg-gradient-to-b from-[#0f1620] via-[#0d141c] to-[#0b121a] transition-all duration-300 hover:border-[#7ff6d0] hover:shadow-md hover:shadow-[#7ff6d0]/10"
            >
              <button
                onClick={() =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
              >
                <h3 className="text-base font-semibold text-[#cfd7e2] group-hover:text-[#69fec1]">
                  {faq.question}
                </h3>
                <HiOutlineChevronDown
                  className={`flex-shrink-0 w-5 h-5 text-[#69fec1] transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeIndex === index && (
                <div className="px-6 pb-5 border-t border-[#253243]">
                  <p className="text-sm text-[#a0aec0] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center rounded-lg border border-[#253243] bg-gradient-to-b from-[#0f1620] via-[#0d141c] to-[#0b121a] p-8">
          <h3 className="text-lg font-semibold text-[#cfd7e2]">
            Still have questions?
          </h3>
          <p className="text-sm text-[#a0aec0] mt-2">
            Our support team is here to help. Get in touch with us and we'll be
            happy to answer any questions.
          </p>
          <a href="/contact" className="mt-6 inline-block px-6 py-2 rounded-lg border border-[#69fec1] text-[#69fec1] font-semibold hover:bg-[#69fec1]/10 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};
