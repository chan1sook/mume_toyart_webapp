import { isDeveloperUser } from "~/utils/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!isDeveloperUser(useSessionData().value)) {
    return navigateTo("/");
  }
});
