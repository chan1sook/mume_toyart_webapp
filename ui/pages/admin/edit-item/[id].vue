<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
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
            <MumeTextArea v-model="itemData.name" type="input" placeholder="Description" required />
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
                  class="mx-auto h-20 border border-gray-400 rounded" />
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
          </template>
          <template v-else>
            <div class="pt-2">NFT</div>
            <div class="flex flex-row flex-wrap items-center gap-x-2">
              <input id="with-nft" v-model="nftOptions.generated" type="checkbox" />
              <label for="with-nft">Create Nft</label>
            </div>
            <template v-if="nftOptions.generated">
              <div class="pt-2">Wallet</div>
              <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center">
                <ClientOnly>
                  <w3m-button class="inline-block" />
                </ClientOnly>
                <span v-if="!useRealChain" class="text-red-200 capitalize">Dev Chain: For Testing Only</span>
              </div>
              <div class="pt-2">Price</div>
              <div class="flex flex-col gap-y-1">
                <div class="flex flex-row">
                  <MumeInput v-model="nftOptions.price" type="number" min="0" step="1" class="flex-1"
                    placeholder="Token Unit" inputClasses="rounded-r-none" :invalid="!isNftPriceValid" />
                  <MumeSelect v-model="nftOptions.priceUnit" class="inline-flex" selectClasses="rounded-l-none">
                    <option value="wei">Wei</option>
                    <option value="gwei">GWei</option>
                    <option value="ether">Ether</option>
                  </MumeSelect>
                </div>
                <div v-if="isNftPriceValid">
                  <div class="italic">{{ totalEthPrice }} JBC</div>
                </div>
              </div>
              <div class="pt-2">Nft Validation</div>
              <div>
                <div v-if="isNftOptionsValid" class="flex flex-row gap-x-1 items-center" title="Valid">
                  <Icon name="uil:check" size="2em" />
                  <span class="hidden sm:block">Valid</span>
                </div>
                <div v-else class="flex flex-row gap-x-1 items-center" title="Invalid">
                  <Icon name="uil:times" size="2em" />
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
    <Transition name="fade">
      <MumeLoadingModal v-if="itemLoading || formLoading" :loading-text="loadingText" />
    </Transition>
  </MumeContainer>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";
import { getImagePath } from "~/utils/path";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers'

import { jbcchain, walletConnectId, metadata, getChainAbi } from "~/utils/eth"

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
});
const nftId: Ref<string | undefined> = ref(undefined);
const nftOptions = ref({
  generated: false,
  price: "0",
  priceUnit: "wei",
});
const loadingText: Ref<string | undefined> = ref(undefined);
const originalImagePaths: Ref<string[]> = ref([]);
const imagePathDirty: Ref<boolean> = ref(false);
const originalCertPath: Ref<string> = ref("");
const sortedImageLinks: Ref<BrowserUploadFileData[]> = ref([])
const newCertificateFile: Ref<File | undefined> = ref(undefined);
const formLoading = ref(false);

const isNftOptionsValid = computed(() => {
  const value = nftOptions.value;
  if (alreadyHaveNft.value || !value.generated) {
    return true;
  }

  return isWalletConnected.value && isNftPriceValid.value;
})
const useRealChain = computed(() => useRuntimeConfig().USE_REALCHAIN);
const chainAbi = computed(() => getChainAbi(useRealChain.value));
const isWalletConnected = computed(() => !!(web3Modal.getIsConnected() && web3Modal.getWalletProvider()));
const isNftPriceValid = computed(() => {
  const value = nftOptions.value;
  try {
    const ethValue = parseUnits(value.price, value.priceUnit);
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

const totalEthPrice = computed(() => {
  const price = nftOptions.value.price;
  const priceUnit = nftOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return formatUnits(weiValues, "ether");
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
    }
    originalImagePaths.value = artItem.imagePaths;
    sortedImageLinks.value = artItem.imagePaths.map((ele) => {
      return {
        link: ele,
      };
    })
    originalCertPath.value = artItem.certificatePath;
    nftId.value = artItem.nftId;
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

  const abi = chainAbi.value;
  const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
  const location = window.location;
  let artUri = `${location.protocol}://${window.location.host}/mapi/artmetadata/${itemId}`;
  console.log("artUri", artUri);


  const txSent = await MumeArtToyContract.mint(
    web3Modal.getAddress(),
    parseUnits(nftOptions.value.price, nftOptions.value.priceUnit),
    artUri
  );
  const receipt = await txSent.wait();
  const log = (receipt.logs as EthTxReciptLogResonse[]).find((ele) => ele.fragment.name === "MetadataUpdate");

  if (log) {
    console.log(log.args[0]);
    return log.args[0] as (bigint | undefined);
  }
  return undefined;
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

    let nftId: bigint | undefined;
    if (!alreadyHaveNft.value && nftOptions.value.generated) {
      loadingText.value = "Mining NFT";
      nftId = await mintNft(id.toString());
    }


    const bodyData = {
      name: itemData.value.name,
      mac: itemData.value.mac,
      description: itemData.value.description,
      owner: itemData.value.owner,
      imagePaths: imgPaths,
      certificatePath: certPath,
      nftId: typeof nftId !== "undefined" ? nftId.toString() : undefined
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

loadItemData();
</script>

<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>
