import Contact from "../home/contact";
import CommonBanner from "@/components/common/banner";

export default function ContactPage() {
  return (
    <div className="container mx-auto">
      <CommonBanner
        title="Get in Touch"
        description="We're here to answer your questions and provide the support you need. Reach out to us anytime."
      />
      <Contact />
    </div>
  );
}
