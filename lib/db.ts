import mongoose from "mongoose";

const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

/** O singură conexiune refolosită între invocările funcțiilor serverless. */
export function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Lipsește MONGODB_URI");
  globalForMongoose.mongooseConn ??= mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB ?? "joyoptic",
  });
  return globalForMongoose.mongooseConn;
}
