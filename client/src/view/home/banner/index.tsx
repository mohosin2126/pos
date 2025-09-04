import { useEffect, useState } from "react";
import effetImg from "./effect.png";
import { MdDateRange } from "react-icons/md";
import screenImg from "./screen.png";
import handImg from "./hand.png";
import filgerImg from "./finger.png";
import { GoDotFill } from "react-icons/go";
import { RiStarSFill } from "react-icons/ri";

const Banner = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // progress (0 → 1) where 0 = fully laid down, 1 = straight
    const progress = Math.min(scrollY / 200, 1);

    return (
        <div className="flex flex-col items-center gap-y-1 py-16">
            {/* title */}
            <h1 className="text-lg md:text-3xl lg:text-5xl font-bold">
                USE POS TO{" "}
                <span
                    className="p-4 md:p-8"
                    style={{
                        backgroundImage: `url(${effetImg})`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        display: "inline-block",
                    }}
                >
          SIMPLIFY
        </span>{" "}
                YOUR BUSINESS
            </h1>

            <p className="max-w-5xl mx-auto text-center opacity-70">
                Our POS system is a powerful tool designed for local shopkeepers,
                combining intelligent inventory management, sales tracking, and customer
                insights in one seamless platform. It helps you streamline daily
                operations, save time, and manage your store efficiently with accuracy
                and ease.
            </p>

            <button className="!text-primary cursor-pointer flex items-center gap-2">
                <MdDateRange className="text-lg" />
                Schedule A Meet
            </button>

            {/* animated screen with hands */}
            <div className="relative w-3xl pt-5 perspective-[1200px]">
                {/* screen animation */}
                <img
                    src={screenImg}
                    alt="Screen"
                    className="w-full relative z-10 transition-transform duration-300"
                    style={{
                        transform: `rotateX(${40 - progress * 40}deg)`,
                        transformOrigin: "bottom center", // pivot on bottom
                    }}
                />

                {/* left hand */}
                <img
                    src={handImg}
                    alt="Left Hand"
                    className="absolute -left-[140px] -bottom-[380px]"
                />
                {/* left finger */}
                <img
                    src={filgerImg}
                    alt="Left Finger"
                    className="absolute -left-[35px] -bottom-[16px] z-20"
                />
                {/* right hand (flipped) */}
                <img
                    src={handImg}
                    alt="Right Hand"
                    className="absolute -right-[140px] -bottom-[380px] scale-x-[-1]"
                />
                {/* right finger (flipped) */}
                <img
                    src={filgerImg}
                    alt="Right Finger"
                    className="absolute -right-[35px] -bottom-[16px] z-20 scale-x-[-1]"
                />
            </div>

            {/* bottom contents */}
            <div className="pt-16">
                <div className="flex justify-center items-center gap-3 text-primary">
                    <h3 className="flex items-center gap-x-1">
                        <GoDotFill />
                        Product Management
                    </h3>
                    <h3 className="flex items-center gap-x-1">
                        <GoDotFill />
                        Stock Management
                    </h3>
                    <h3 className="flex items-center gap-x-1">
                        <GoDotFill />
                        Supplier Management
                    </h3>
                </div>
                <div className="w-20 h-[2px] bg-primary mx-auto my-4"></div>
                <div className="flex justify-center items-center gap-1 text-xl lg:text-3xl text-[#ffb800]">
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                    <RiStarSFill />
                </div>
                <p className="max-w-xl mx-auto text-center pt-3 lg:pt-6">
                    Manage products, stock, and suppliers effortlessly with our POS
                    system.
                </p>
            </div>
        </div>
    );
};

export default Banner;
