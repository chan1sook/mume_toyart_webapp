import { Router } from "express";
import APIError from "../../utils/apierror.js";
import {
  getArtItemByItemId,
  getArtItemCategoriesMetadata,
  searchAllArtItems,
  searchCategorizedArtItems,
  searchOtherArtItems,
  searchUncategorizedArtItems,
} from "../../logics/artitem.js";
import { error } from "../../utils/logging.js";
import { getQueryLimits } from "../../configs/runtime.js";

const router = Router();

router.get("/artcategories", async (req, res) => {
  try {
    const categories = await getArtItemCategoriesMetadata();

    res.status(200).json({
      status: "OK",
      categories: categories,
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

router.get("/artsearch", async (req, res) => {
  try {
    const targetArtItem = req.query.keyword
      ? await getArtItemByItemId(req.query.keyword)
      : null;
    const artItems = await searchOtherArtItems(
      req.query.keyword || "",
      req.query.nextfrom
    )
      .sort({ _id: 1 })
      .limit(getQueryLimits());

    const searchResults = [];
    const itemIds = new Set();

    if (targetArtItem) {
      itemIds.add(targetArtItem.itemId);
      searchResults.push({
        _id: targetArtItem._id,
        itemId: targetArtItem.itemId,
        name: targetArtItem.name,
        mac: targetArtItem.mac,
        owner: targetArtItem.owner,
        image: targetArtItem.imagePaths[0],
        nftId: targetArtItem.nftId,
        devChain: targetArtItem.devChain,
        chainVersion: targetArtItem.chainVersion,
      });
    }

    for (const item of artItems) {
      if (!itemIds.has(item.itemId)) {
        searchResults.push({
          _id: item._id,
          itemId: item.itemId,
          name: item.name,
          mac: item.mac,
          owner: item.owner,
          image: item.imagePaths[0],
          nftId: item.nftId,
          devChain: item.devChain,
          chainVersion: item.chainVersion,
        });
      }
    }

    res.status(200).json({
      status: "OK",
      items: searchResults,
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

router.get("/artsearch/all", async (req, res) => {
  try {
    const artItems = await searchAllArtItems(req.query.nextfrom)
      .sort({
        _id: 1,
      })
      .limit(getQueryLimits());

    const searchResults = [];
    const itemIds = new Set();

    for (const item of artItems) {
      if (!itemIds.has(item.itemId)) {
        searchResults.push({
          _id: item._id,
          itemId: item.itemId,
          name: item.name,
          mac: item.mac,
          owner: item.owner,
          image: item.imagePaths[0],
          nftId: item.nftId,
          devChain: item.devChain,
          chainVersion: item.chainVersion,
        });
      }
    }

    res.status(200).json({
      status: "OK",
      items: searchResults,
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

router.get("/artsearch/uncategorized", async (req, res) => {
  try {
    const artItems = await searchUncategorizedArtItems(req.query.nextfrom)
      .sort({ _id: 1 })
      .limit(getQueryLimits());

    const searchResults = [];
    const itemIds = new Set();

    for (const item of artItems) {
      if (!itemIds.has(item.itemId)) {
        searchResults.push({
          _id: item._id,
          itemId: item.itemId,
          name: item.name,
          mac: item.mac,
          owner: item.owner,
          image: item.imagePaths[0],
          nftId: item.nftId,
          devChain: item.devChain,
          chainVersion: item.chainVersion,
        });
      }
    }

    res.status(200).json({
      status: "OK",
      items: searchResults,
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

router.get("/artsearch/category", async (req, res) => {
  try {
    const artItems = await searchCategorizedArtItems(
      req.query.category,
      req.query.nextfrom
    )
      .sort({ _id: 1 })
      .limit(getQueryLimits());

    const searchResults = [];
    const itemIds = new Set();

    for (const item of artItems) {
      if (!itemIds.has(item.itemId)) {
        searchResults.push({
          _id: item._id,
          itemId: item.itemId,
          name: item.name,
          mac: item.mac,
          owner: item.owner,
          image: item.imagePaths[0],
          nftId: item.nftId,
          devChain: item.devChain,
          chainVersion: item.chainVersion,
        });
      }
    }

    res.status(200).json({
      status: "OK",
      items: searchResults,
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
