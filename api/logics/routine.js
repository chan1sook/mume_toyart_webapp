import fs from "fs/promises";
import path from "path";

import { CronJob } from "cron";
import { getUsedCertPaths, getUsedImagePaths } from "./artitem.js";
import { error, log } from "../utils/logging.js";
import { getRedisClient } from "../services/redis.js";
import { isProductionMode } from "../configs/runtime.js";

const redisImgPathKey = "mumeatoy-imgs";
const redisCertPathKey = "mumeatoy-certs";

function intersectedPaths(pathA = [], pathB = []) {
  return pathA.filter((ele) => pathB.includes(ele));
}
function diffPaths(pathA = [], pathB = []) {
  return pathA.filter((ele) => !pathB.includes(ele));
}

async function cleanImages() {
  const redisClient = getRedisClient();

  const usedImagePaths = await getUsedImagePaths();
  const imgDirPath = process.env.IMG_UPLOAD_PATH || "upload/image/";
  await fs.mkdir(imgDirPath, { recursive: true });
  const imgPaths = await fs.readdir(imgDirPath);
  const unusedImgPaths = diffPaths(imgPaths, usedImagePaths);

  const prevUnusedImgPaths = await redisClient.lRange(redisImgPathKey, 0, -1);
  const deletedUnusedImgPaths = intersectedPaths(
    prevUnusedImgPaths,
    unusedImgPaths
  );

  for (const filePath of deletedUnusedImgPaths) {
    fs.unlink(path.join(imgDirPath, filePath)).catch((err) => {
      error("Remove Failed", { tags: filePath, name: "Cleanup Image" });
    });
  }

  const pendingUnusedImgPaths = diffPaths(
    unusedImgPaths,
    deletedUnusedImgPaths
  );

  await redisClient.del(redisImgPathKey);
  if (pendingUnusedImgPaths.length > 0) {
    await redisClient.rPush(redisImgPathKey, pendingUnusedImgPaths);
  }

  log(`Cleaned ` + `${deletedUnusedImgPaths.length}`.magenta + ` Item(s)`, {
    name: "Cleanup Image",
  });
  log(`Pending ` + `${pendingUnusedImgPaths.length}`.magenta + ` Item(s)`, {
    name: "Cleanup Image",
  });
}

async function cleanCerts() {
  const redisClient = getRedisClient();

  const usedCertPaths = await getUsedCertPaths();
  const certDirPath = process.env.CERT_UPLOAD_PATH || "upload/cert/";
  await fs.mkdir(certDirPath, { recursive: true });
  const certPaths = await fs.readdir(certDirPath);
  const unusedCertPaths = diffPaths(certPaths, usedCertPaths);

  const prevUnusedCertPaths = await redisClient.lRange(redisCertPathKey, 0, -1);
  const deletedUnusedCertPaths = intersectedPaths(
    prevUnusedCertPaths,
    unusedCertPaths
  );

  for (const filePath of deletedUnusedCertPaths) {
    fs.unlink(path.join(certDirPath, filePath)).catch((err) => {
      error("Remove Failed", { tags: filePath, name: "Cleanup Cert" });
    });
  }
  const pendingUnusedCertPaths = diffPaths(
    unusedCertPaths,
    deletedUnusedCertPaths
  );

  await redisClient.del(redisCertPathKey);
  if (pendingUnusedCertPaths.length > 0) {
    await redisClient.rPush(redisCertPathKey, pendingUnusedCertPaths);
  }

  log(`Cleaned ` + `${unusedCertPaths.length}`.magenta + ` Item(s)`, {
    name: "Cleanup Cert",
  });
  log(`Pending ` + `${pendingUnusedCertPaths.length}`.magenta + ` Item(s)`, {
    name: "Cleanup Cert",
  });
}

export function cleanAll() {
  cleanImages();
  cleanCerts();
}

export function getCleanJobs() {
  return new CronJob(
    isProductionMode() ? "0 0 * * *" : "* * * * *",
    cleanAll,
    null,
    false,
    "Asia/Bangkok"
  );
}
