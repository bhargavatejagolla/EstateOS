import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const LOCAL_UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

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
    folder = "estateos/properties",
    mimeType?: string
  ): Promise<CloudinaryUploadResult> {
    if (!isCloudinaryConfigured || env.NODE_ENV === "test") {
      // Clean target folder relative to LOCAL_UPLOADS_DIR
      const cleanFolder = folder.replace(/^estateos\//, "");
      const targetDir = path.join(LOCAL_UPLOADS_DIR, cleanFolder);
      await fs.promises.mkdir(targetDir, { recursive: true });

      // Determine extension
      let ext = "jpg";
      if (
        mimeType === "image/png" ||
        (buffer.length > 2 && buffer[0] === 0x89 && buffer[1] === 0x50)
      ) {
        ext = "png";
      } else if (
        mimeType === "image/webp" ||
        (buffer.length > 10 && buffer[8] === 0x57 && buffer[9] === 0x45)
      ) {
        ext = "webp";
      }

      const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = path.join(targetDir, filename);
      await fs.promises.writeFile(filePath, buffer);

      const relativePath = path.join(cleanFolder, filename).replace(/\\/g, "/");
      return {
        url: `/api/uploads/${relativePath}`,
        publicId: `local_${relativePath}`,
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
    if (publicId.startsWith("local_")) {
      const relativePath = publicId.replace(/^local_/, "");
      const filePath = path.join(LOCAL_UPLOADS_DIR, relativePath);
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // file already deleted or moved
      }
      return;
    }

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
