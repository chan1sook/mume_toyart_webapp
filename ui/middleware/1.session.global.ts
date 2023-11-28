import dayjs from "dayjs";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { data } = await useFetch("/mapi/user");
  const response: { userData: UserDataResponse } | undefined = data.value as
    | { userData: UserDataResponse }
    | undefined;

  let createdAt = undefined;
  if (response && response?.userData.createdAt) {
    createdAt = dayjs(response.userData.createdAt).toDate();
  }
  let updatedAt = undefined;
  if (response && response?.userData.updatedAt) {
    updatedAt = dayjs(response.userData.updatedAt).toDate();
  }

  useSessionData().value = {
    _id: response?.userData._id,
    role: response?.userData.role || "guest",
    username: response?.userData.username,
    createdAt: createdAt,
    updatedAt: updatedAt,
  };
});
