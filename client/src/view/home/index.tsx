
import Footer from "./footer";
import LocomotiveScroll from "locomotive-scroll";

export default function HomePage() {

    new LocomotiveScroll();

    return (
        <div className="pt-28 container mx-auto space-y-6 lg:space-y-16">
            <Footer />
        </div>
    );
}
