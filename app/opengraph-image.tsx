// Imaginea de previzualizare la distribuire (Facebook, WhatsApp etc.): fotografia din hero, logo-ul și numele.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} - Optică Medicală și Oftalmologie, ${site.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAGLINE = "Optică Medicală și Oftalmologie";
const ADDRESS = `${site.address}, ${site.city}`;

const asset = async (file: string, mime: string) =>
  `data:${mime};base64,${(await readFile(path.join(process.cwd(), "public/img", file))).toString("base64")}`;

/** Poppins (fontul titlurilor din temă), doar cu literele folosite; fără el se folosește fontul implicit. */
async function poppins(weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Poppins:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const [hero, logo, bold, regular] = await Promise.all([
    asset("hero-bg.jpg", "image/jpeg"),
    asset("logo.png", "image/png"),
    poppins(600, site.name),
    poppins(400, TAGLINE + ADDRESS),
  ]);
  const fonts = [
    bold && { name: "Poppins", data: bold, weight: 600 as const },
    regular && { name: "Poppins", data: regular, weight: 400 as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#fff", fontFamily: "Poppins" }}>
        {/* fotografia aliniată la dreapta (băiatul cu ochelari), estompată spre stânga */}
        <img src={hero} width={1430} height={630} style={{ position: "absolute", top: 0, right: 0 }} alt="" />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #fff 0%, #fff 46%, rgba(255,255,255,0.85) 56%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 720, position: "relative" }}>
          <img src={logo} width={168} height={80} alt="" />
          <div style={{ fontSize: 76, fontWeight: 600, color: "#155724", marginTop: 28, lineHeight: 1.1 }}>{site.name}</div>
          <div style={{ width: 80, height: 5, background: "#28a745", marginTop: 22, borderRadius: 3 }} />
          <div style={{ fontSize: 32, color: "#444", marginTop: 22, lineHeight: 1.3 }}>{TAGLINE}</div>
          <div style={{ fontSize: 24, color: "#777", marginTop: 14 }}>{ADDRESS}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
