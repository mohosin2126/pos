import React from "react";
import { HiOutlineStar } from "react-icons/hi";
import Title from "@/components/title";
export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Store Manager",
      company: "Tech Retail Co.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      testimonial:
        "Implementing POS has been a game-changer for our store. We've seen a 40% reduction in checkout time and our inventory accuracy has improved significantly. The team loves the intuitive interface.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Owner",
      company: "Chen's Coffee Shop",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      testimonial:
        "The mobile-friendly dashboard lets me track sales and inventory from anywhere. Customer support is exceptional – they helped us set up custom integrations with our supplier system in no time.",
      rating: 5,
    },
    {
      name: "Emma Williams",
      role: "Operations Director",
      company: "Fashion Boutique Network",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      testimonial:
        "We manage 5 locations with this system. The multi-user support and real-time sync makes coordination seamless. The reporting features give us insights we never had before. Highly recommended!",
      rating: 5,
    },
    {
      name: "David Martinez",
      role: "Restaurant Owner",
      company: "Martinez's Kitchen",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      testimonial:
        "Fast checkout speeds mean shorter customer wait times and happier customers. The integration with our payment gateway was painless, and the cloud backup gives me peace of mind.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <Title
            title="Trusted by Businesses Worldwide"
            description="See what our customers have to say about their experience"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(105,254,193,0.05),transparent_70%)]"></div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group rounded-lg border border-[#253243] bg-gradient-to-br from-[#0f1620] via-[#0d141c] to-[#0b121a] p-6 transition-all duration-300 hover:border-[#7ff6d0] hover:shadow-lg hover:shadow-[#7ff6d0]/10 hover:-translate-y-1"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <HiOutlineStar
                    key={i}
                    className="w-4 h-4 text-[#69fec1] fill-[#69fec1]"
                  />
                ))}
              </div>

              <p className="text-sm text-[#a0aec0] leading-relaxed mb-6 italic">
                "{testimonial.testimonial}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-[#253243]">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border border-[#69fec1]/30 object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-[#cfd7e2]">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-[#7a8899]">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center rounded-lg border border-[#253243] bg-[#0f1a2a] p-6 hover:border-[#69fec1] transition-colors">
            <div className="text-3xl font-extrabold text-[#69fec1]">1000+</div>
            <p className="text-xs text-[#a0aec0] mt-2">Active Businesses</p>
          </div>
          <div className="text-center rounded-lg border border-[#253243] bg-[#0f1a2a] p-6 hover:border-[#69fec1] transition-colors">
            <div className="text-3xl font-extrabold text-[#69fec1]">4.9/5</div>
            <p className="text-xs text-[#a0aec0] mt-2">Average Rating</p>
          </div>
          <div className="text-center rounded-lg border border-[#253243] bg-[#0f1a2a] p-6 hover:border-[#69fec1] transition-colors">
            <div className="text-3xl font-extrabold text-[#69fec1]">99.9%</div>
            <p className="text-xs text-[#a0aec0] mt-2">Uptime SLA</p>
          </div>
        </div>
      </div>
    </section>
  );
};
