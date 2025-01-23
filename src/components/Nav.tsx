import React, { useState } from "react";
import * as motion from "motion/react-client";
import { navigate } from "astro:transitions/client";
import { cn } from "../lib/utils";

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
  const normPath = currentPath.replace(/\/+$/, "") || "/";

  return (
    <div className="flex gap-4 py-2">
      {tabs.map((tab) => {
        const isCurrentPath = normPath === tab.href;
        return (
          <button
            onClick={() => {
              setCurrentPath(tab.href);
              navigate(tab.href);
            }}
            key={tab.id}
            className={cn(
              !isCurrentPath && "hover:text-cyan-500/50",
              "relative rounded-full px-4 py-2 text-lg font-bold text-cyan-500 transition",
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isCurrentPath && (
              <motion.div
                layoutId="nav"
                className="absolute inset-0 z-10 bg-cyan-500 mix-blend-difference"
                style={{ borderRadius: 9999 }}
                transition={{ type: "spring", duration: 1 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Nav;
