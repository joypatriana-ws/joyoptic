"use client";

import { useEffect, useState } from "react";

/** #preloader din layout: ochiul SVG cu spițele care se rotesc, dispare la încărcarea paginii. */
export function Preloader() {
  const [state, setState] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const fade = () => {
      setState("fading");
      setTimeout(() => setState("gone"), 650);
    };
    if (document.readyState === "complete") fade();
    else window.addEventListener("load", fade, { once: true });
    return () => window.removeEventListener("load", fade);
  }, []);

  if (state === "gone") return null;

  const stroke = "var(--color-accent)";
  return (
    <div
      id="preloader"
      aria-hidden="true"
      className={`fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden bg-white transition-opacity duration-600 ease-out ${state === "fading" ? "pointer-events-none opacity-0" : ""}`}
    >
      <div className="relative flex h-auto w-[min(18vw,160px)] items-center justify-center" role="img" aria-label="Loading">
        <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="block h-auto w-full">
          <path d="M10 60 C40 10, 160 10, 190 60 C160 110, 40 110, 10 60 Z" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 24 C60 4, 140 4, 180 24" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
          <path d="M20 96 C60 116, 140 116, 180 96" fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round" />
          <circle cx="100" cy="60" r="22" fill="none" stroke={stroke} strokeWidth="6" />
          <circle cx="100" cy="60" r="6" fill={stroke} />
          <g transform="translate(100 60)">
            <g
              className="origin-center animate-[spin_3s_linear_infinite] transform-fill"
              stroke={stroke}
              strokeWidth="5"
              strokeLinecap="round"
            >
              <line x1="0" y1="-36" x2="0" y2="-24" />
              <line x1="0" y1="36" x2="0" y2="24" />
              <line x1="36" y1="0" x2="24" y2="0" />
              <line x1="-36" y1="0" x2="-24" y2="0" />
              <g transform="rotate(45)">
                <line x1="0" y1="-36" x2="0" y2="-24" />
              </g>
              <g transform="rotate(135)">
                <line x1="0" y1="-36" x2="0" y2="-24" />
              </g>
              <g transform="rotate(225)">
                <line x1="0" y1="-36" x2="0" y2="-24" />
              </g>
              <g transform="rotate(315)">
                <line x1="0" y1="-36" x2="0" y2="-24" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
