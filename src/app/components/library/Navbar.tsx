"use client";

import React from "react";

type NavbarProps = {
  variant?: "light" | "dark";
  logo?: string;
  navItems?: string[];
};

export const Navbar = ({
  variant = "light",
  logo = "Logo",
  navItems = ["Home", "About", "Services", "Contact"],
}: NavbarProps) => {
  const bgColor = variant === "light" ? "bg-white" : "bg-black";
  const textColor = variant === "light" ? "text-black" : "text-white";
  const borderColor =
    variant === "light" ? "border-gray-200" : "border-gray-800";

  return (
    <nav
      className={`${bgColor} ${textColor} border-b ${borderColor} px-6 py-4`}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="font-bold text-xl">{logo}</div>
        <div className="flex gap-8">
          {navItems.map((item) => (
            <a key={item} href="#" className="hover:opacity-60 transition">
              {item}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};
