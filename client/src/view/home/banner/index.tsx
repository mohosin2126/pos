import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import effetImg from "./effect.png";
import { MdDateRange } from "react-icons/md";
import screenImg from "./screen.png";
import handImg from "./hand.png";
import filgerImg from "./finger.png";
import { GoDotFill } from "react-icons/go";
import { RiStarSFill } from "react-icons/ri";
import heroPattern from "@/assets/backgrounds/hero-pattern.svg";


const Banner = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        // respect OS motion preference
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = (e: { matches: boolean | ((prevState: boolean) => boolean); }) => setReduceMotion(e.matches);
        setReduceMotion(mq.matches);
        mq.addEventListener?.("change", updateMotion);

        // lightweight scroll listener
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            mq.removeEventListener?.("change", updateMotion);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // progress (0 → 1) where 0 = fully laid down, 1 = straight
    const progress = reduceMotion ? 1 : Math.min(scrollY / 200, 1);

    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url(${heroPattern})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            {/* title */}
            <div className="flex flex-col items-center gap-y-2 text-center max-w-7xl mx-auto">
                <h1 className="font-bold leading-tight text-2xl md:text-4xl lg:text-6xl">
                    USE POS TO{" "}
                    <span
                        className="inline-block px-2 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-2 align-baseline"
                        style={{
                            backgroundImage: `url(${effetImg})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}
                    >
            SIMPLIFY
          </span>{" "}
                    YOUR BUSINESS
                </h1>

                <p className="max-w-3xl sm:max-w-4xl mx-auto text-sm sm:text-base lg:text-lg opacity-70">
                    Our POS system is a powerful tool designed for local shopkeepers,
                    combining intelligent inventory management, sales tracking, and customer
                    insights in one seamless platform. It helps you streamline daily
                    operations, save time, and manage your store efficiently with accuracy
                    and ease.
                </p>

                <button
                    className="!text-primary cursor-pointer flex items-center gap-2 mt-4 sm:mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-md text-sm sm:text-base"
                    aria-label="Schedule a meeting"
                    onClick={() => navigate("/contact")}
                >
                    <MdDateRange className="text-base md:text-lg" />
                    Schedule A Meet
                </button>
            </div>

            {/* animated screen with hands */}
            <div className="relative mx-auto mt-8 sm:mt-10 lg:mt-14 w-full max-w-xl sm:max-w-2xl lg:max-w-5xl">
                {/* predictable box so absolute decorations don’t cause layout shifts */}
                <div className="relative w-full aspect-[16/10] perspective-[1200px]">
                    {/* screen animation */}
                    <img
                        src={screenImg}
                        alt="Screen"
                        className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-300 will-change-transform"
                        style={{
                            transform: `rotateX(${40 - progress * 40}deg)`,
                            transformOrigin: "bottom center",
                        }}
                    />

                    {/* left hand (hidden on small screens) */}
                    <img
                        src={handImg}
                        alt=""
                        aria-hidden
                        className="hidden lg:block absolute -left-36 -bottom-40 xl:-left-40 xl:-bottom-44"
                    />
                    {/* left finger */}
                    <img
                        src={filgerImg}
                        alt=""
                        aria-hidden
                        className="hidden lg:block absolute -left-6 -bottom-2 z-20"
                    />
                    {/* right hand (flipped) */}
                    <img
                        src={handImg}
                        alt=""
                        aria-hidden
                        className="hidden lg:block absolute -right-36 -bottom-40 xl:-right-40 xl:-bottom-44 scale-x-[-1]"
                    />
                    {/* right finger (flipped) */}
                    <img
                        src={filgerImg}
                        alt=""
                        aria-hidden
                        className="hidden lg:block absolute -right-6 -bottom-2 z-20 scale-x-[-1]"
                    />
                </div>
            </div>

            {/* bottom contents */}
            <div className="pt-10 sm:pt-12 lg:pt-16">
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-primary text-sm sm:text-base">
                    <h3 className="flex items-center gap-x-1 whitespace-nowrap">
                        <GoDotFill />
                        Product Management
                    </h3>
                    <h3 className="flex items-center gap-x-1 whitespace-nowrap">
                        <GoDotFill />
                        Stock Management
                    </h3>
                    <h3 className="flex items-center gap-x-1 whitespace-nowrap">
                        <GoDotFill />
                        Supplier Management
                    </h3>
                </div>
                <div className="w-16 sm:w-20 h-[2px] bg-primary mx-auto my-4" />
                <div className="flex justify-center items-center gap-1 text-2xl lg:text-3xl text-[#ffb800]">
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                </div>
                <p className="max-w-xl mx-auto text-center pt-3 lg:pt-6 text-sm sm:text-base">
                    Manage products, stock, and suppliers effortlessly with our POS system.
                </p>
            </div>
        </section>
    );
};

export default Banner;
