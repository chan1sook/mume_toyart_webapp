import { isGuestUser } from "~/utils/role";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (isGuestUser(useSessionData().value)) {
    return createError({
      statusCode: 404,
      statusMessage: `Page not found: ${to.path}`,
    });
  }
});
