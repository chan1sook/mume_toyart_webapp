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

interface ArtCategoriesResponse {
  totals: number;
  uncategorized: number;
  categories: {
    [x: string]: number;
  };
}

interface ArtSearchResponse {
  _id: string;
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
  categories: string[];
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
  sellable: boolean;
  price: bigint;
  uri: string;
}
