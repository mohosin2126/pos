import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { RiCloseLargeFill, RiMenu3Fill } from "react-icons/ri";
import { BsDot } from "react-icons/bs";
import type { TNavLinkItem } from "@/interface/menu-and-common";

export default function Navbar() {
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinks: TNavLinkItem[] = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "Contact", href: "/contact" },
    // { title: "About Us", href: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScroll(window.scrollY > 0);

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
    }

    document.body.classList.toggle("overflow-hidden", menuOpen);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
      document.body.classList.remove("overflow-hidden");
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[999] py-4 transition-all duration-300 text-white  ${
        isScroll
          ? "bg-[#20333d] backdrop-blur-md shadow"
          : "bg-[#0a131d] lg:bg-transparent lg:py-8"
      }`}
    >
      <div className="container mx-auto grid grid-cols-3 items-center px-4">
        <div className="flex items-center text-4xl space-x-3">POS</div>

        <nav className="hidden lg:flex justify-center items-center space-x-7">
          {navLinks.map((link, index) => (
            <NavLink
              to={link.href}
              key={index}
              className={({ isActive }) =>
                `${
                  isActive ? "text-[#51f0cb]" : ""
                } relative font-normal pb-2 group hover:text-[#51f0cb] transition duration-500 flex items-center gap-1`
              }
            >
              {({ isActive }) => (
                <>
                  <BsDot className={isActive ? "opacity-100" : "opacity-0"} />
                  {link.title}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex justify-end items-center gap-4 ">
          <Link to="/auth" className="button" aria-label="Go to demo login">
            Demo
          </Link>
          <button className="button">Book A Call</button>
        </div>

        <div className="lg:hidden">
          <button
            className="text-[#49dcbb] cursor-pointer"
            onClick={toggleMenu}
          >
            <RiMenu3Fill size={24} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed w-full h-screen inset-0 bg-black/30 z-40"
          onClick={toggleMenu}
        ></div>
      )}

      {/* mobile menu */}
      <aside
        className={`fixed top-0 left-0 !z-[999] w-64 h-screen bg-[#0a131d]/80 backdrop-blur-md shadow-xl transform transition-transform duration-300  px-5 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end py-3 pr-0">
          <button onClick={toggleMenu}>
            <RiCloseLargeFill className=" border border-[#49dcbb] text-[#49dcbb] rounded-full w-8 h-8 p-[6px] cursor-pointer" />
          </button>
        </div>
        <nav
          className="flex flex-col items-center space-y-5 mt-3"
          onClick={() => setMenuOpen(false)}
        >
          {navLinks.map((link, index) => (
            <NavLink
              to={link.href}
              key={index}
              className={({ isActive }) =>
                `${
                  isActive ? "text-[#51f0cb]" : ""
                } relative font-medium pb-2 group hover:text-[#51f0cb] transition duration-500 flex items-center gap-1`
              }
            >
              {link.title}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 text-center flex flex-col gap-3">
          {/* NEW: Demo button in mobile menu */}
          <Link
            to="/auth"
            className="button w-full block text-center"
            onClick={() => setMenuOpen(false)}
            aria-label="Go to demo login"
          >
            Demo
          </Link>
          <button className="button w-full">Book A Call</button>
        </div>
      </aside>
    </header>
  );
}
