<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <div class="flex-1 flex flex-col overflow-y-auto">
      <form class="w-full p-4 flex flex-col justify-center items-center gap-y-2" @submit.prevent="addItem">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          New Item
        </h3>
        <div class="custom-grid gap-x-2 gap-y-2 w-full max-w-5xl">
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
            <v-select v-model="itemData.categories" class="bg-slate-600" multiple taggable></v-select>
          </div>
          <div class="pt-2">Preview Images</div>
          <div class="flex flex-col gap-y-1">
            <MumeFileInput accept="image/*" multiple :selectedText="selectedImageFileText" @change="updateImageFiles" />
            <div class="text-sm">Limit 2MiB/each</div>
          </div>
          <div></div>
          <div class="flex flex-col gap-y-2">
            <div v-for="(link, i) of sortedImageLinks"
              class="flex flex-row items-center gap-x-2 border-b border-gray-400 last:border-0 hover:bg-white/10">
              <div class="flex flex-col gap-y-1">
                <div v-if="false" class="cursor-pointer" title="To Top">
                  <Icon name="uil:angle-double-up" size="2em"
                    class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Up" @click="moveImageUp(i)">
                  <Icon name="uil:angle-up" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Down" @click="moveImageDown(i)">
                  <Icon name="uil:angle-down" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div v-if="false" class="cursor-pointer" title="To Bottom">
                  <Icon name="uil:angle-double-down" size="2em"
                    class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
              </div>
              <div class="flex-1 flex flex-row">
                <img :src="link.link" class="mx-auto h-20 border border-gray-400 rounded" loading="lazy" />
              </div>
              <div class="cursor-pointer" title="Remove" @click="removeImage(i)">
                <Icon name="uil:trash-alt" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
              </div>
            </div>
          </div>
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
          <template v-else="!nftOptions.generated">
            <div class="pt-2">Owner</div>
            <div>
              <MumeInput v-model="itemData.owner" type="input" placeholder="Owner" />
            </div>
          </template>
          <div class="pt-2">Certificate</div>
          <div class="flex flex-col gap-y-1">
            <MumeFileInput accept="application/pdf" :selectedText="selectedCertFileText"
              @change="updateCertificateFile" />
            <div class="text-sm">Limit 20MiB</div>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <MumeButton type="submit" :disabled="!isFormValid || formLoading" title="Save"
            class="flex flex-row gap-x-2 items-center">
            <Icon name="uil:save" />
            <span class="hidden sm:inline">Save</span>
          </MumeButton>
        </div>
      </form>
    </div>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="formLoading" :loadingText="loadingText" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers'

import { jbcchain, walletConnectId, metadata, getChainAbi } from "~/utils/eth"

useHead({
  title: `MUME Art-Toy | Add Item`,
});

definePageMeta({
  middleware: ["auth-user", "auth-dev"],
});

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [jbcchain],
  projectId: walletConnectId,
});
const itemData = ref({
  name: "",
  mac: "",
  description: "",
  owner: "",
  categories: [] as string[],
})
const nftOptions = ref({
  generated: false,
  price: "0",
  priceUnit: "ether",
});
const sortedImageLinks: Ref<BrowserUploadFileData[]> = ref([])
const certificateFile: Ref<File | undefined> = ref(undefined);
const loadingText: Ref<string | undefined> = ref(undefined);
const isNftOptionsValid = computed(() => {
  const value = nftOptions.value;
  if (!value.generated) {
    return true;
  }

  return isWalletConnected.value && isSelectedChainCorrect.value && isNftPriceValid.value;
})
const useDevChain = computed(() => useRuntimeConfig().public.USE_DEVCHAIN);
const chainVersion = computed(() => useRuntimeConfig().public.CHAIN_VERSION);
const chainAbi = computed(() => {
  return getChainAbi(useDevChain.value, chainVersion.value);
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
const isFormValid = computed(() => {
  return itemData.value.name !== "" && !!certificateFile.value && isNftOptionsValid.value
});
const formLoading = ref(false);
const selectedImageFileText = computed(() => {
  return sortedImageLinks.value.length > 0 ? `Selected ${sortedImageLinks.value.length} File(s)` : ''
})
const selectedCertFileText = computed(() => {
  return certificateFile.value ? certificateFile.value.name : 'No File Selected'
})
const totalEthPrice = computed(() => {
  const price = nftOptions.value.price;
  const priceUnit = nftOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return formatUnits(weiValues, "ether");
})

function updateImageFiles(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files) {
      for (const file of files) {
        sortedImageLinks.value.push({
          link: URL.createObjectURL(file), file: file,
        })
      }
    }
  }
}

function moveImageUp(i: number) {
  if (i > 0 && i < sortedImageLinks.value.length) {
    const prevIndex = i - 1;
    const prevElement = sortedImageLinks.value[prevIndex];
    const targetElement = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(prevIndex, 2, targetElement, prevElement);
  }
}

function moveImageDown(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length - 1) {
    const targetElement = sortedImageLinks.value[i];
    const nextElement = sortedImageLinks.value[i + 1];
    sortedImageLinks.value.splice(i, 2, nextElement, targetElement);
  }
}

function removeImage(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length) {
    const oldLink = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(i, 1);

    URL.revokeObjectURL(oldLink.link);
  }
}

function updateCertificateFile(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files && files[0]) {
      certificateFile.value = files[0];
    }
  }
}

async function uploadImage(fileData: BrowserUploadFileData) {
  if (!fileData.file) {
    return fileData.link;
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

async function addItemFetch(imgPaths: (string | null)[], certPath: string) {
  const bodyData = {
    name: itemData.value.name,
    mac: itemData.value.mac,
    description: itemData.value.description,
    owner: itemData.value.owner,
    categories: itemData.value.categories,
    imagePaths: imgPaths,
    certificatePath: certPath,
  }

  const { data, error } = await useFetch("/mapi/artitem/add", {
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

  if (!data.value) {
    throw new Error("Can't Get New Item Data");
  }

  const id = (data.value as { artItem: ArtItemResponse }).artItem.itemId;
  return id;
}

async function updateItemNft(id: string, nftId: bigint) {
  const bodyData = {
    nftId: nftId.toString(),
    devChain: useDevChain.value,
    chainVersion: chainVersion.value,
  }

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

  if (!data.value) {
    throw new Error("Can't Get Updated Item Data");
  }
}

async function mintNft(itemId: string) {
  if (!nftOptions.value.generated) {
    return;
  }

  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const abi = chainAbi.value;
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

async function addItem() {
  if (!isFormValid.value || formLoading.value) {
    return;
  }

  try {
    loadingText.value = "Upload Images";
    formLoading.value = true;
    const imgPaths = await Promise.all(sortedImageLinks.value.map(uploadImage));
    loadingText.value = "Upload Cert";
    const certPath = await uploadCert(certificateFile.value);
    loadingText.value = "Create Item";
    const id = await addItemFetch(imgPaths, certPath);
    loadingText.value = "Mining NFT";
    const nftId = await mintNft(id);
    if (typeof nftId !== "undefined") {
      loadingText.value = "Update Item Data";
      await updateItemNft(id, nftId);
    }

    useToast().success("Add Item Successful!", {
      timeout: 5000
    });

    navigateTo(`/art/${id}`);
  } catch (err) {
    console.error(err);

    let message = "Can't Add Item Data";
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
  }, 200);
})

onBeforeUnmount(() => {
  clearInterval(timerId);
});

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
</style>
