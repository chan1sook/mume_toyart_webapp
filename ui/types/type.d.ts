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
  nftId?: number;
  devChain: boolean;
  chainVersion: number;
}
interface ArtItemResponse {
  itemId: string;
  name: string;
  mac: string;
  description: string;
  owner: string;
  certificatePath: string;
  imagePaths: string[];
  nftId?: string;
  devChain: boolean;
  chainVersion: number;
  createdAt: string;
  updatedAt: string;
}

interface ArtHistoryResponse {
  action: string;
  createdAt: string;
}

interface EthTxReciptLogResonse {
  fragment: {
    name: string;
  };
  args: any[];
}

interface NftInfomation {
  owner: string;
  tradable: boolean;
  price: bigint;
  uri: string;
}
