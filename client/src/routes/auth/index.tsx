import { useState } from "react";
import LoginForm from "../../view/auth/login-form";
import Lottie from "lottie-react";
import animationData from "../../assets/Online Work.json";
import logoFull from "@/assets/logo/logo-full.svg";

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="bg-[#0b1029] w-screen h-full min-h-screen flex flex-col lg:flex-row justify-center items-center lg:pr-20 py-10 px-4">
      {/* Left Side */}
      <div className="lg:flex-1 order-2 lg:order-1">
        <div className="w-full lg:w-[85%] mx-auto">
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-lg 2xl:w-xl bg-[#0e2c34] flex flex-col h-fit rounded-md order-1 lg:order-2">
        <div className="flex flex-col justify-center p-4 lg:p-10">
          {/* Header */}
          <div className="flex justify-center mb-2">
            <img src={logoFull} alt="POS" className="h-10 lg:h-12 w-auto" />
          </div>
          <h1 className="text-lg lg:text-2xl text-center font-bold text-white">
            Welcome back!
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
          <div className="w-full h-full lg:h-[calc(100vh-320px)]">
            <LoginForm />
          </div>

        
        </div>
      </div>
    </div>
  );
}
