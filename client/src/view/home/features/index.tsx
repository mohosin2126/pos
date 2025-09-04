import {
    HiShoppingCart,
    HiChartBar,
    HiReceiptRefund,
    HiUserGroup,
    HiCash,
    HiCube,
    HiClipboardCheck,
    HiSpeakerphone
} from "react-icons/hi";


const Features = () => {



    const FeaturesData = [
        {
            id: 1,
            title: "Sales Dashboard",
            description: "Track daily, weekly, and monthly sales in a single dashboard.",
            icon: <HiChartBar className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 2,
            title: "Product Management",
            description: "Add, edit, remove products and manage stock levels.",
            icon: <HiCube className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 3,
            title: "Inventory Tracking",
            description: "Monitor stock, receive low-stock alerts, prevent stockouts.",
            icon: <HiShoppingCart className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 4,
            title: "Customer Management",
            description: "Manage customer profiles, purchase history, and loyalty points.",
            icon: <HiUserGroup className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 5,
            title: "Payments & Billing",
            description: "Generate invoices, process payments, and track transactions.",
            icon: <HiCash className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 6,
            title: "Orders & Returns",
            description: "Handle customer orders, returns, and refunds efficiently.",
            icon: <HiReceiptRefund className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 7,
            title: "Reports & Analytics",
            description: "Analyze sales trends, best-selling products, and revenue growth.",
            icon: <HiClipboardCheck className="text-2xl text-[#69fec1]" />,
        },
        {
            id: 8,
            title: "Promotions & Marketing",
            description: "Create offers, discounts, and promotional campaigns.",
            icon: <HiSpeakerphone className="text-2xl text-[#69fec1]" />,
        },
    ];



    return (
        <section className="relative overflow-hidden rounded-md py-24">
            {/* Nebula gradient */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(79,231,196,0.15),_transparent_70%)]"></div>

            <div className="relative z-10">
                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                        Unleash limitless potential & versatile features
                    </h2>
                    <p className="text-[#a0aec0]">for every need</p>
                    <div className="mx-auto mt-6 w-16 h-[2px] bg-[#4fe7c4]"></div>
                </div>

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
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#284b49] bg-[#0f2322] text-[#69fec1] mb-4">
                                    <span className="text-xl">{features.icon}</span>
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

export default Features;
