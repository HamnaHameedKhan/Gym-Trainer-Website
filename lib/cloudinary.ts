import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param file - base64 string or File object
 * @param folder - optional folder path
 */
export const uploadToCloudinary = async (file: string, folder?: string) => {
  try {
    const response = await cloudinary.v2.uploader.upload(file, {
      folder: folder || "GymTrainer website images/profile_images",
      overwrite: true,
    });
    return response.secure_url; // return URL of uploaded file
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};
