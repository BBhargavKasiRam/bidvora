require("dotenv").config();
const cloudinary = require("./config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bidvora/profiles" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

async function test() {
  try {
    const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64"); // 1x1 transparent PNG
    console.log("Uploading test image...");
    const result = await uploadToCloudinary(buffer);
    console.log("Success! URL:", result.secure_url);
  } catch (error) {
    console.error("Cloudinary Error:", error);
  }
}
test();
