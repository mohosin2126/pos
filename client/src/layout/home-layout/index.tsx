import { Outlet } from "react-router-dom";
import Navbar from "@/view/home/navbar";

export default function HomeLayout() {
  return (
    <div className="bg-[#0a131d] text-white font-primary text-sm md:text-base">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
