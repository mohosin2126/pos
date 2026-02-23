import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { RiCloseLargeFill, RiMenu3Fill } from "react-icons/ri";
import { BsDot } from "react-icons/bs";
import type { TNavLinkItem } from "@/interface/menu-and-common";
import logoFull from "@/assets/logo/logo-full.svg";

export default function Navbar() {
  const [isScroll, setIsScroll] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinks: TNavLinkItem[] = [
    { title: "Home", href: "/" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
    { title: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScroll(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    if (menuOpen) closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 text-white ${
        isScroll
          ? "bg-[#20333d]/95 backdrop-blur-md shadow py-3 sm:py-3"
          : "bg-[#0a131d] md:bg-transparent py-4 sm:py-5 md:py-8"
      }`}
      role="banner"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center select-none">
            <img src={logoFull} alt="POS" className="h-8 sm:h-9 lg:h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-4 xl:gap-8" aria-label="Primary">
            {navLinks.map((link, index) => (
              <NavLink
                to={link.href}
                key={index}
                className={({ isActive }) =>
                  `${isActive ? "text-[#51f0cb]" : ""} relative font-normal pb-2 group hover:text-[#51f0cb] transition-colors duration-300 flex items-center gap-1`
                }
              >
                {({ isActive }) => (
                  <>
                    <BsDot className={isActive ? "opacity-100" : "opacity-0"} />
                    <span className="text-sm md:text-base">{link.title}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 xl:gap-4">
            <Link to="/admin/dashboard" className="button" aria-label="Go to dashboard">
              Dashboard
            </Link>
          </div>

          <div className="md:hidden">
            <button
              className="text-[#49dcbb] p-2 -mr-2"
              onClick={toggleMenu}
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
              <RiMenu3Fill size={24} />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <button
          className="fixed inset-0 bg-black/40 z-[998] md:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        id="mobile-menu"
        className={`fixed top-0 left-0 z-[999] h-[100dvh] w-[80vw] max-w-72 bg-[#0a131d]/95 backdrop-blur-md shadow-xl transform transition-transform duration-300 ease-in-out md:hidden px-5 pt-[calc(env(safe-area-inset-top)+12px)] ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end pb-3">
          <button ref={closeBtnRef} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <RiCloseLargeFill className="border border-[#49dcbb] text-[#49dcbb] rounded-full w-8 h-8 p-[6px]" />
          </button>
        </div>

        <nav
          className="flex flex-col items-start space-y-5 mt-2"
          aria-label="Mobile Primary"
          onClick={() => setMenuOpen(false)}
        >
          {navLinks.map((link, index) => (
            <NavLink
              to={link.href}
              key={index}
              className={({ isActive }) =>
                `${isActive ? "text-[#51f0cb]" : ""} relative font-medium pb-2 hover:text-[#51f0cb] transition-colors duration-300`
              }
            >
              {link.title}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/admin/dashboard"
            className="button w-full text-center"
            onClick={() => setMenuOpen(false)}
            aria-label="Go to dashboard"
          >
            Dashboard
          </Link>
        </div>

        <div className="h-[env(safe-area-inset-bottom)]" />
      </aside>
    </header>
  );
}