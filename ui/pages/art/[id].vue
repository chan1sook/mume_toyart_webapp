<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <MumeSearchTopBar v-model="searchKeyword" @search="quickSearchItems" />
    <div v-if="itemData" class="flex-1 flex flex-col overflow-y-auto">
      <div class="m-auto w-full p-4 flex flex-col justify-center items-center gap-y-2">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          Art #{{ id }}
        </h3>
        <template v-if="typeof selectedImgIndex === 'number'">
          <div class="flex flex-row gap-x-2 items-center">
            <div class="cursor-pointer" title="Prev Image" @click="selectImageIndex(selectedImgIndex - 1)">
              <Icon name="uil:angle-left-b" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
            </div>
            <div class=" flex-1 text-center">
              <img :src="getImagePath(itemData.imagePaths[selectedImgIndex])"
                class="border border-gray-400 rounded h-[250px]" />
            </div>
            <div class="cursor-pointer" title="Next Image" @click="selectImageIndex(selectedImgIndex + 1)">
              <Icon name="uil:angle-right-b" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
            </div>
          </div>
          <div class="flex flex-row overflow-x-auto w-full max-w-xl py-3">
            <div class="m-auto flex flex-row gap-x-2">
              <img v-for="(path, i) of itemData.imagePaths" :src="getImagePath(path)"
                class="h-20 border border-gray-400 rounded cursor-pointer" @click="selectImageIndex(i)" />
            </div>
          </div>
        </template>
        <div class="w-full max-w-5xl">
          <div class="flex flex-row justify-start overflow-x-auto">
            <div class="inline-flex flex-row items-center">
              <div v-for="tab of tabs"
                class="transistion duration-200 px-2 py-1 border border-gray-400 rounded-t-md cursor-pointer"
                :class="[currentTab === tab.id ? 'bg-slate-400/50' : '']" @click="currentTab = tab.id">
                {{ tab.label }}
              </div>
            </div>
          </div>
          <div v-if="currentTab === 'info'"
            class="border border-gray-400 rounded-b-md px-2 py-2 custom-grid gap-x-2 gap-y-1">
            <div class="font-bold">Name</div>
            <div>{{ itemData.name }}</div>
            <div class="font-bold">MAC</div>
            <div>{{ itemData.mac || '-' }}</div>
            <div class="font-bold">Description</div>
            <div>{{ itemData.description }}</div>
            <div class="font-bold">Created at</div>
            <div>{{ formatDate(itemData.createdAt) }}</div>
            <div class="font-bold">Last Updated</div>
            <div>{{ formatDate(itemData.updatedAt) }}</div>
            <template v-if="typeof itemData.nftId !== 'string'">
              <div class="font-bold">Owner</div>
              <div>{{ itemData.owner || '-' }}</div>
            </template>
            <div class="font-bold">Certificate</div>
            <div>
              <a :href="getCertPath(itemData.certificatePath)"
                class="inline-flex flex-row gap-x-1 items-center focus:underline hover:underline" download>
                <Icon name="bi:filetype-pdf" />
                <span>PDF</span>
              </a>
            </div>
            <div class="font-bold">History</div>
            <div class="flex flex-col gap-y-1">
              <div v-if="historyShow" class="custom-grid gap-x-2 gap-y-1 w-full">
                <template v-for="history of historyList">
                  <div>{{ formatDate(history.createdAt) }}</div>
                  <div>{{ historyActionPretty(history.action) }}</div>
                </template>
              </div>
              <div>
                <span v-if="historyLoading">
                  <Icon name="uil:spinner-alt" class="animate-spin" /> Loading
                </span>
                <span v-else-if="!historyShow" class="cursor-pointer focus:underline hover:underline"
                  @click="loadHistory">
                  View
                </span>
                <span v-else class="cursor-pointer focus:underline hover:underline" @click="historyShow = false">
                  Hide
                </span>
              </div>
            </div>
          </div>
          <div v-if="currentTab === 'nft'"
            class="border border-gray-400 rounded-b-md px-2 py-2 custom-grid gap-x-2 gap-y-1">
            <template v-if="typeof itemData.nftId === 'string'">
              <div class="pt-2">Wallet</div>
              <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center">
                <ClientOnly>
                  <w3m-button class="inline-block" />
                </ClientOnly>
                <span v-if="!useRealChain" class="text-red-200 capitalize">Dev Chain: For Testing Only</span>
              </div>
              <template v-if="nftData">
                <div class="pt-2">Owner</div>
                <div>
                  <div class="flex flex-row">
                    <MumeInput :model-value="nftData.owner" class="flex-1" readonly inputClasses="rounded-r-none" />
                    <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1 rounded-l-none"
                      title="Copy Address" @click="copyText(nftData.owner)">
                      <Icon name="uil:copy" />
                      <span class="hidden sm:block">Copy</span>
                    </MumeButton>
                  </div>
                </div>
                <div class="pt-2">
                  Price
                </div>
                <div class="flex flex-col gap-y-1">
                  <template v-if="!nftOptions.edited">
                    <div class="flex flex-row">
                      <MumeInput :model-value="formatUnits(nftData.price, nftOptions.priceUnit)" class="flex-1" readonly
                        inputClasses="rounded-r-none" />
                      <MumeSelect v-model="nftOptions.priceUnit" class="inline-flex" selectClasses="rounded-l-none">
                        <option value="wei">Wei</option>
                        <option value="gwei">GWei</option>
                        <option value="ether">Ether</option>
                      </MumeSelect>
                    </div>
                    <div>
                      <div class="italic">{{ totalEthPrice }} JBC</div>
                    </div>
                    <div v-if="isNftOwned" class="flex flex-row justify-end">
                      <MumeButton type="button" class="flex flex-row gap-x-2 items-center" title="Adjust Price"
                        @click="startEditPrice">
                        <span class="hidden sm:block">Edit</span>
                        <Icon name="uil:pen" />
                      </MumeButton>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex flex-row">
                      <MumeInput v-if="nftOptions.edited" v-model="nftOptions.price" class="flex-1"
                        inputClasses="rounded-r-none" />
                      <MumeSelect v-model="nftOptions.priceUnit" class="inline-flex" selectClasses="rounded-l-none">
                        <option value="wei">Wei</option>
                        <option value="gwei">GWei</option>
                        <option value="ether">Ether</option>
                      </MumeSelect>
                    </div>
                    <div>
                      <div class="italic">{{ totalEthEditPrice }} JBC</div>
                    </div>
                    <div class="flex flex-row gap-x-2 items-center justify-end">
                      <MumeButton type="button" class="flex flex-row gap-x-2 items-center" title="Cancel Update"
                        @click="cancelEditPrice">
                        <span class="hidden sm:block">Cancel</span>
                        <Icon name="material-symbols:undo" />
                      </MumeButton>
                      <MumeButton type="button" class="flex flex-row gap-x-2 items-center" title="Update Price"
                        @click="updatePrice">
                        <span class="hidden sm:block">Update</span>
                        <Icon name="uil:save" />
                      </MumeButton>
                    </div>
                  </template>
                </div>
                <div class="pt-2">Tradable</div>
                <div>
                  <div class="flex flex-row gap-x-2">
                    <div v-if="nftData.tradable" class="flex flex-row gap-x-1 items-center" title="Tradeable">
                      <Icon name="uil:check" size="2em" />
                      <span class="hidden sm:block">Tradeable</span>
                    </div>
                    <div v-else class="flex flex-row gap-x-1 items-center" title="Not Tradeable">
                      <Icon name="uil:times" size="2em" />
                      <span class="hidden sm:block">Not Tradeable</span>
                    </div>
                    <MumeButton v-if="isNftOwned" type="button" class="ml-auto" title="Toggle Tradeable"
                      @click="toggleTradeableFlag">
                      Toggle
                    </MumeButton>
                  </div>
                </div>
                <template v-if="nftData.tradable">
                  <div v-if="!isNftOwned" class="col-span-2">
                    <MumeButton type="button" title="Buy NFT" @click="buyNft">
                      Buy NFT
                    </MumeButton>
                  </div>
                  <template v-else>
                    <div class="pt-2">Transfer To</div>
                    <div>
                      <div class="flex flex-row">
                        <MumeInput v-model="nftOptions.targetAddress" type="text" class="flex-1"
                          inputClasses="rounded-r-none" :invalid="!isTargetEthAddress" />
                        <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1 rounded-l-none"
                          title="Transfer NFT" @click="transferToken">
                          <Icon name="bi:send" />
                          <span class="hidden sm:block">Send</span>
                        </MumeButton>
                      </div>
                    </div>
                  </template>
                </template>
              </template>
            </template>
            <template v-else>
              <div>NFT</div>
              <div class="text-center text-2xl italic">This item isn't NFT</div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <MumeFixedBar hide-additem>
      <NuxtLink v-if="isDevUser" :href="`/admin/edit-item/${id}`" title="Edit This Item"
        class="transition duration-200 px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:pen" />
        <span class="hidden sm:inline">Edit This Item</span>
      </NuxtLink>
    </MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="itemLoading || searchLoading || nftLoading" :loading-text="loadingText" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { isAddress } from "web3-validator"
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers'
import { useToast } from "vue-toastification";

import { jbcchain, walletConnectId, metadata, getChainAbi } from "~/utils/eth"
import { getImagePath, getCertPath } from "~/utils/path";
import { historyActionPretty } from "~/utils/history";

const { id } = useRoute().params;
useHead({
  title: `MUME Art-Toy | Art #${id}`,
});

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [jbcchain],
  projectId: walletConnectId,
});
const sessionData = useSessionData();
const loadingText: Ref<string | undefined> = ref(undefined);
const searchKeyword = ref("");
const searchLoading = ref(false);
const itemLoading = ref(true);
const nftLoading = ref(false);
const itemData: Ref<ArtItemResponse | undefined> = ref(undefined);
const historyList: Ref<ArtHistoryResponse[]> = ref([]);
const nftData: Ref<NftInfomation | undefined> = ref(undefined);
const nftOptions = ref({
  edited: false,
  price: "",
  priceUnit: "wei",
  targetAddress: "",
});
const historyLoading = ref(false);
const historyShow = ref(false);
const selectedImgIndex: Ref<number | undefined> = ref(undefined);
const tabs = ref([{
  label: "Info",
  id: 'info',
},
{
  label: "NFT",
  id: 'nft',
}]);
const currentTab = ref(tabs.value[0].id);

const isDevUser = computed(() => isDeveloperUser(sessionData.value));
const useRealChain = computed(() => useRuntimeConfig().USE_REALCHAIN);
const chainAbi = computed(() => getChainAbi(useRealChain.value));
const isWalletConnected = ref(false);
const isNftOwned = computed(() => web3Modal.getAddress()?.toLowerCase() === nftData.value?.owner.toLowerCase());
const isTargetEthAddress = computed(() => isAddress(nftOptions.value.targetAddress))
watch(isWalletConnected, (value) => {
  if (value && !nftData.value) {
    loadNftData();
  }
});


const totalEthPrice = computed(() => {
  if (!nftData.value) {
    return ""
  }
  return formatUnits(nftData.value.price, "ether");
})
const totalEthEditPrice = computed(() => {
  const price = nftOptions.value.price;
  const priceUnit = nftOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return formatUnits(weiValues, "ether");
})

async function quickSearchItems(keyword: string) {
  if (!keyword) {
    return;
  }

  loadingText.value = undefined;
  searchLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/artitem/${keyword}`);

    if (error.value || !data.value) {
      navigateTo(`/search?keyword=${keyword}`)
    } else {
      navigateTo(`/art/${keyword}`);
    }
  } catch (err) {
    console.error(err);

    let message = "Can't Search Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }
}

function selectImageIndex(index: number) {
  if (!itemData.value || index < 0 || index >= itemData.value.imagePaths.length) {
    return;
  }

  selectedImgIndex.value = index;
}

function formatDate(date: string) {
  return dayjs(date).format("DD/MM/YYYY HH:mm:ss")
}

async function loadItemData() {
  loadingText.value = "Load Item";
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

    itemData.value = (data.value as { artItem: ArtItemResponse }).artItem;
    if (itemData.value.imagePaths.length > 0) {
      selectedImgIndex.value = 0;
    }
  } catch (err) {
    console.error(err);

    let message = "Can't Get Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  if (typeof itemData.value?.nftId === 'string') {
    loadNftData();
  }

  itemLoading.value = false;
}

async function copyText(text: string, extra?: string) {
  if (!navigator.clipboard) {
    return;
  }

  await navigator.clipboard.writeText(text);
  let message = "Copied";
  if (extra) {
    message = extra + ": " + message;
  }
  useToast().success(message, {
    timeout: 5000
  });
}

function startEditPrice() {
  if (!nftData.value) {
    return;
  }

  nftOptions.value.price = formatUnits(nftData.value.price, nftOptions.value.priceUnit);
  nftOptions.value.edited = true;
}

function cancelEditPrice() {
  nftOptions.value.edited = false;
}

async function loadHistory() {
  if (historyLoading.value) {
    return;
  }

  historyLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/arthistory/${id}`);

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get Item History");
    }

    historyList.value = (data.value as { history: ArtHistoryResponse[] }).history;
    historyShow.value = true;
  } catch (err) {
    console.error(err);

    let message = "Can't Get Item History";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  historyLoading.value = false;
}

async function loadNftData() {
  if (!isWalletConnected.value || typeof itemData.value?.nftId !== 'string' || nftLoading.value) {
    return;
  }

  loadingText.value = "Load NFT Data";
  nftLoading.value = true;

  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = chainAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const response = await MumeArtToyContract.nftInfomationOf(itemData?.value?.nftId) as [string, boolean, bigint, string];

    nftData.value = {
      owner: response[0],
      tradable: response[1],
      price: response[2],
      uri: response[3],
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

  nftLoading.value = false;
}

async function buyNft() {
  if (!isWalletConnected.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
    return;
  }

  loadingText.value = "Send Transaction";
  nftLoading.value = true;
  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = chainAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.buyNft(
      nftData.value.owner, itemData.value.nftId
    );
    await tx.wait();

  } catch (err) {
    let message = "Can't Buy NFT";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
  }

  nftLoading.value = false;
  useToast().success("NFT Purchased!", {
    timeout: 5000
  });
  loadNftData();
}

async function transferToken() {
  if (!isWalletConnected.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
    return;
  }

  loadingText.value = "Send Transaction";
  nftLoading.value = true;

  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = chainAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.safeTransferFrom(
      nftData.value.owner, nftOptions.value.targetAddress, itemData.value.nftId
    );
    await tx.wait();

    nftOptions.value.targetAddress = "";
  } catch (err) {
    let message = "Can't Transfer NFT";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
  }

  nftLoading.value = false;
  useToast().success("NFT Transfered", {
    timeout: 5000
  });
  loadNftData();
}

async function toggleTradeableFlag() {
  if (!isWalletConnected.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
    return;
  }

  const nextTradableFlag = !nftData.value.tradable;
  loadingText.value = "Send Transaction";
  nftLoading.value = true;

  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = chainAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.setTradeable(
      itemData.value.nftId, nextTradableFlag
    );
    await tx.wait();
  } catch (err) {
    let message = "Can't Set Tradable Flag";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
  }

  nftLoading.value = false;
  useToast().success("NFT Updated", {
    timeout: 5000
  });
  loadNftData();
}

async function updatePrice() {
  if (!isWalletConnected.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
    return;
  }

  loadingText.value = "Send Transaction";
  nftLoading.value = true;

  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = chainAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.setPrice(
      itemData.value.nftId, parseUnits(nftOptions.value.price, nftOptions.value.priceUnit),
    );
    await tx.wait();

    cancelEditPrice();
  } catch (err) {
    let message = "Can't Set Price";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
  }

  nftLoading.value = false;
  useToast().success("NFT Updated", {
    timeout: 5000
  });
  loadNftData();
}

let timerId: NodeJS.Timeout | undefined;
onMounted(() => {
  timerId = setInterval(() => {
    isWalletConnected.value = !!(web3Modal.getIsConnected() && web3Modal.getWalletProvider());
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
</style>

