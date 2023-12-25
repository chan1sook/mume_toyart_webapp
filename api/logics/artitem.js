import escapeStringRegexp from "escape-string-regexp";

import {
  isUseDevchain,
  getDevChainVersion,
  getProdChainVersion,
} from "../configs/runtime.js";
import ArtItemModel from "../models/artitem.js";
import mongoose, { isObjectIdOrHexString } from "mongoose";

function getDevchainOrQuery() {
  return [
    {
      devChain: false,
    },
    {
      devChain: true,
      chainVersion: getDevChainVersion(),
    },
  ];
}

export function getArtItemByItemId(id) {
  if (isUseDevchain()) {
    return ArtItemModel.findOne({
      itemId: id,
      $or: getDevchainOrQuery(),
    });
  }

  // Still show hidden
  return ArtItemModel.findOne({
    itemId: id,
    devChain: false,
  });
}

export async function getArtItemCategoriesMetadata() {
  const categories = {};
  let uncategorizedN = 0;
  let totalItems = 0;

  const query = {};

  if (!isUseDevchain()) {
    // Restricted current + nft only
    query.devChain = false;
    query.nftId = { $exists: true };
    query.chainVersion = getProdChainVersion();
  } else {
    query.$or = getDevchainOrQuery();
  }

  const artItemCursor = ArtItemModel.find(query).cursor();
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
  const query = {};

  if (!isUseDevchain()) {
    query.devChain = false;
    query.nftId = { $exists: true };
    query.chainVersion = getProdChainVersion();
  } else {
    query.$or = getDevchainOrQuery();
  }

  if (isObjectIdOrHexString(nextFrom)) {
    query._id = {
      $gt: new mongoose.Types.ObjectId(nextFrom.toString()),
    };
  }

  return ArtItemModel.find(query);
}

export function searchUncategorizedArtItems(nextFrom) {
  const baseOrQuery = [
    { categories: { $exists: false } },
    { categories: { $eq: [] } },
  ];
  const query = {};

  if (!isUseDevchain()) {
    query.devChain = false;
    query.$or = baseOrQuery;
    query.nftId = { $exists: true };
    query.chainVersion = getProdChainVersion();
  } else {
    query.$and = [
      {
        $or: baseOrQuery,
      },
      {
        $or: getDevchainOrQuery(),
      },
    ];
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
    categories: categoryName,
  };

  if (!isUseDevchain()) {
    query.devChain = false;
    query.nftId = { $exists: true };
    query.chainVersion = getProdChainVersion();
  } else {
    query.$or = getDevchainOrQuery();
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
  const baseOrQuery = [{ name: kwRegex }, { mac: kwRegex }, { owner: kwRegex }];
  const query = {};

  if (!isUseDevchain()) {
    query.devChain = false;
    query.$or = baseOrQuery;
    query.nftId = { $exists: true };
    query.chainVersion = getProdChainVersion();
  } else {
    query.$and = [
      {
        $or: baseOrQuery,
      },
      {
        $or: getDevchainOrQuery(),
      },
    ];
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
