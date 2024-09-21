import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
global.mongoose = {
  conn: null,
  promise: null,
};

export async function dbConnect() {
  if (global.mongoose && global.mongoose.conn) {
    console.log("Using existing connection");
    return global.mongoose.conn;
  }

  const conString = process.env.MONGO_URL;
  const promise = mongoose.connect(conString, {
    autoIndex: true,
  });

  global.mongoose = {
    conn: await promise,
    promise,
  };
  console.log("Connected to MongoDB");

  return await promise;
}