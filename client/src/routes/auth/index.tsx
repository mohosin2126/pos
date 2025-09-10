import { useState } from "react";
import LoginForm from "../../view/auth/login-form";
// import RegisterForm from "../../view/auth/register-form";
// import ThirdPartyAuth from "../../view/auth/third-party-auth";
import Lottie from "lottie-react";
// @ts-ignore
import animationData from "../../assets/Online Work.json";

export default function Auth() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    return (
        <div className="bg-[#0b1029] w-screen h-full min-h-screen flex flex-col lg:flex-row justify-center items-center lg:pr-20 py-10 px-4">
            {/* Left Side */}
            <div className="lg:flex-1 order-2 lg:order-1">
                <div className="w-full lg:w-[85%] mx-auto">
                    <Lottie animationData={animationData} loop={true} style={{ maxWidth: "100%", height: "auto" }} />
                </div>
            </div>

            {/* Right Side - Form Panel */}
            <div className="w-full lg:w-lg 2xl:w-xl bg-[#0e2c34] flex flex-col h-fit rounded-md order-1 lg:order-2">
                <div className="flex flex-col justify-center p-4 lg:p-10">
                    {/* Header */}
                    <h1 className="text-xl lg:text-4xl text-center font-bold text-white">
                        Welcome to <span className="text-[#3bedb2]">POS</span>!
                    </h1>

                    {/* Tabs (Signup disabled, keep active state) */}
                    <div className="w-full grid grid-cols-2 items-center mt-2 mb-8">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`text-xl font-medium pb-3 border-b-2 cursor-pointer ${
                                activeTab === "login"
                                    ? "!text-[#3bedb2] border-b-[#3bedb2] font-semibold"
                                    : "!text-slate-400 border-b-slate-600"
                            }`}
                        >
                            Login
                        </button>

                        {/* Keep the tab but disable it so only Login is usable */}
                        <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title="Signup is disabled for now"
                            className={`text-xl font-medium pb-3 border-b-2 ${
                                activeTab === "register"
                                    ? "!text-[#3bedb2] border-b-[#3bedb2] font-semibold"
                                    : "!text-slate-500/60 border-b-slate-700/60"
                            } cursor-not-allowed`}
                        >
                            Signup
                        </button>
                    </div>

                    {/* Form Content — always render Login only */}
                    <div className="w-full h-full lg:h-[calc(100vh-320px)]">
                        <LoginForm  />
                        {/* If you later re-enable register, render conditionally:
               {activeTab === 'login' ? <LoginForm .../> : <RegisterForm .../>}
            */}
                    </div>

                    {/* Third Party Auth — intentionally hidden
          <ThirdPartyAuth />
          */}
                </div>
            </div>
        </div>
    );
}