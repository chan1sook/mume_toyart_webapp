import fs from "fs/promises";
import path from "path";

import { Router } from "express";
import convertSize from "convert-size";
import multer from "multer";
import imageType from "image-type";
import sharp from "sharp";
import { nanoid } from "nanoid";

import { error } from "../../utils/logging.js";
import { isDeveloperUser } from "../../logics/user.js";
import APIError, {
  APIAuthRequiredError,
  APIMissingFormParameterError,
  APIServerNoSessionError,
  APIMalformedParameterError,
  APILackPermissionError,
} from "../../utils/apierror.js";

const router = Router();

const imageUpload = multer({
  limits: {
    fileSize: convertSize("2 MiB"), // 2 MiB
  },
  storage: multer.memoryStorage(),
});
const certUpload = multer({
  limits: {
    fileSize: convertSize("20 MiB"), // 2 MiB
  },
  storage: multer.memoryStorage(),
});

router.post("/upload/image", imageUpload.single("image"), async (req, res) => {
  try {
    if (!req.session) {
      throw APIServerNoSessionError;
    }

    if (!req.session.userData) {
      throw APIAuthRequiredError;
    }

    if (!isDeveloperUser(req.session.userData)) {
      throw APILackPermissionError;
    }

    if (!req.file) {
      throw APIMissingFormParameterError;
    }

    const fileType = await imageType(req.file.buffer);
    if (!fileType) {
      throw APIMalformedParameterError;
    }

    const imgDirPath = process.env.IMG_UPLOAD_PATH || "upload/image/";
    await fs.mkdir(imgDirPath, { recursive: true });

    const filePath = `${nanoid()}.png`;
    const fullFilePath = path.join(imgDirPath, filePath);

    await sharp(req.file.buffer).resize(null, 512).png().toFile(fullFilePath);

    res.status(200).json({
      status: "OK",
      path: filePath,
    });
  } catch (err) {
    let code = 500;
    let errorId;

    if (err instanceof APIError) {
      code = err.code;
      errorId = err.errorId;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      errorId,
      message: err.message,
    });
  }
});

router.post("/upload/cert", certUpload.single("cert"), async (req, res) => {
  try {
    if (!req.session) {
      throw APIServerNoSessionError;
    }

    if (!req.session.userData) {
      throw APIAuthRequiredError;
    }

    if (!isDeveloperUser(req.session.userData)) {
      throw APILackPermissionError;
    }

    if (!req.file) {
      throw APIMissingFormParameterError;
    }

    const certDirPath = process.env.CERT_UPLOAD_PATH || "upload/cert/";
    await fs.mkdir(certDirPath, { recursive: true });

    const filePath = `${nanoid()}${path.extname(req.file.originalname)}`;
    const fullFilePath = path.join(certDirPath, filePath);

    await fs.writeFile(fullFilePath, req.file.buffer);

    res.status(200).json({
      status: "OK",
      path: filePath,
    });
  } catch (err) {
    let code = 500;
    let errorId;

    if (err instanceof APIError) {
      code = err.code;
      errorId = err.errorId;
    }

    error(err.message, { name: "API", tags: [`${code}`] });
    res.status(code).json({
      status: "Error",
      code,
      errorId,
      message: err.message,
    });
  }
});

export default router;
