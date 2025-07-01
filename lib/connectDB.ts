const mongoose = require("mongoose");

const URL =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URL_PRODUCTION
    : process.env.MONGO_URL;

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    } else {
      await mongoose.connect(URL);
      console.log("✅ MongoDB Connected");
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

export default connectDB;
