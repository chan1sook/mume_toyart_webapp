export function getImagePath(imgFile: string) {
  return `/mapi/upload/img/${imgFile}`;
}

export function getFakeImagePath(id: string) {
  return `https://picsum.photos/seed/${id}/200/250`;
}

export function getCertPath(imgFile: string) {
  return `/mapi/upload/cert/${imgFile}`;
}
