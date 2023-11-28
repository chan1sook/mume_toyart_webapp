import mongoose from "mongoose";

const artHistorySchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    action: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ArtHistoryModel = mongoose.model("arthistory", artHistorySchema);
export default ArtHistoryModel;
