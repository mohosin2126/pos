import { Link } from "react-router-dom";

export default function Unauthorized() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-3xl font-semibold mb-2">403 — Unauthorized</h1>
            <p className="text-slate-300 mb-6">You don’t have access to this area.</p>
            <Link to="/" className="button !bg-[#3bedb2] !text-[#0e1622] px-4 py-2 rounded-xl">
                Go Home
            </Link>
        </div>
    );
}
