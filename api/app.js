import { init as initRuntime, isProductionMode } from "./configs/runtime.js";
import { startMongoDbService } from "./services/mongoose.js";
import { startApiService } from "./api/api.js";
import { startRedisService } from "./services/redis.js";
import { initDevUsers } from "./logics/user.js";
import { getCleanJobs } from "./logics/routine.js";

async function init() {
  initRuntime();

  await startRedisService();
  await startMongoDbService();

  await initDevUsers();

  startApiService(parseInt(process.env.API_PORT, 10));

  if (!isProductionMode()) {
    const job = getCleanJobs();
    job.start();
  }
}

init();
