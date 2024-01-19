<template>
  <MumeContainer class="flex flex-col ">
    <div class="flex-1 flex flex-col overflow-y-auto">
      <form class="w-full p-4 flex flex-col justify-center items-center gap-y-2" @submit.prevent="editItem">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          Edit Item #{{ id }}
        </h3>
        <div class="custom-grid gap-x-2 gap-y-2 w-full max-w-5xl">
          <div class="pt-2">ID</div>
          <div>
            <MumeInput :model-value="id" type="input" readonly />
          </div>
          <div class="pt-2">Name</div>
          <div>
            <MumeInput v-model="itemData.name" type="input" placeholder="Name" required />
          </div>
          <div class="pt-2">MAC</div>
          <div>
            <MumeInput v-model="itemData.mac" type="input" placeholder="MAC" />
          </div>
          <div class="pt-2">Description</div>
          <div>
            <MumeTextArea v-model="itemData.description" type="input" placeholder="Description" required />
          </div>
          <div class="pt-2">Categories</div>
          <div>
            <v-select v-model="itemData.categories" :options="allCategories" class="bg-slate-600" multiple
              taggable></v-select>
          </div>
          <div class="pt-2">Preview Images</div>
          <div class="flex flex-col gap-y-1">
            <div class="flex flex-row gap-x-2 items-center">
              <MumeFileInput accept="image/*" multiple :selectedText="selectedImageFileText" @change="updateImageFiles" />
              <MumeButton type="button" title="Reset" class="flex flex-row gap-x-2 items-center" @click="resetImages">
                <Icon name="uil:redo" />
                <span class="hidden sm:inline">Reset</span>
              </MumeButton>
            </div>
            <div class="text-sm">Limit 2MiB/each</div>
          </div>
          <div></div>
          <div>
            <div v-for="(linkData, i) of sortedImageLinks"
              class="flex flex-row items-center gap-x-2 border-b border-gray-400 last:border-0 hover:bg-white/10">
              <div class="flex flex-col gap-y-1">
                <div class="cursor-pointer" title="Up" @click="moveImageUp(i)">
                  <Icon name="uil:angle-up" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Down" @click="moveImageDown(i)">
                  <Icon name="uil:angle-down" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
              </div>
              <div class="w-8">
                <Icon v-if="linkData.file" name="uil:asterisk" size="2em" />
              </div>
              <div class="flex-1 flex flex-row">
                <img :src="linkData.file ? linkData.link : getImagePath(linkData.link)"
                  class="mx-auto h-20 border border-gray-400 rounded" loading="lazy" />
              </div>
              <div class="cursor-pointer" title="Remove" @click="removeImage(i)">
                <Icon name="uil:trash-alt" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
              </div>
            </div>
          </div>
          <template v-if="alreadyHaveNft">
            <div>NFT ID</div>
            <div>
              {{ nftId }}
            </div>
            <div class="pt-2">Wallet</div>
            <div>
              <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center">
                <ClientOnly>
                  <w3m-button class="inline-block" />
                </ClientOnly>
                <span v-if="useDevChain" class="text-red-300 capitalize">Dev Chain: For Testing Only</span>
              </div>
              <template v-if="!isSelectedChainCorrect">
                <div class="italic">Not in JIB Chain!</div>
              </template>
            </div>
            <template v-if="isWalletConnected">
              <div>Price</div>
              <div>
                {{ formatUnits(priceWei, "ether") }} JBC
              </div>
              <template v-if="!!claimAbi">
                <div class="pt-2">Claimable MU</div>
                <div class="flex flex-row flex-wrap items-center gap-x-2">
                  <input id="with-claim" v-model="nftOptions.muClaimable" type="checkbox" />
                  <label for="with-claim">Claimable</label>
                </div>
                <template v-if="nftOptions.muClaimable">
                  <div class="pt-2">MU Value</div>
                  <div class="flex flex-col gap-y-1">
                    <div class="flex flex-row">
                      <MumeInput v-model="nftOptions.muClaimPrice" class="flex-1" placeholder="Token Unit"
                        inputClasses="rounded-r-none" :invalid="!isMuPriceValid" />
                      <MumeSelect v-model="nftOptions.muClaimPriceUnit" class="inline-flex" selectClasses="rounded-none">
                        <option value="wei">Wei</option>
                        <option value="gwei">GWei</option>
                        <option value="ether">Ether</option>
                      </MumeSelect>
                      <MumeButton class="rounded-l-none" @click="setAutoMuPrice">Auto</MumeButton>
                    </div>
                    <div v-if="isMuPriceValid">
                      <div class="italic">{{ formatUnits(muClaimWei, "ether") }} MU</div>
                    </div>
                  </div>
                </template>
              </template>
              <div>NFT Validation</div>
              <div>
                <div v-if="isNftOptionsValid" class="flex flex-row gap-x-1 items-center" title="Valid">
                  <Icon name="uil:check" size="1.5em" />
                  <span class="hidden sm:block">Valid</span>
                </div>
                <div v-else class="flex flex-row gap-x-1 items-center" title="Invalid">
                  <Icon name="uil:times" size="1.5em" />
                  <span class="hidden sm:block">Invalid</span>
                </div>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="pt-2">NFT</div>
            <div class="flex flex-row flex-wrap items-center gap-x-2">
              <input id="with-nft" v-model="nftOptions.generated" type="checkbox" />
              <label for="with-nft">Create Nft</label>
            </div>
            <template v-if="nftOptions.generated">
              <div class="pt-2">Wallet</div>
              <div>
                <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center">
                  <ClientOnly>
                    <w3m-button class="inline-block" />
                  </ClientOnly>
                  <span v-if="useDevChain" class="text-red-300 capitalize">Dev Chain: For Testing Only</span>
                </div>
                <template v-if="!isSelectedChainCorrect">
                  <div class="italic">Not in JIB Chain!</div>
                </template>
              </div>
              <div class="pt-2">Price</div>
              <div class="flex flex-col gap-y-1">
                <div class="flex flex-row">
                  <MumeInput v-model="nftOptions.price" class="flex-1" placeholder="Token Unit"
                    inputClasses="rounded-r-none" :invalid="!isNftPriceValid" />
                  <MumeSelect v-model="nftOptions.priceUnit" class="inline-flex" selectClasses="rounded-l-none">
                    <option value="wei">Wei</option>
                    <option value="gwei">GWei</option>
                    <option value="ether">Ether</option>
                  </MumeSelect>
                </div>
                <div v-if="isNftPriceValid">
                  <div class="italic">{{ formatUnits(priceWei, "ether") }} JBC</div>
                </div>
              </div>
              <template v-if="!!claimAbi">
                <div class="pt-2">Claimable MU</div>
                <div class="flex flex-row flex-wrap items-center gap-x-2">
                  <input id="with-claim" v-model="nftOptions.muClaimable" type="checkbox" />
                  <label for="with-claim">Claimable</label>
                </div>
                <template v-if="nftOptions.muClaimable">
                  <div class="pt-2">MU Value</div>
                  <div class="flex flex-col gap-y-1">
                    <div class="flex flex-row">
                      <MumeInput v-model="nftOptions.muClaimPrice" class="flex-1" placeholder="Token Unit"
                        inputClasses="rounded-r-none" :invalid="!isMuPriceValid" />
                      <MumeSelect v-model="nftOptions.muClaimPriceUnit" class="inline-flex" selectClasses="rounded-none">
                        <option value="wei">Wei</option>
                        <option value="gwei">GWei</option>
                        <option value="ether">Ether</option>
                      </MumeSelect>
                      <MumeButton class="rounded-l-none" @click="setAutoMuPrice">Auto</MumeButton>
                    </div>
                    <div v-if="isMuPriceValid">
                      <div class="italic">{{ formatUnits(muClaimWei, "ether") }} MU</div>
                    </div>
                  </div>
                </template>
              </template>
              <div class="pt-2">NFT Validation</div>
              <div>
                <div v-if="isNftOptionsValid" class="flex flex-row gap-x-1 items-center" title="Valid">
                  <Icon name="uil:check" size="1.5em" />
                  <span class="hidden sm:block">Valid</span>
                </div>
                <div v-else class="flex flex-row gap-x-1 items-center" title="Invalid">
                  <Icon name="uil:times" size="1.5em" />
                  <span class="hidden sm:block">Invalid</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="pt-2">Owner</div>
              <div>
                <MumeInput v-model="itemData.owner" type="input" placeholder="Owner" />
              </div>
            </template>
          </template>
          <div class="pt-2">Certificate</div>
          <div class="flex flex-col gap-y-1">
            <div class="flex flex-row gap-x-2 items-center">
              <MumeFileInput accept="application/pdf" :selectedText="selectedCertFileText"
                @change="updateCertificateFile" />
              <MumeButton type="button" title="Reset" class="flex flex-row gap-x-2 items-center">
                <Icon name="uil:redo" />
                <span class="hidden sm:inline">Reset</span>
              </MumeButton>
            </div>
            <div class="text-sm">Limit 20MiB</div>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <MumeButton type="submit" :disabled="!isFormValid" title="Save" class="flex flex-row gap-x-2 items-center">
            <Icon name="uil:save" />
            <span class="hidden sm:inline">Save</span>
          </MumeButton>
        </div>
      </form>
    </div>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="itemLoading || formLoading" :loading-text="loadingText" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";
import { getImagePath } from "~/utils/path";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, parseUnits, formatUnits, toBigInt } from 'ethers'

import { jbcchain, walletConnectId, metadata, getMumeNftAbi } from "~/utils/web3"

definePageMeta({
  middleware: ["auth-user", "auth-dev"],
});

const { id } = useRoute().params;

useHead({
  title: `MUME Art-Toy | Edit Item #${id}`,
});

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [jbcchain],
  projectId: walletConnectId,
});
const itemLoading = ref(true);

const itemData = ref({
  name: "",
  mac: "",
  description: "",
  owner: "",
  categories: [] as string[],
});
const originalCategories: Ref<string[]> = ref([]);
const nftId: Ref<string | undefined> = ref(undefined);
const nftOptions = ref({
  nftDataLoaded: false,
  generated: false,
  price: "0",
  priceUnit: "ether",
  muClaimable: false,
  muClaimPrice: "0",
  muClaimPriceUnit: "ether",
});
const loadingText: Ref<string | undefined> = ref(undefined);
const originalImagePaths: Ref<string[]> = ref([]);
const imagePathDirty: Ref<boolean> = ref(false);
const originalCertPath: Ref<string> = ref("");
const sortedImageLinks: Ref<BrowserUploadFileData[]> = ref([])
const newCertificateFile: Ref<File | undefined> = ref(undefined);
const formLoading = ref(false);

const allCategories = computed(() => {
  const categories: string[] = [];
  for (const oldCatergory of originalCategories.value) {
    if (!itemData.value.categories.includes(oldCatergory)) {
      categories.push(oldCatergory);
    }
  }

  return categories;
})
const isNftOptionsValid = computed(() => {
  const value = nftOptions.value;
  if (alreadyHaveNft.value || !value.generated) {
    return true;
  }

  return isWalletConnected.value && isSelectedChainCorrect.value && isNftPriceValid.value && (!!claimAbi || !value.muClaimable || isMuPriceValid.value);
})


const useDevChain = ref(useRuntimeConfig().public.USE_DEVCHAIN);
const chainVersion = ref(useRuntimeConfig().public.CHAIN_VERSION);
const nftAbi = computed(() => {
  return getMumeNftAbi(useDevChain.value, chainVersion.value);
});
const claimAbi = computed(() => {
  return getClaimMuAbi(useDevChain.value, chainVersion.value);
});

const isWalletConnected = ref(false);
const isSelectedChainCorrect = ref(false);
const isNftPriceValid = computed(() => {
  const value = nftOptions.value;
  try {
    const ethValue = parseUnits(value.price, value.priceUnit);
    return ethValue >= 0;
  } catch (err) {
    return false;
  }
})
const isMuPriceValid = computed(() => {
  const value = nftOptions.value;
  try {
    const ethValue = parseUnits(value.muClaimPrice, value.muClaimPriceUnit);
    return ethValue >= 0;
  } catch (err) {
    return false;
  }
})
const alreadyHaveNft = computed(() => typeof nftId.value === "string")
const isFormValid = computed(() => {
  return itemData.value.name !== "" && isNftOptionsValid.value;
});

const selectedImageFileText = computed(() => {
  const newFileList = sortedImageLinks.value.filter((ele) => ele.file);
  if (newFileList.length > 0) {
    return `Add: ${newFileList.length} File(s)`;
  }
  return imagePathDirty.value ? `Changed` : '';
})

const selectedCertFileText = computed(() => {
  if (newCertificateFile.value) {
    return `Updated: ${newCertificateFile.value.name}`;
  }

  return `Old: ${originalCertPath.value}`;
})

const priceWei = computed(() => {
  const price = nftOptions.value.price;
  const priceUnit = nftOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return weiValues;
})

const muClaimWei = computed(() => {
  const price = nftOptions.value.muClaimPrice;
  const priceUnit = nftOptions.value.muClaimPriceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return weiValues;
})

async function loadItemData() {
  itemLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/artitem/${id}`);

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get Item Data");
    }

    const artItem = (data.value as { artItem: ArtItemResponse }).artItem;
    itemData.value = {
      name: artItem.name,
      mac: artItem.mac,
      description: artItem.description,
      owner: artItem.owner,
      categories: artItem.categories,
    }
    originalCategories.value = artItem.categories.slice();
    originalImagePaths.value = artItem.imagePaths;
    sortedImageLinks.value = artItem.imagePaths.map((ele) => {
      return {
        link: ele,
      };
    })
    originalCertPath.value = artItem.certificatePath;
    nftId.value = artItem.nftId;
    useDevChain.value = artItem.devChain;
    chainVersion.value = artItem.chainVersion;

    console.log("ChainData", useDevChain.value, chainVersion.value)
    console.log("NFT Address", nftAbi.value.address)
    console.log("ClaimMU Address", claimAbi.value?.address)

    if (typeof nftId.value === 'string') {
      await loadNftData();
    }
  } catch (err) {
    console.error(err);

    let message = "Can't Get Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  itemLoading.value = false;
}


async function loadNftData() {
  if (nftOptions.value.nftDataLoaded || !isWalletConnected.value || typeof nftId.value !== 'string') {
    return;
  }

  nftOptions.value.nftDataLoaded = true;
  loadingText.value = "Load NFT Data";

  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = nftAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);

    const price = await MumeArtToyContract.priceOf(nftId.value) as bigint;
    nftOptions.value.price = formatUnits(price, nftOptions.value.priceUnit);


    const abi2 = claimAbi.value;
    if (abi2) {
      const MumeArtToyClaimContract = new Contract(abi2.address, abi2.abi, signer);
      const canClaimMu = await MumeArtToyClaimContract.canClaimMu(nftId.value) as boolean;
      const muGain = await MumeArtToyClaimContract.muGain(nftId.value) as bigint;
      nftOptions.value.muClaimable = canClaimMu;
      nftOptions.value.muClaimPrice = formatUnits(muGain, nftOptions.value.muClaimPriceUnit);
    }
  } catch (err) {
    let message = "Can't Get NFT Data";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
  }
}

function updateImageFiles(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files) {
      for (const file of files) {
        sortedImageLinks.value.push({
          link: URL.createObjectURL(file), file: file,
        })
      }
      imagePathDirty.value = true;
    }
  }
}

function moveImageUp(i: number) {
  if (i > 0 && i < sortedImageLinks.value.length) {
    const prevIndex = i - 1;
    const prevElement = sortedImageLinks.value[prevIndex];
    const targetElement = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(prevIndex, 2, targetElement, prevElement);
    imagePathDirty.value = true;
  }
}

function moveImageDown(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length - 1) {
    const targetElement = sortedImageLinks.value[i];
    const nextElement = sortedImageLinks.value[i + 1];
    sortedImageLinks.value.splice(i, 2, nextElement, targetElement);
    imagePathDirty.value = true;
  }
}

function removeImage(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length) {
    const oldLink = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(i, 1);

    if (oldLink.file) {
      URL.revokeObjectURL(oldLink.link);
    }
    imagePathDirty.value = true;
  }
}

function resetImages() {
  const oldLinks = sortedImageLinks.value.filter((ele) => ele.file);
  sortedImageLinks.value = originalImagePaths.value.map((ele) => {
    return {
      link: ele,
    };
  });
  for (const link of oldLinks) {
    if (link.file) {
      URL.revokeObjectURL(link.link);
    }
  }
  imagePathDirty.value = false;
}

function updateCertificateFile(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files && files[0]) {
      newCertificateFile.value = files[0];
    }
  }
}

function setAutoMuPrice() {
  const wei = priceWei.value;
  const muGain = wei * toBigInt("10");

  nftOptions.value.muClaimPrice = formatUnits(muGain, nftOptions.value.muClaimPriceUnit);
}

async function uploadImage(fileData: BrowserUploadFileData) {
  if (!fileData.file) {
    return fileData.link; // original file
  }

  try {
    const formData = new FormData();
    formData.append("image", fileData.file);

    const { data, error } = await useFetch("/mapi/upload/image", {
      method: "post",
      body: formData,
      key: fileData.link,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get File Path");
    }

    return (data.value as UploadFileResponse).path;

  } catch (err) {
    let message = "Can't Upload Image";
    if (err instanceof Error) {
      message = err.message
    }
    console.error(message || err);
    return null;
  }
}

async function uploadCert(file?: File) {
  if (!file) {
    throw new Error("No File Found");
  }

  try {
    const formData = new FormData();
    formData.append("cert", file);

    const { data, error } = await useFetch("/mapi/upload/cert", {
      method: "post",
      body: formData,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get File Path");
    }

    return (data.value as UploadFileResponse).path;

  } catch (err) {
    let message = "Can't Upload Cert File";
    if (err instanceof Error) {
      message = err.message
    }

    throw new Error(message);
  }
}

async function mintNft(itemId: string) {
  if (alreadyHaveNft.value || !nftOptions.value.generated) {
    return;
  }

  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const abi = nftAbi.value;
  const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);

  const txSent = await MumeArtToyContract.mint(
    web3Modal.getAddress(),
    parseUnits(nftOptions.value.price, nftOptions.value.priceUnit),
    itemId
  );
  const receipt = await txSent.wait();
  const log = (receipt.logs as EthTxReciptLogResonse[]).find((ele) => ele.fragment.name === "MetadataUpdate");

  if (log) {
    return log.args[0] as (bigint | undefined);
  }
  return undefined;
}

async function setMuClaim(nftId: bigint) {
  const abi = claimAbi.value;

  if (!abi) {
    return;
  }

  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const ClaimMuFromMumeNftContract = new Contract(abi.address, abi.abi, signer);

  if (nftOptions.value.generated && nftOptions.value.muClaimable) {
    const txSent = await ClaimMuFromMumeNftContract.setNftClaimMuPromotion(
      nftId,
      parseUnits(nftOptions.value.muClaimPrice, nftOptions.value.muClaimPriceUnit),
    );

    await txSent.wait();
  } else if (!nftOptions.value.generated) {
    if (!nftOptions.value.muClaimable) {
      const txSent = await ClaimMuFromMumeNftContract.setNftCanClaimMu(
        nftId,
        false,
      );

      await txSent.wait();
    } else {
      const txSent = await ClaimMuFromMumeNftContract.setNftClaimMuPromotion(
        nftId,
        parseUnits(nftOptions.value.muClaimPrice, nftOptions.value.muClaimPriceUnit),
      );

      await txSent.wait();
    }
  }

}

async function editItem() {
  if (!isFormValid.value || formLoading.value) {
    return;
  }

  try {
    loadingText.value = "Upload Images";
    formLoading.value = true;
    const imgPaths = await Promise.all(sortedImageLinks.value.map(uploadImage));

    let certPath = originalCertPath.value;
    if (newCertificateFile.value) {
      loadingText.value = "Upload Cert";
      certPath = await uploadCert(newCertificateFile.value);
    }

    let newNftId: bigint | undefined;
    if (!alreadyHaveNft.value && nftOptions.value.generated) {
      loadingText.value = "Mining NFT";
      newNftId = await mintNft(id.toString());
    }

    if (nftId.value || typeof newNftId !== "undefined") {
      loadingText.value = "Set Mu Claim";
      if (nftId.value) {
        await setMuClaim(toBigInt(nftId.value));
      } else {
        await setMuClaim(newNftId as bigint);
      }
    }


    const bodyData = {
      name: itemData.value.name,
      mac: itemData.value.mac,
      description: itemData.value.description,
      owner: itemData.value.owner,
      categories: itemData.value.categories,
      imagePaths: imgPaths,
      certificatePath: certPath,
      nftId: typeof newNftId !== "undefined" ? newNftId.toString() : undefined,
      devChain: typeof newNftId !== "undefined" ? useDevChain.value : undefined,
      chainVersion: typeof newNftId !== "undefined" ? chainVersion.value : undefined,
    }

    loadingText.value = "Update Item Data";
    const { data, error } = await useFetch(`/mapi/artitem/edit/${id}`, {
      method: "post",
      body: bodyData,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    useToast().success("Edit Item Successful!", {
      timeout: 5000
    });

    navigateTo(`/art/${id}`);
  } catch (err) {
    console.error(err);

    let message = "Can't Edit Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });

    formLoading.value = false;
  }
}

let timerId: NodeJS.Timeout | undefined;
onMounted(() => {
  timerId = setInterval(() => {
    isWalletConnected.value = !!(web3Modal.getIsConnected() && web3Modal.getWalletProvider());
    isSelectedChainCorrect.value = web3Modal.getChainId() === jbcchain.chainId;

    if (isWalletConnected.value && !
      nftOptions.value.nftDataLoaded) {
      loadNftData();
    }
  }, 200);
})

onBeforeUnmount(() => {
  clearInterval(timerId);
});


loadItemData();
</script>

<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: max-content auto;
}

:deep(*) {
  --vs-controls-color: theme("borderColor.white");
  --vs-border-color: theme("borderColor.gray.400");
  --vs-search-input-bg: theme("backgroundColor.slate.600");
  --vs-dropdown-bg: theme("backgroundColor.slate.600");
  --vs-dropdown-option-color: theme("textColor.white");

  --vs-selected-bg: theme("backgroundColor.slate.600");
  --vs-selected-color: theme("textColor.white");
  --vs-selected-border-color: theme("borderColor.gray.400");


  --vs-dropdown-option--active-bg: theme("backgroundColor.slate.500");

}

:deep(.vs__dropdown-toggle) {
  @apply transition duration-200;
}

:deep(.vs__dropdown-toggle:hover) {
  @apply border-white;
}
</style>~/utils/web3