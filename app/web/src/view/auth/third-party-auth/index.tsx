import React from "react";
import { FcGoogle } from "react-icons/fc";


export default function ThirdPartyAuth() {
    return (
        <div className="pt-6 space-y-4">
            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#0e2c34] text-gray-400">or sign in with</span>
                </div>
            </div>
            {/* Social Login Buttons */}
            <div className="">
                {/* Google Button */}
                <button
                    className="button !w-full flex justify-center items-center gap-x-2"
                >
                    <FcGoogle className="text-xl" />
                    Continue with google
                </button>
            </div>
        </div>
    );
}