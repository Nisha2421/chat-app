import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
    console.log(error);
  }
};
export const disconnectDB = async () => {
  try {
    mongoose.connection.on("disconnected", () => {
      console.log("connection closed");
    });
    await mongoose.disconnect();
  } catch (error) {
    console.log(error);
  }
};
