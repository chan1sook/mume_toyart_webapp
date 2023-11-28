export const useSessionData = () => {
  return useState<UserData>("useSessionData", () => {
    return {
      role: "guest",
    };
  });
};
