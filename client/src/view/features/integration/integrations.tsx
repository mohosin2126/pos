import {
  HiCash,
  HiCube,
  HiChartBar,
  HiShoppingCart,
  HiClipboardCheck,
  HiSpeakerphone,
  HiOutlineCheckCircle,
  HiOutlineLockClosed,
} from "react-icons/hi";

const Integrations = () => {
  const items = [
    {
      id: 1,
      title: "Payments",
      description: "Accept cards, cash, and split transactions.",
      icon: <HiCash />,
      accentColor: "#69fec1",
    },
    {
      id: 2,
      title: "Inventory sync",
      description: "Keep stock levels aligned across locations.",
      icon: <HiClipboardCheck />,
      accentColor: "#4fe7c4",
    },
    {
      id: 3,
      title: "E-commerce",
      description: "Sync products for online and in-store selling.",
      icon: <HiShoppingCart />,
      accentColor: "#7ff6d0",
    },
    {
      id: 4,
      title: "Accounting",
      description: "Export sales data and reconcile faster.",
      icon: <HiChartBar />,
      accentColor: "#46d4b5",
    },
    {
      id: 5,
      title: "Catalog tools",
      description: "Manage bundles, variants, and pricing rules.",
      icon: <HiCube />,
      accentColor: "#69fec1",
    },
    {
      id: 6,
      title: "Marketing",
      description: "Trigger promotions and loyalty campaigns.",
      icon: <HiSpeakerphone />,
      accentColor: "#4fe7c4",
    },
  ];

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#7ff6d0]">
              Integrations
            </div>
            <h2 className="text-4xl font-bold text-white lg:text-5xl">
              Connect the tools that power your store.
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-[#a9b6c8] sm:text-base">
              Bring payments, accounting, and marketing into one modern stack.
              Everything stays in sync so your team never works twice.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-[#b5c2d4] sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#7ff6d0]"></span>
            120+ ready-to-go connectors
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-[#b5c2d4] sm:grid-cols-3">
          {[
            { value: "18", label: "payment types" },
            { value: "35", label: "hardware models" },
            { value: "120+", label: "active connectors" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-[#2a3441] bg-[#0f1a2a] p-4"
            >
              <span className="text-lg font-semibold text-white">
                {item.value}
              </span>{" "}
              {item.label}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {[
            "Stripe",
            "PayPal",
            "QuickBooks",
            "Xero",
            "Shopify",
            "WooCommerce",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#b5c2d4]"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#7ff6d0] hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:shadow-lg hover:shadow-[#7ff6d0]/20 backdrop-blur overflow-hidden"
              >
                {/* Gradient background overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7ff6d0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                
                <div className="relative z-10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0b1321] transition-all duration-300 group-hover:border-[#7ff6d0]/50 group-hover:shadow-md group-hover:shadow-[#7ff6d0]/30" style={{ color: item.accentColor }}>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="relative z-10 text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#7ff6d0]">
                  {item.title}
                </h3>
                <p className="relative z-10 mt-2 text-sm leading-relaxed text-[#a9b6c8] transition-colors duration-300 group-hover:text-[#b5c2d4]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">
                Hardware ready
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a9b6c8]">
                Plug in barcode scanners, receipt printers, and cash drawers
                without extra setup.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {["Barcode scanners", "Receipt printers", "Card readers", "Cash drawers", "Label printers"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-[#0b1321] px-3 py-1 text-xs text-[#b5c2d4]"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1321] p-6">
              <h3 className="text-lg font-semibold text-white">Secure sync</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a9b6c8]">
                Real-time reconciliation and automated backups keep your data
                clean and protected.
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-[#7ff6d0]">
                <span className="h-2 w-2 rounded-full bg-[#7ff6d0]"></span>
                Encrypted transfers and audit-ready logs.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">
                Implementation help
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a9b6c8]">
                We map your existing tools and import data without downtime.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#8ea2b8]">
                {["Guided data mapping", "API and file imports", "Go-live checklist"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7ff6d0]"></span>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
