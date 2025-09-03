const Footer = () => {
    return (
        <footer className="mt-16">
            <div className="py-12">
                <div className="flex flex-col items-center justify-center gap-6 text-center">
                    {/* Logo */}
                    <div>
                        <div className="text-2xl font-extrabold tracking-tight pb-3">
                            POS
                        </div>
                        <p className="text-sm text-[#a0aec0] mt-1">
                            Effortless management for your shop
                        </p>
                    </div>

                    {/* Payments */}
                    {/* <div className="flex items-center gap-3">
						<div className="h-8 px-3 rounded-md border border-[#263344] bg-[#101820] flex items-center text-xs text-[#c9d2df]">Visa</div>
						<div className="h-8 px-3 rounded-md border border-[#263344] bg-[#101820] flex items-center text-xs text-[#c9d2df]">Mastercard</div>
						<div className="h-8 px-3 rounded-md border border-[#263344] bg-[#101820] flex items-center text-xs text-[#c9d2df]">Amex</div>
						<div className="h-8 px-3 rounded-md border border-[#263344] bg-[#101820] flex items-center text-xs text-[#c9d2df]">Paypal</div>
					</div> */}

                    {/* Contact button */}
                    <div className="flex-shrink-0">
                        <button className="button !bg-[#134843] !text-[#69fec1] !border-[#69fec1] rounded-md px-6 py-2">
                            Contact us
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#223041] mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[#93a3b5]">
                        © {new Date().getFullYear()} POS. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#93a3b5]">
            <span className="px-2 py-1 rounded-md border border-[#263344] bg-[#101820]">
              Secure payments
            </span>
                        <span className="px-2 py-1 rounded-md border border-[#263344] bg-[#101820]">
              Privacy-first
            </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
