import CommonBanner from "@/components/common/banner";
import Footer from "../home/footer";
import Packages from "../home/packages";

export default function PricingPlanPage() {
  return (
    <div className="container mx-auto">
      <CommonBanner
        className=""
        title="Our Pricing Plans"
        description="Choose a plan that fits your needs and budget. Transparent pricing with no hidden costs."
      />
      <Packages />
      <Footer />
    </div>
  );
}
