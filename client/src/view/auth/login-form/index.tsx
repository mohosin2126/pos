import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { message } from "antd";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { IoMailOutline } from "react-icons/io5";
import useApi from "../../../hooks/use-api";
import { useUser } from "@/context-api";

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUser();

    const onFinish = async (values: {
        remember: boolean;
        email?: string;
        password?: string;
    }) => {
        setLoading(true);
        try {
            const res = await useApi.post("/v1/auth/login", values);
            if (!res.data.success) throw new Error(res.data.message);

            const token = res.data.data.token;
            Cookies.set("token", token, {
                expires: values.remember ? 30 : 7,
                secure: true,
                sameSite: "Strict",
            });

            message.success("Login successful");

            const profileRes = await useApi.get("/v1/auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!profileRes.data.success) throw new Error("Failed to fetch profile");

            const userData = profileRes.data.data;
            Cookies.set("user", JSON.stringify(userData), { expires: 7 });
            setUser(userData);

            navigate("/admin");
        } catch (error: any) {
            message.error(
                error?.response?.data?.message || error?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onFinish({ ...formData, remember });
    };

    const handleDemoSignIn = async () => {
        if (loading) return;
        const demoCreds = { email: "admin@demo.com", password: "12345678" };
        setFormData(demoCreds);
        setRemember(false);
        await onFinish({ ...demoCreds, remember: false });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {/* Email Field */}
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    Email ID
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none !text-slate-400">
                        <IoMailOutline />
                    </div>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your mail id"
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg !text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3bedb2] focus:border-transparent transition-colors"
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <TbLockPassword />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg !text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3bedb2] focus:border-transparent transition-colors"
                        required
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center !text-slate-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-300 select-none">
                    <input
                        type="checkbox"
                        className="accent-[#3bedb2]"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                </label>
                <a href="#" className="text-sm text-[#3bedb2]">
                    Forget Password?
                </a>
            </div>

            {/* Login Button */}
            <button
                type="submit"
                className="button w-full !bg-[#3bedb2] !text-[#0e1622] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Sign in"
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-4 mt-4">
                <div className="h-px flex-1 bg-gray-700" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-700" />
            </div>

            {/* Demo Sign-in Button */}
            <button
                type="button"
                onClick={handleDemoSignIn}
                className="button w-full bg-transparent border border-[#3bedb2] text-[#3bedb2] hover:bg-[#3bedb2]/10 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Sign in with demo account"
            >
                {loading ? "Signing in..." : "Demo Sign In "}
            </button>
        </form>
    );
}
