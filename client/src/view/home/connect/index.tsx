import React from "react";
import { Link } from "react-router-dom";
import connectBg from "./connectBG.jpg";

const Connect = () => {
  return (
    <div
      className="bg-cover bg-center rounded-xl p-8 border border-[#2a3441] max-w-2xl mx-auto flex flex-col items-center text-center"
      style={{ backgroundImage: `url(${connectBg})` }}
    >
      <h3 className="text-xl lg:text-3xl font-bold text-white mb-4">
        Ready to Transform Your Business?
      </h3>
      <p className="text-[#a0aec0] mb-6">
        Join thousands of shopkeepers who have streamlined their operations with
        our POS system. Start your journey today!
      </p>
      <Link to={"/"} className="button">
        Book A Call
      </Link>
    </div>
  );
};

export default Connect;
