import Banner from "./banner";
import Contact from "./contact";
import Features from "./services";
import Footer from "./footer";
import Packages from "./packages";
import Services from "./features";
import DeliveryProcess from "./delivery-process";
import Connect from "./connect";
import LocomotiveScroll from "locomotive-scroll";

export default function HomePage() {

  new LocomotiveScroll();

  return (
    <div className="pt-28 container mx-auto space-y-6 lg:space-y-16">
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
