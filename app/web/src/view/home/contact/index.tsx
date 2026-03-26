
import React, { useState } from "react";
import emailjs, { type EmailJSResponseStatus } from "@emailjs/browser";
import { HiMail, HiPhone, HiLocationMarker, HiHome } from "react-icons/hi";

const ENV = import.meta.env as unknown as Record<string, string | undefined>;
const SERVICE_ID = ENV.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = ENV.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = ENV.VITE_EMAILJS_PUBLIC_KEY;

interface FormState {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface StatusState {
    type: "" | "success" | "error";
    msg: string;
}

interface InfoItem {
    icon: React.ReactNode;
    title: string;
    lines: string[];
}
export default function Contact() {
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [status, setStatus] = useState<StatusState>({ type: "", msg: "" });
    const [sending, setSending] = useState<boolean>(false);

    const info: InfoItem[] = [
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value } as FormState));
    };

    const validate = (): string => {
        if (!form.name.trim()) return "Please enter your name.";
        if (!form.email.trim()) return "Please enter your email.";
        const emailOk = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(form.email);
        if (!emailOk) return "Please enter a valid email address.";
        if (!form.message.trim()) return "Please write a message.";
        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY)
            return "Email service is not configured. Check your environment variables.";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ type: "", msg: "" });

        const err = validate();
        if (err) {
            setStatus({ type: "error", msg: err });
            return;
        }

        setSending(true);

        try {
            const templateParams = {
                from_name: form.name,
                from_email: form.email,
                phone: form.phone || undefined,
                message: form.message,
            };

            const res: EmailJSResponseStatus = await emailjs.send(
                SERVICE_ID!,
                TEMPLATE_ID!,
                templateParams as Record<string, unknown>, // ← no custom/global types needed
                { publicKey: PUBLIC_KEY }
            );

            if (res.status >= 200 && res.status < 300) {
                setStatus({ type: "success", msg: "Message sent successfully!" });
                setForm({ name: "", email: "", phone: "", message: "" });
            } else {
                setStatus({ type: "error", msg: `Send failed (code ${res.status}).` });
            }
        } catch (err: unknown) {
            const msg =
                (err as { text?: string; message?: string })?.text ||
                (err as { message?: string })?.message ||
                "Failed to send. Please try again or contact via email/phone.";
            setStatus({ type: "error", msg });
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="p-4 lg:p-12 bg-[#0b111a] rounded-md">
            <div id="contact">
                {/* top contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-10">
                    {info.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-4 text-left rounded-md border border-[#223041] bg-[#0f1620]/60 p-4 md:block md:text-center md:bg-transparent md:border-0 md:p-0"
                        >
                            <div className="mx-0 w-14 h-14 rounded-full bg-[#0e1b1a] border border-[#1f524b] flex items-center justify-center text-2xl text-[#69fec1] shadow-[0_0_20px_rgba(105,254,193,0.08)] md:mx-auto">
                                <span>{item.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <div className="mt-0 md:mt-3 text-[#69fec1] font-semibold">{item.title}</div>
                                <div className="mt-1 text-[#c9d2df] text-sm leading-relaxed break-words">
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
                        </div>
                    ))}
                </div>

                {/* form + map card */}
                <div className="rounded-md border border-[#223041] bg-gradient-to-b from-[#0f1620] via-[#0e141d] to-[#0c1219] p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* left form */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-[#c9d2df] mb-2">Name</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                        placeholder="Write your name..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[#c9d2df] mb-2">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                        placeholder="Write your e-mail..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[#c9d2df] mb-2">Phone number</label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1]"
                                    placeholder="Write your phone number..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#c9d2df] mb-2">Additional Message</label>
                                <textarea
                                    name="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={handleChange}
                                    className="w-full bg-[#101820] border border-[#263344] rounded-md px-4 py-3 text-white placeholder:text-[#7f8a99] focus:outline-none focus:border-[#69fec1] resize-none"
                                    placeholder="Write your message..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className={`button ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                {sending ? "Sending..." : "Send message"}
                            </button>

                            {status.msg && (
                                <p
                                    className={`text-sm mt-2 ${
                                        status.type === "success" ? "text-emerald-400" : "text-rose-400"
                                    }`}
                                >
                                    {status.msg}
                                </p>
                            )}

                            {(!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) && (
                                <p className="text-xs text-amber-300/80 mt-1">
                                    Tip: set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and
                                    VITE_EMAILJS_PUBLIC_KEY in your .env.local
                                </p>
                            )}
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
