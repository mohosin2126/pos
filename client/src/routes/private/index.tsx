import { useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import useApi from "@/hooks/use-api";
import { useUser } from "@/context-api";

function FullscreenSpinner() {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
        </div>
    );
}

export default function AdminGuard() {
    const token = useMemo(() => Cookies.get("token") || "", []);
    const location = useLocation();
    const { user, setUser } = useUser();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        let cancelled = false;

        // @ts-ignore
        async function ensureProfile() {
            if (!token) {
                setAuthorized(false);
                setChecking(false);
                return;
            }
            try {
                if (user) {
                    setAuthorized(user.role === "admin");
                    return;
                }
                const res = await useApi.get("/v1/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const ok = res?.data?.success;
                const profile = res?.data?.data;
                if (!ok || !profile) throw new Error("Failed to fetch profile");
                if (!cancelled) {
                    setUser(profile);
                    setAuthorized(profile.role === "admin");
                }
            } catch {
                Cookies.remove("token");
                Cookies.remove("user");
                if (!cancelled) setAuthorized(false);
            } finally {
                if (!cancelled) setChecking(false);
            }
        }

        ensureProfile();
        return () => {
            cancelled = true;
        };
    }, [token, user, setUser]);

    if (checking) return <FullscreenSpinner />;
    if (!token) return <Navigate to="/auth" replace state={{ from: location }} />;
    if (!authorized) return <Navigate to="/unauthorized" replace />;
    return <Outlet />;
}
