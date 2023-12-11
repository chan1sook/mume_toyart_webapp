import escapeStringRegexp from "escape-string-regexp";

import { isUseDevchain, getChainVersion } from "../configs/runtime.js";
import ArtItemModel from "../models/artitem.js";

export function getArtItemByItemId(id) {
  return ArtItemModel.findOne({
    itemId: id,
    devChain: isUseDevchain(),
    chainVersion: getChainVersion(),
  });
}

export async function getUsedImagePaths() {
  const imagePaths = new Set();
  const artItemCursor = ArtItemModel.find().cursor();
  let nextItem = await artItemCursor.next();
  while (nextItem) {
    for (const path of nextItem.imagePaths) {
      imagePaths.add(path);
    }
    nextItem = await artItemCursor.next();
  }

  return Array.from(imagePaths);
}

export async function getUsedCertPaths() {
  const certPaths = new Set();
  const artItemCursor = ArtItemModel.find().cursor();
  let nextItem = await artItemCursor.next();
  while (nextItem) {
    if (nextItem.certificatePath) {
      certPaths.add(nextItem.certificatePath);
    }
    nextItem = await artItemCursor.next();
  }

  return Array.from(certPaths);
}

export function searchOtherArtItems(keyword = "") {
  const kwRegex = new RegExp(escapeStringRegexp(keyword));

  return ArtItemModel.find({
    devChain: isUseDevchain(),
    chainVersion: getChainVersion(),
    $or: [{ name: kwRegex }, { mac: kwRegex }, { owner: kwRegex }],
  });
}
