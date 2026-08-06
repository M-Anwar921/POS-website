import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret length:", process.env.CLOUDINARY_API_SECRET?.length);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload(
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  { folder: "pos_products" },
  (error, result) => {
    if (error) {
      console.log("UPLOAD FAILED:", error);
    } else {
      console.log("UPLOAD SUCCESS:", result.secure_url);
    }
  }
);