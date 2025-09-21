import React from "react";
import Footer from "../home/footer";
import CommonBanner from "@/components/common/banner";
import Features from "../home/features";

export default function FeaturesPage() {
  return (
    <div className="container mx-auto">
      <CommonBanner
        className=""
        title="Our Key Features"
        description="Discover the powerful tools and benefits that make our solution stand out."
      />
      <Features />
      <Footer />
    </div>
  );
}
