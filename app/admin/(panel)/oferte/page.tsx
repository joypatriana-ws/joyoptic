import { connectDb } from "@/lib/db";
import { Block } from "@/lib/models";
import { defaultOffers } from "@/lib/offers.mjs";
import OferteClient from "./OferteClient";

export const dynamic = "force-dynamic";

export default async function PaginaOferte() {
  await connectDb();
  const block = await Block.findOne({ alias: "special-offers" }).lean();
  const oferte = block?.items?.length
    ? block.items.map((i) => ({ media: i.media ?? "", title: i.title ?? "", html: i.html ?? "" }))
    : defaultOffers;
  return <OferteClient activ={Boolean(block?.active)} oferte={oferte} />;
}
