import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { AppError } from "./errors.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const isFileSize = err.code === "LIMIT_FILE_SIZE";
    res.status(400).json({
      error: {
        code: isFileSize ? "FILE_TOO_LARGE" : "UPLOAD_ERROR",
        message: isFileSize ? "File size exceeds 5MB limit" : err.message,
      },
    });
    return;
  }

  if (err instanceof Error) {
    if (err.message === "Invalid file type") {
      res.status(400).json({
        error: {
          code: "INVALID_FILE_TYPE",
          message: "Only JPEG, PNG, and WebP images are allowed",
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: err.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unknown error occurred",
    },
  });
}
