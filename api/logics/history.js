import ArtHistoryModel from "../models/history.js";

export function pushHistory(itemId = "", action = "blank") {
  const newData = new ArtHistoryModel({
    itemId: itemId,
    action: action,
  });
  return newData.save();
}

export function getHistoryByItemId(itemId = "") {
  return ArtHistoryModel.find({ itemId: itemId });
}
