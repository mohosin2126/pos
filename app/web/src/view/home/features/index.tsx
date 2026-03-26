import Title from "@/components/title";
import salesDashboardImg from "@/assets/illustrations/sales-dashboard.svg";
import productManagementImg from "@/assets/illustrations/product-management.svg";
import inventoryTrackingImg from "@/assets/illustrations/inventory-tracking.svg";
import customerManagementImg from "@/assets/illustrations/customer-management.svg";
import paymentsBillingImg from "@/assets/illustrations/payments-billing.svg";
import ordersReturnsImg from "@/assets/illustrations/orders-returns.svg";
import reportsAnalyticsImg from "@/assets/illustrations/reports-analytics.svg";
import promotionsMarketingImg from "@/assets/illustrations/promotions-marketing.svg";
export default function Features() {
  const FeaturesData = [
    {
      id: 1,
      title: "Sales Dashboard",
      description:
          "Track daily, weekly, and monthly sales in a single dashboard.",
      icon: salesDashboardImg,
    },
    {
      id: 2,
      title: "Product Management",
      description: "Add, edit, remove products and manage stock levels.",
      icon: productManagementImg,
    },
    {
      id: 3,
      title: "Inventory Tracking",
      description:
          "Monitor stock, receive low-stock alerts, prevent stockouts.",
      icon: inventoryTrackingImg,
    },
    {
      id: 4,
      title: "Customer Management",
      description:
          "Manage customer profiles, purchase history, and loyalty points.",
      icon: customerManagementImg,
    },
    {
      id: 5,
      title: "Payments & Billing",
      description:
          "Generate invoices, process payments, and track transactions.",
      icon: paymentsBillingImg,
    },
    {
      id: 6,
      title: "Orders & Returns",
      description: "Handle customer orders, returns, and refunds efficiently.",
      icon: ordersReturnsImg,
    },
    {
      id: 7,
      title: "Reports & Analytics",
      description:
          "Analyze sales trends, best-selling products, and revenue growth.",
      icon: reportsAnalyticsImg,
    },
    {
      id: 8,
      title: "Promotions & Marketing",
      description: "Create offers, discounts, and promotional campaigns.",
      icon: promotionsMarketingImg,
    },
  ];

  return (
      <section className="relative overflow-hidden rounded-md py-24 px-4 md:px-6 lg:px-10">
        {/* Nebula gradient */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,231,196,0.15),_transparent_70%)]"></div>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Heading */}
          <Title
              title="Unleash limitless potential & versatile features"
              description="for every need"
          />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {FeaturesData.map((features) => (
                <div
                    key={features.id}
                    className="relative group rounded-lg p-[1px] bg-gradient-to-b from-[#1e2b36] to-[#12202a] hover:from-[#29424a] hover:to-[#15322d] transition"
                >
                  <div className="relative h-full bg-[#0f1620] rounded-lg p-6 border border-[#233142]">
                    {/* corner accents */}
                    <span className="absolute -top-1 -left-1 w-3 h-3 bg-[#214a44] group-hover:bg-[#4fe7c4] rounded-sm duration-200"></span>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#214a44] group-hover:bg-[#4fe7c4] rounded-sm opacity-60 duration-200"></span>

                    {/* Icon pill */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[#284b49] bg-[#0f2322] mb-4">
                      <img src={features.icon} alt={features.title} className="w-9 h-9" />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#69fec1] transition-colors">
                      {features.title}
                    </h3>
                    <p className="text-[#a0aec0] text-sm leading-relaxed mb-6">
                      {features.description}
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
};
