import CommonBanner from "@/components/common/banner";
import Packages from "../home/packages";
import ComparisonTable from "./comparison";
import Testimonials from "./testimonials";
import FAQ from "./faq";

export default function PricingPlanPage() {
  return (
    <div className="container mx-auto">
      <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-12 lg:pb-16">
        <CommonBanner
          className=""
          title="Our Pricing Plans"
          description="Choose a plan that fits your needs and budget. Transparent pricing with no hidden costs."
        />
      <Packages />
      <ComparisonTable />
      <Testimonials />
      <FAQ />
      </div>
    </div>
  );
}
