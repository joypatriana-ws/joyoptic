"use client";

// Panou de dropdown randat în <body> (portal), poziționat fix lângă câmp.
// Secțiunile temei au `overflow: clip`, deci un panou absolut în interiorul lor s-ar tăia.

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

const GAP = 4;
const MARGIN = 12;

export function Floating({
  anchor,
  panelRef,
  children,
  className = "",
  matchWidth = false,
  id,
  role,
  label,
  onKeyDown,
}: {
  anchor: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  className?: string;
  /** panoul are cel puțin lățimea câmpului */
  matchWidth?: boolean;
  id?: string;
  role?: string;
  label?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number; minWidth?: number } | null>(null);
  const frame = useRef(0);

  useLayoutEffect(() => {
    function place() {
      const a = anchor.current?.getBoundingClientRect();
      const p = panelRef.current;
      if (!a || !p) return;
      const w = p.offsetWidth;
      const h = p.offsetHeight;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      // dedesubt dacă încape, altfel deasupra (dacă acolo e mai mult loc)
      const below = a.bottom + GAP + h <= vh - MARGIN || a.top - GAP - h < MARGIN;
      const top = below ? a.bottom + GAP : a.top - GAP - h;
      const left = Math.max(MARGIN, Math.min(a.left, vw - MARGIN - w));
      setPos({ top, left, minWidth: matchWidth ? a.width : undefined });
    }
    const schedule = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    // panoul își schimbă înălțimea (ex. după încărcarea orelor)
    const ro = new ResizeObserver(schedule);
    if (panelRef.current) ro.observe(panelRef.current);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [anchor, panelRef, matchWidth]);

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-label={label}
      onKeyDown={onKeyDown}
      style={{
        position: "fixed",
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        minWidth: pos?.minWidth,
        visibility: pos ? "visible" : "hidden",
      }}
      className={`z-[1000] ${className}`}
    >
      {children}
    </div>,
    document.body,
  );
}

/** Închide la click în afara câmpului și a panoului (panoul e în portal, deci în afara câmpului în DOM). */
export function useOutsideClose(open: boolean, refs: RefObject<HTMLElement | null>[], close: () => void) {
  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (refs.some((r) => r.current?.contains(e.target as Node))) return;
      close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, refs, close]);
}
