import escapeStringRegexp from "escape-string-regexp";

import { isUseDevchain, getProdChainVersion } from "../configs/runtime.js";
import ArtItemModel from "../models/artitem.js";
import mongoose, { isObjectIdOrHexString } from "mongoose";

export function getArtItemByItemId(id) {
  if (isUseDevchain()) {
    return ArtItemModel.findOne({
      itemId: id,
      devChain: true,
    });
  }

  return ArtItemModel.findOne({
    itemId: id,
    devChain: false,
    chainVersion: getProdChainVersion(),
  });
}

export async function getArtItemCategoriesMetadata() {
  const categories = {};
  let uncategorizedN = 0;
  let totalItems = 0;

  const artItemCursor = ArtItemModel.find().cursor();
  let nextItem = await artItemCursor.next();
  while (nextItem) {
    totalItems += 1;
    if (nextItem.categories.length === 0) {
      uncategorizedN += 1;
    } else {
      for (const category of nextItem.categories) {
        if (typeof categories[category] !== "undefined") {
          categories[category] += 1;
        } else {
          categories[category] = 1;
        }
      }
    }
    nextItem = await artItemCursor.next();
  }
  return {
    totals: totalItems,
    uncategorized: uncategorizedN,
    categories: categories,
  };
}

export function searchAllArtItems(nextFrom) {
  const query = {
    devChain: true,
  };

  if (!isUseDevchain()) {
    query.devChain = false;
    query.chainVersion = getProdChainVersion();
  }

  if (isObjectIdOrHexString(nextFrom)) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(nextFrom.toString()),
    };
  }

  return ArtItemModel.find(query);
}

export function searchUncategorizedArtItems(nextFrom) {
  const query = {
    devChain: true,
    $or: [{ categories: { $exists: false } }, { categories: { $eq: [] } }],
  };

  if (!isUseDevchain()) {
    query.devChain = false;
    query.chainVersion = getProdChainVersion();
  }

  if (isObjectIdOrHexString(nextFrom)) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(nextFrom.toString()),
    };
  }

  return ArtItemModel.find(query);
}

export function searchCategorizedArtItems(categoryName = "", nextFrom) {
  const query = {
    devChain: true,
    categories: categoryName,
  };

  if (!isUseDevchain()) {
    query.devChain = false;
    query.chainVersion = getProdChainVersion();
  }

  if (isObjectIdOrHexString(nextFrom)) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(nextFrom.toString()),
    };
  }

  return ArtItemModel.find(query);
}

export function searchOtherArtItems(keyword = "", nextFrom) {
  const kwRegex = new RegExp(escapeStringRegexp(keyword));

  const query = {
    devChain: true,
    $or: [{ name: kwRegex }, { mac: kwRegex }, { owner: kwRegex }],
  };

  if (!isUseDevchain()) {
    query.devChain = false;
    query.chainVersion = getProdChainVersion();
  }

  if (isObjectIdOrHexString(nextFrom)) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(nextFrom.toString()),
    };
  }

  return ArtItemModel.find(query);
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
