import mongoose from "mongoose";

export const USER_ROLES = ["developer"];

const userSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: false },
    username: { type: String, unique: true },
    hashedPw: { type: String, required: true, selected: false },
    role: {
      type: String,
      enum: USER_ROLES,
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);
export default UserModel;
