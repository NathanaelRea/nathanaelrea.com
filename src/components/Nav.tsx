import React, { useState } from "react";
import * as motion from "motion/react-client";
import { navigate } from "astro:transitions/client";

const tabs = [
  { id: "home", label: "Home", href: "/" },
  { id: "art", label: "Art", href: "/art" },
  { id: "photos", label: "Photos", href: "/photos" },
];

interface NavProps {
  defaultPath: string;
}
const Nav: React.FC<NavProps> = ({ defaultPath }) => {
  const [currentPath, setCurrentPath] = useState(defaultPath);

  return (
    <div className="flex gap-4">
      {tabs.map((tab) => (
        <button
          onClick={() => {
            setCurrentPath(tab.href);
            navigate(tab.href);
          }}
          key={tab.id}
          className={`${
            currentPath === tab.href ? "" : "hover:text-cyan-500/50"
          } relative rounded-full px-4 py-2 text-sm font-bold text-cyan-500 transition`}
          style={{
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {currentPath === tab.href && (
            <motion.div
              layoutId="nav"
              className="absolute inset-0 z-10 bg-cyan-500 mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", duration: 1 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Nav;
