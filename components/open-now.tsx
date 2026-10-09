"use client";

import { useSyncExternalStore } from "react";
import { schedule } from "@/lib/site";

/** Textul se calculează pe ora României, nu pe ora vizitatorului. */
function statusNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Bucharest",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const now = `${parts.hour}:${parts.minute}`;
  const today = schedule.find((s) => (s.days as readonly number[]).includes(day));
  return today?.open && today.close && now >= today.open && now < today.close
    ? `Deschis acum, până la ${today.close}`
    : "Acum este închis. Te poți programa online oricând.";
}

const subscribe = () => () => {};

/** „Deschis acum, până la 19:00". Pe server nu afișează nimic, ca să nu fie ora build-ului. */
export function OpenNow({ className = "" }: { className?: string }) {
  const text = useSyncExternalStore(subscribe, statusNow, () => null);
  if (!text) return null;
  return <p className={className}>{text}</p>;
}
