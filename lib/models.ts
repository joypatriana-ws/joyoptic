import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const bookingSchema = new Schema(
  {
    legacyId: { type: Number, index: true, sparse: true },
    // tipul din Croogo, doar la programările vechi; cele noi sunt toate „Consult oftalmologic" (id 0)
    bookingTypeId: { type: Number, default: 0 },
    bookingTypeTitle: { type: String, default: "Consult oftalmologic" },
    start: { type: Date, required: true, index: true },
    // „YYYY-MM-DD HH:MM" pe ora României; fiecare medic are programările lui
    slot: { type: String, required: true },
    end: { type: Date, required: true },
    confirmed: { type: Boolean, default: false },
    // anulată din admin (rămâne în evidență, dar nu mai ocupă ora)
    cancelled: { type: Boolean, default: false },
    // de unde a venit: formularul de pe site sau adăugată din admin (telefon / la cabinet)
    source: { type: String, enum: ["site", "admin"], default: "site" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    // la programările luate la telefon emailul poate lipsi
    email: { type: String, default: "" },
    doctor: { type: String, default: "" },
    message: { type: String, default: "" },
  },
  { timestamps: true },
);

// un medic nu poate avea două programări active în același interval de 15 minute (confirmat de cabinet)
bookingSchema.index({ doctor: 1, slot: 1 }, { unique: true, partialFilterExpression: { cancelled: false }, name: "medic_interval" });

const messageSchema = new Schema(
  {
    legacyId: { type: Number, index: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const pageSchema = new Schema(
  {
    legacyId: Number,
    slug: { type: String, required: true, unique: true },
    legacySlug: { type: String, index: true },
    title: { type: String, required: true },
    bodyHtml: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    published: { type: Boolean, default: true },
    promoted: { type: Boolean, default: false },
    images: [{ title: String, src: String, weight: Number }],
  },
  { timestamps: true },
);

const postSchema = new Schema(
  {
    legacyId: Number,
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    bodyHtml: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const blockSchema = new Schema(
  {
    alias: { type: String, required: true, unique: true },
    title: { type: String, default: "" },
    active: { type: Boolean, default: false },
    // conținutul blocului (pentru „special-offers": cardurile ofertelor)
    items: [{ _id: false, media: String, title: String, html: String }],
  },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    legacyId: Number,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    // null = cont fără parolă încă (importat din Croogo); se setează din admin sau cu scripts/admin-parola.mjs
    passwordHash: { type: String, default: null },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type BookingDoc = InferSchemaType<typeof bookingSchema> & { _id: mongoose.Types.ObjectId };
export type MessageDoc = InferSchemaType<typeof messageSchema> & { _id: mongoose.Types.ObjectId };
export type PageDoc = InferSchemaType<typeof pageSchema> & { _id: mongoose.Types.ObjectId };
export type PostDoc = InferSchemaType<typeof postSchema> & { _id: mongoose.Types.ObjectId };

// La hot reload modelele există deja; nu le redefinim.
export const Booking =
  (mongoose.models.Booking as Model<InferSchemaType<typeof bookingSchema>>) ??
  mongoose.model("Booking", bookingSchema);
export const Message =
  (mongoose.models.Message as Model<InferSchemaType<typeof messageSchema>>) ??
  mongoose.model("Message", messageSchema);
export const Page =
  (mongoose.models.Page as Model<InferSchemaType<typeof pageSchema>>) ??
  mongoose.model("Page", pageSchema);
export const Post =
  (mongoose.models.Post as Model<InferSchemaType<typeof postSchema>>) ??
  mongoose.model("Post", postSchema);
export const Block =
  (mongoose.models.Block as Model<InferSchemaType<typeof blockSchema>>) ??
  mongoose.model("Block", blockSchema);
export const User =
  (mongoose.models.User as Model<InferSchemaType<typeof userSchema>>) ??
  mongoose.model("User", userSchema);
