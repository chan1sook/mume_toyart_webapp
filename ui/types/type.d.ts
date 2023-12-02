type UserRole = "guest" | "developer";

interface UserDataResponse {
  _id?: string;
  role: UserRole;
  username: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  _id?: string;
  role: UserRole;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BrowserUploadFileData {
  link: string;
  file?: File;
}
interface UploadFileResponse {
  path: string;
}

interface ArtSearchResponse {
  itemId: string;
  name: string;
  mac: string;
  owner: string;
  image?: string;
}
interface ArtItemResponse {
  itemId: string;
  name: string;
  mac: string;
  description: string;
  owner: string;
  certificatePath: string;
  imagePaths: string[];
  createdAt: string;
  updatedAt: string;
}

interface ArtHistoryResponse {
  action: string;
  createdAt: string;
}
