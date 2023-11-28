import bcrypt from "bcrypt";
import UserModel from "../models/user.js";
import { log } from "../utils/logging.js";

export async function initDevUsers() {
  const targetUser = await UserModel.findOne({ role: "developer" });
  if (!targetUser) {
    const newUser = new UserModel({
      active: true,
      username: process.env.INIT_DEV_USERNAME,
      hashedPw: await bcrypt.hash(process.env.INIT_DEV_PASSWORD, 12),
      role: "developer",
    });
    await newUser.save();
    log("Developer User Created", { name: "initDevUsers" });
  } else {
    if (!targetUser.active) {
      targetUser.active = true;
      await targetUser.save();
      log("Migrated Active Users", { name: "initDevUsers" });
    } else {
      log("Already Have Developer User", { name: "initDevUsers" });
    }
  }
}

export async function userLogin(username, password) {
  const targetUser = await UserModel.findOne({ username, active: true }).select(
    "+hashedPw"
  );
  if (targetUser) {
    if (await bcrypt.compare(password, targetUser.hashedPw)) {
      const response = targetUser.toJSON();
      delete response.hashedPw;
      return response;
    }
  }

  return null;
}

export function getUserById(
  _id,
  { withHashedPassword = false } = { withHashedPassword: false }
) {
  let query = UserModel.findById(_id);

  if (withHashedPassword) {
    return query.select("+hashedPw");
  } else {
    return query;
  }
}

export function isDeveloperUser(userData = {}) {
  return userData.role === "developer";
}
