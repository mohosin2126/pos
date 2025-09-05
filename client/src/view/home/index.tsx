import Footer from "./footer";
import LocomotiveScroll from "locomotive-scroll";
import Features from "./features";
import Banner from "./banner";
import Services from "./services";
import DeliveryProcess from "./deliver-process";
import Packages from "./packages";
import Connect from "./connect";

export default function HomePage() {

    new LocomotiveScroll();

    return (
        <div className="pt-28 container mx-auto space-y-6 lg:space-y-16">
            <Banner/>
            <Features/>
            <Services/>
            <DeliveryProcess/>
            <Packages/>
            <Connect/>
            <Footer />
        </div>
    );
}
