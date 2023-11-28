import escapeStringRegexp from "escape-string-regexp";

import ArtItemModel from "../models/artitem.js";

export function getArtItemByItemId(id) {
  return ArtItemModel.findOne({ itemId: id });
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
    $or: [{ name: kwRegex }, { owner: kwRegex }],
  });
}
