import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const bookingSchema = new Schema(
  {
    legacyId: { type: Number, index: true, sparse: true },
    bookingTypeId: { type: Number, required: true },
    bookingTypeTitle: { type: String, required: true },
    start: { type: Date, required: true, index: true },
    end: { type: Date, required: true },
    confirmed: { type: Boolean, default: false },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    doctor: { type: String, default: "" },
  },
  { timestamps: true },
);

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
