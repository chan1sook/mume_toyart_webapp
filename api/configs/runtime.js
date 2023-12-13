import dotenv from "dotenv";
import { log } from "../utils/logging.js";

function showRuntimeConfigs() {
  log([process.env.NODE_ENV], { name: "Runtime", tags: ["NODE_ENV"] });
}

export function init() {
  dotenv.config();
  log("Loaded Configs", { name: "Runtime" });
  showRuntimeConfigs();
}

export function isProductionMode() {
  return process.env.NODE_ENV === "production";
}

export function toggleProductionMode(isProduction) {
  if (!!isProduction) {
    process.env.NODE_ENV = "production";
  } else if (isProduction === false) {
    process.env.NODE_ENV = "development";
  } else {
    process.env.NODE_ENV = isProductionMode() ? "development" : "production";
  }

  return process.env.NODE_ENV;
}

export function isUseDevchain() {
  return !isProductionMode();
}

export function getChainVersion() {
  return isProductionMode() ? getProdChainVersion() : getDevChainVersion();
}

export function getProdChainVersion() {
  const value = process.env.CHAIN_VERSION;

  const n = parseInt(value || "1");
  if (!Number.isInteger(n) || n < 1) {
    return 1;
  }
  return n;
}

export function getDevChainVersion() {
  const value = process.env.DEV_CHAIN_VERSION;

  const n = parseInt(value || "1");
  if (!Number.isInteger(n) || n < 1) {
    return 1;
  }
  return n;
}

export function getQueryLimits() {
  const value = process.env.QUERY_LIMITS;

  const n = parseInt(value || "2000");
  if (!Number.isInteger(n) || n < 1) {
    return 1;
  }
  return n;
}
