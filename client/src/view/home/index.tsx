import Banner from "./banner";
import Contact from "./contact";
import Features from "./services";
import Footer from "./footer";
import Packages from "./packages";
import Services from "./features";
import DeliveryProcess from "./delivery-process";
import Connect from "./connect";
import LocomotiveScroll from "locomotive-scroll";
import { useEffect } from "react";

export default function HomePage() {
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
    <div
      className="pt-28 container mx-auto space-y-6 lg:space-y-16"
      data-scroll-container
    >
      <Banner />
      <Features />
      <Services />
      <DeliveryProcess />
      <Packages />
      <Connect />
      <Contact />
      <Footer />
    </div>
  );
}
