import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { env } from "../config/env.js";

const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export class CloudinaryService {
  static async uploadBuffer(
    buffer: Buffer,
    folder = "estateos/properties"
  ): Promise<CloudinaryUploadResult> {
    if (!isCloudinaryConfigured || env.NODE_ENV === "test") {
      // Deterministic mock for local testing or unconfigured environments
      const timestamp = Date.now();
      const mockId = `mock_${timestamp}_${Math.random().toString(36).substring(7)}`;
      return {
        url: `https://res.cloudinary.com/estateos-demo/image/upload/v1/${folder}/${mockId}.jpg`,
        publicId: `${folder}/${mockId}`,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          format: "webp",
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Cloudinary upload returned empty result"));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured || env.NODE_ENV === "test") {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.warn("⚠️ Failed to delete Cloudinary asset:", publicId, error);
    }
  }
}
