import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const imageOrVideoFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
    cb(new Error("Only image or video files are allowed"));
    return;
  }
  cb(null, true);
};

const imageOnlyFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

export const uploadCampaignImage = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSubmissionFiles = multer({
  storage,
  fileFilter: imageOrVideoFilter,
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
});
