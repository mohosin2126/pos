import { FaTwitter, FaFacebookF } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import { IoArrowRedo } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-[#223041]">
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 text-[#c9d2df]">
          {/* Links */}
          <div className="border-y md:border-y-0 md:border-r border-[#223041] py-6 md:py-0 md:pr-8">
            <h3 className="text-2xl font-semibold text-white">Links</h3>
            <ul className="mt-6 space-y-3">
              <li>
                <Link to={"/"} className="text-[#46d4b5] hover:underline flex items-center gap-2">
                  <IoArrowRedo size={20} />
                  Features
                </Link>
              </li>
              <li>
                <Link to={"/"} className="text-[#46d4b5] hover:underline flex items-center gap-2">
                  <IoArrowRedo size={20} />
                  Pricing
                </Link>
              </li>
              <li>
                <Link to={"/"} className="text-[#46d4b5] hover:underline flex items-center gap-2">
                  <IoArrowRedo size={20} />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay tuned */}
          <div className="border-y md:border-y-0 md:border-r border-[#223041] py-6 md:py-0 md:px-8">
            <h3 className="text-2xl font-semibold text-white">Stay tuned</h3>
            <p className="text-[#93a3b5] leading-relaxed mt-4 max-w-xs">
              Connect with us and stay in the loop.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" aria-label="Twitter" className="button !p-3">
                <FaTwitter size={22} />
              </a>
              <a href="#" aria-label="Facebook" className="button !p-3">
                <FaFacebookF size={22} />
              </a>
            </div>
          </div>

          {/* Email updates */}
          <div className="border-y md:border-y-0 md:border-r border-[#223041] py-6 md:py-0 md:px-8">
            <h3 className="text-2xl font-semibold text-white">Email updates</h3>
            <p className="text-[#93a3b5] leading-relaxed mt-4 max-w-md">
              Be the first to hear about our offers and announcements.
            </p>
            <div className="mt-6">
              <div className="flex items-center gap-3 border border-[#223041] bg-[#0f141a] rounded-md px-4 h-14 max-w-xl">
                <FiMail size={22} className="text-[#c9d2df]" />
                <input
                  type="email"
                  placeholder="email"
                  className="bg-transparent flex-1 outline-none placeholder:text-[#93a3b5] text-white"
                />
              </div>
            </div>
          </div>

          {/* Contact us */}
          <div className="py-6 md:py-0 md:pl-8">
            <h3 className="text-2xl font-semibold text-white">Contact us</h3>
            <p className="text-[#93a3b5] leading-relaxed mt-4 max-w-xs">
              Questions? We've got answers. Try us.
            </p>
            <div className="mt-6">
              <button className="button">
                EMAIL US
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-[#223041] mt-10 pt-6 text-[#93a3b5]">
          <p className="text-center text-sm">
            Copyright 2025 © — <Link to="#" className="text-[#46d4b5]">Gen-Z Dev</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
