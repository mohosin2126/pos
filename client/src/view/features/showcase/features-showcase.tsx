import {
  HiChartBar,
  HiCube,
  HiShoppingCart,
  HiUserGroup,
  HiCash,
  HiReceiptRefund,
  HiClipboardCheck,
  HiSpeakerphone,
} from "react-icons/hi";

const featureItems = [
  {
    id: 1,
    title: "Sales dashboard",
    description: "Track daily, weekly, and monthly performance in one view.",
    icon: <HiChartBar />,
  },
  {
    id: 2,
    title: "Product management",
    description: "Add, edit, and organize products with smart variants.",
    icon: <HiCube />,
  },
  {
    id: 3,
    title: "Inventory tracking",
    description: "Monitor stock, alerts, and transfers across locations.",
    icon: <HiShoppingCart />,
  },
  {
    id: 4,
    title: "Customer profiles",
    description: "Build loyalty with history, preferences, and rewards.",
    icon: <HiUserGroup />,
  },
  {
    id: 5,
    title: "Payments and billing",
    description: "Accept flexible payments and keep invoices organized.",
    icon: <HiCash />,
  },
  {
    id: 6,
    title: "Orders and returns",
    description: "Handle refunds, exchanges, and order edits fast.",
    icon: <HiReceiptRefund />,
  },
  {
    id: 7,
    title: "Reports and insights",
    description: "Spot trends and export reports in seconds.",
    icon: <HiClipboardCheck />,
  },
  {
    id: 8,
    title: "Promotions",
    description: "Create discounts, bundles, and campaigns in minutes.",
    icon: <HiSpeakerphone />,
  },
];

const FeaturesShowcase = () => {
  return (
    <section className="relative overflow-hidden py-2 lg:py-4">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(79,231,196,0.16),_transparent_70%)] blur-2xl"></div>
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(86,169,255,0.12),_transparent_70%)] blur-2xl"></div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7ff6d0]">
              Features
            </div>
            <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
              Modern retail operations,
              <span className="block text-[#9be8ff]">built for clarity.</span>
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#a9b6c8] sm:text-base">
              Give your team a system that feels effortless. Every workflow is
              streamlined, every report is ready, and every sale is visible in
              real time.
            </p>

            <ul className="space-y-2 text-sm text-[#a9b6c8] sm:text-base">
              {[
                "One-tap checkout with smart pricing rules.",
                "Live stock alerts before shelves run empty.",
                "Quick staff onboarding with guided roles.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#7ff6d0]"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-md border border-[#2a3441] bg-[#0f1a2a] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7ff6d0]">
                Launch support
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                Onboarding, data import, and staff training included.
              </p>
              <p className="mt-1 text-xs text-[#a0aec0]">
                Dedicated launch specialist for every store rollout.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: "24/7", label: "real-time insights" },
                { value: "1,500+", label: "items per minute" },
                { value: "99.9%", label: "uptime support" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2"
                >
                  <span className="text-lg font-semibold text-white">
                    {item.value}
                  </span>
                  <span className="text-xs text-[#b5c2d4] sm:text-sm">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button className="button">BOOK A LIVE DEMO</button>
              <button className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-[#7ff6d0] hover:text-[#7ff6d0]">
                See pricing
              </button>
            </div>
          </div>

          {/* <div className="relative">
            <div className="absolute -top-6 right-6 hidden h-28 w-28 rounded-2xl bg-white/5 blur-2xl lg:block"></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7ff6d0]">
                    Live view
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    Control center
                  </h3>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  Online
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Checkout speed",
                    value: "+38%",
                    note: "average reduction",
                  },
                  { title: "Inventory accuracy", value: "99.9%", note: "today" },
                  { title: "Return window", value: "2 min", note: "avg handled" },
                  { title: "Promo lift", value: "2x", note: "conversion" },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-[#0b1321] p-4"
                  >
                    <p className="text-xs text-[#8ea2b8]">{card.title}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-[#7ff6d0]">{card.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-[#122a33] p-2 text-[#7ff6d0]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-full w-full"
                  >
                    <path
                      d="M4 12c4-5 12-5 16 0-4 5-12 5-16 0Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Unified overview
                  </p>
                  <p className="text-xs text-[#8ea2b8]">
                    Everything your team needs in one view.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Launch kit",
                    description: "Templates, tax presets, and barcodes.",
                  },
                  {
                    title: "Data import",
                    description: "Products, suppliers, and customer lists.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-white/10 bg-[#0b1321] p-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7ff6d0]">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {featureItems.map((feature) => (
            <div
              key={feature.id}
              className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#7ff6d0] hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:shadow-lg hover:shadow-[#7ff6d0]/20 backdrop-blur"
            >
              {/* Corner accent */}
              <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-2xl bg-gradient-to-bl from-[#7ff6d0]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1321] text-[#7ff6d0] transition-all duration-300 group-hover:border-[#7ff6d0]/50 group-hover:bg-[#0b1321]">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="relative z-10 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#7ff6d0]">
                {feature.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-[#a9b6c8] transition-colors duration-300 group-hover:text-[#b5c2d4]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 rounded-md border border-[#2a3441] bg-[#0f1a2a] p-5 sm:grid-cols-3 sm:gap-6 sm:p-6">
          {[
            {
              title: "Daily close",
              value: "45 min",
              description: "average time saved per store",
            },
            {
              title: "Stock accuracy",
              value: "99.9%",
              description: "inventory updates stay in sync",
            },
            {
              title: "Staff training",
              value: "30 min",
              description: "new hires to first sale",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[#7ff6d0]">
                {item.title}
              </p>
              <p className="text-2xl font-semibold text-white">{item.value}</p>
              <p className="text-xs text-[#a0aec0]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
