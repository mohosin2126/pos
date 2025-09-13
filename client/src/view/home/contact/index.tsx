import { HiMail, HiPhone, HiLocationMarker, HiHome } from "react-icons/hi";

const Contact = () => {
    const info = [
        {
            icon: <HiMail className="text-2xl text-[#4fe7c4]" />,
            title: "Mail ID",
            lines: ["mohosin2126@gmail.com"],
        },
        {
            icon: <HiPhone className="text-2xl text-[#4fe7c4]" />,
            title: "Contact No.",
            lines: ["+8801774001235"],
        },
        {
            icon: <HiLocationMarker className="text-2xl text-[#4fe7c4]" />,
            title: "Address 1",
            lines: ["Suihari", "Dinajpur 5200"],
        },
        {
            icon: <HiHome className="text-2xl text-[#4fe7c4]" />,
            title: "Address 2",
            lines: ["Chirirbandar", "Dinajpur 5200"],
        },
    ];

    return (
        <section className="p-4 lg:p-12 bg-[#0b111a] rounded-md">
            <div  id="contact">
                {/* top contact info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                    {info.map((item, idx) => (
                        <div key={idx} className="text-center">
                            <div className="mx-auto w-14 h-14 rounded-full bg-[#0e1b1a] border border-[#1f524b] flex items-center justify-center text-2xl text-[#69fec1] shadow-[0_0_20px_rgba(105,254,193,0.08)]">
                                <span>{item.icon}</span>
                            </div>
                            <div className="mt-3 text-[#69fec1] font-semibold">
                                {item.title}
                            </div>
                            <div className="mt-1 text-[#c9d2df] text-sm leading-relaxed">
                                {item.lines.map((l, i) => (
                                    <div key={i}>
                                        {item.title === "Mail ID" ? (
                                            <a href={`mailto:${l}`} className="hover:underline">
                                                {l}
                                            </a>
                                        ) : item.title === "Contact No." ? (
                                            <a href={`tel:${l.replace(/\s+/g, "")}`} className="hover:underline">
                                                {l}
                                            </a>
                                        ) : (
                                            l
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* form + map card */}
                <div className="rounded-md border border-[#223041] bg-gradient-to-b from-[#0f1620] via-[#0e141d] to-[#0c1219] p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* left form */}
                        <form className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-[#c9d2df] mb-2">
                                        Name
                                    </label>
                                    <input
                                        className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                        placeholder="Write your name..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#c9d2df] mb-2">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                        placeholder="Write your e-mail..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#c9d2df] mb-2">
                                    Phone number
                                </label>
                                <input
                                    className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                    placeholder="Write your phone number..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#c9d2df] mb-2">
                                    Additional Message
                                </label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1] resize-none"
                                    placeholder="Write your message..."
                                />
                            </div>

                            <button type="button" className="button">
                                Send message
                            </button>
                        </form>

                        {/* right map */}
                        <div className="w-full h-[300px] md:h-[360px] lg:h-full">
                            <iframe
                                title="map"
                                src="https://www.google.com/maps?q=Dinajpur%205200,%20Bangladesh&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-md border border-[#263344]"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
