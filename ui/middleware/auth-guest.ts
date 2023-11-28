import { isGuestUser } from "~/utils/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!isGuestUser(useSessionData().value)) {
    return navigateTo("/");
  }
});
