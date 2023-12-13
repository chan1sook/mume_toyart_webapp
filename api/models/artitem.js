import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";
import { isUseDevchain, getChainVersion } from "../configs/runtime.js";

const artItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, unique: true },
    name: { type: String, required: true, index: true },
    mac: { type: String, default: "", index: true },
    description: { type: String, default: "" },
    owner: { type: String, default: "", index: true },
    categories: [{ type: String, required: true, index: true }],
    certificatePath: { type: String },
    imagePaths: [{ type: String, required: true }],
    nftId: { type: String },
    devChain: { type: Boolean, default: isUseDevchain(), index: true },
    chainVersion: { type: Number, default: getChainVersion(), index: true },
  },
  { timestamps: true }
);

artItemSchema.plugin(MongooseDelete, {
  overrideMethods: true,
  deletedBy: true,
});

const ArtItemModel = mongoose.model("artitem", artItemSchema);
export default ArtItemModel;
