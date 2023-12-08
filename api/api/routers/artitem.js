import { Router, json } from "express";
import urlJoin from "url-join";

import APIError, {
  APIAuthRequiredError,
  APILackPermissionError,
  APIServerNoSessionError,
  APITargetArtItemNotFound,
} from "../../utils/apierror.js";
import ArtItemModel from "../../models/artitem.js";
import { nanoid } from "nanoid";
import {
  getArtItemByItemId,
  searchOtherArtItems,
} from "../../logics/artitem.js";
import { error } from "../../utils/logging.js";
import { isDeveloperUser } from "../../logics/user.js";
import { getHistoryByItemId, pushHistory } from "../../logics/history.js";

const router = Router();

router.get("/artitem/:id", async (req, res) => {
  try {
    const targetArtItem = await getArtItemByItemId(req.params.id);

    if (!targetArtItem) {
      throw APITargetArtItemNotFound;
    }

    res.status(200).json({
      status: "OK",
      artItem: targetArtItem.toJSON(),
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

router.get("/artmetadata/:id", async (req, res) => {
  try {
    const targetArtItem = await getArtItemByItemId(req.params.id);

    if (!targetArtItem) {
      throw APITargetArtItemNotFound;
    }

    const imgDirPath = process.env.IMG_UPLOAD_PATH || "upload/image/";
    const fileName = targetArtItem.imagePaths[0];
    let prefix = `${req.protocol}://${req.hostname}`;
    if (req.socket.localPort !== 80) {
      prefix += `:${req.socket.localPort}`;
    }
    const fullFilePath = urlJoin(prefix, imgDirPath, fileName);

    res.status(200).json({
      title: targetArtItem.name,
      type: "object",
      properties: {
        name: {
          type: "string",
          description: targetArtItem.name,
        },
        description: {
          type: "string",
          description: targetArtItem.description,
        },
        image: {
          type: "string",
          description: fullFilePath,
        },
      },
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
    const artItems = await searchOtherArtItems(req.query.keyword || "").limit(
      100
    );

    const searchResults = [];
    const itemIds = new Set();

    if (targetArtItem) {
      itemIds.add(targetArtItem.itemId);
      searchResults.push({
        itemId: targetArtItem.itemId,
        name: targetArtItem.name,
        mac: targetArtItem.mac,
        owner: targetArtItem.owner,
        image: targetArtItem.imagePaths[0],
        nftId: targetArtItem.nftId,
      });
    }

    for (const item of artItems) {
      if (!itemIds.has(item.itemId)) {
        searchResults.push({
          itemId: item.itemId,
          name: item.name,
          mac: item.mac,
          owner: item.owner,
          image: item.imagePaths[0],
          nftId: item.nftId,
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

router.get("/arthistory/:id", async (req, res) => {
  try {
    const targetArtItem = await getArtItemByItemId(req.params.id);

    if (!targetArtItem) {
      throw APITargetArtItemNotFound;
    }

    const history = await getHistoryByItemId(req.params.id);
    res.status(200).json({
      status: "OK",
      itemId: req.params.id,
      history: history.map((ele) => {
        return {
          action: ele.action,
          createdAt: ele.createdAt,
        };
      }),
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

router.post("/artitem/add", json(), async (req, res) => {
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

    const newArtItem = new ArtItemModel({
      itemId: nanoid(),
      name: req.body.name,
      mac: req.body.mac,
      description: req.body.description,
      owner: req.body.owner,
      certificatePath: req.body.certificatePath,
      imagePaths: req.body.imagePaths,
      nftId: req.body.nftId,
    });

    await newArtItem.save();
    await pushHistory(newArtItem.itemId, "item-created");

    res.status(200).json({
      status: "OK",
      artItem: newArtItem.toJSON(),
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

router.post("/artitem/edit/:id", json(), async (req, res) => {
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

    const targetArtItem = await getArtItemByItemId(req.params.id);
    if (!targetArtItem) {
      throw APITargetArtItemNotFound;
    }

    if (typeof req.body.name !== "undefined") {
      targetArtItem.name = req.body.name;
    }

    if (typeof req.body.mac !== "undefined") {
      targetArtItem.mac = req.body.mac;
    }

    if (typeof req.body.description !== "undefined") {
      targetArtItem.description = req.body.description;
    }

    if (typeof req.body.certificatePath !== "undefined") {
      targetArtItem.certificatePath = req.body.certificatePath;
    }

    if (typeof req.body.imagePaths !== "undefined") {
      targetArtItem.imagePaths = req.body.imagePaths;
    }

    if (typeof req.body.nftId !== "undefined") {
      targetArtItem.nftId = req.body.nftId;
    }

    await targetArtItem.save();
    await pushHistory(targetArtItem.itemId, "item-edited");

    res.status(200).json({
      status: "OK",
      artItem: targetArtItem.toJSON(),
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
