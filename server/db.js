const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error, "error while connecting DB");
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
