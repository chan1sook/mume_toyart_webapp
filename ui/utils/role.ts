export function isGuestUser(userData: UserData) {
  return userData.role === "guest";
}

export function isDeveloperUser(userData: UserData) {
  return userData.role === "developer";
}
