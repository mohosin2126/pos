import { Outlet } from "react-router-dom";
import Navbar from "@/view/home/navbar";
import Footer from "@/view/home/footer";
import { useEffect } from "react";
import LocomotiveScroll from "locomotive-scroll";

export default function HomeLayout() {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(
      "[data-scroll-container]"
    );
    if (!container) return;

    const scroll = new LocomotiveScroll({
      el: container,
      smooth: true,
    });

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <>
      <Navbar />
      <div
        data-scroll-container
        className="bg-[#0a131d] text-white font-primary text-sm md:text-base overflow-x-hidden"
      >
        <main className="pt-28">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
