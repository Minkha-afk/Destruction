import mongoose from "mongoose";

let connecting: Promise<typeof mongoose> | null = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  if (mongoose.connection.readyState === 1) return mongoose;
  if (connecting) return connecting;

  mongoose.set("strictQuery", true);
  connecting = mongoose.connect(uri).then((m) => {
    console.log(`[learning-service] MongoDB connected (${m.connection.name})`);
    return m;
  });

  return connecting;
};

export default connectDB;
