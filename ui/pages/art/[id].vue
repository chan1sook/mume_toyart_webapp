<template>
  <MumeContainer class="flex flex-col ">
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
                class="border border-gray-400 rounded h-[250px]" loading="lazy" />
            </div>
            <div class="cursor-pointer" title="Next Image" @click="selectImageIndex(selectedImgIndex + 1)">
              <Icon name="uil:angle-right-b" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
            </div>
          </div>
          <div class="flex flex-row overflow-x-auto w-full max-w-xl py-3">
            <div class="m-auto flex flex-row gap-x-2">
              <img v-for="(path, i) of itemData.imagePaths" :src="getImagePath(path)"
                class="h-20 border border-gray-400 rounded cursor-pointer" loading="lazy" @click="selectImageIndex(i)" />
            </div>
          </div>
        </template>
        <div class="w-full max-w-5xl">
          <div class="flex flex-row justify-start overflow-x-auto">
            <div class="inline-flex flex-row items-center">
              <div v-for="tab of avaliableTabs"
                class="transistion duration-200 px-2 py-1 border border-gray-400 rounded-t-md cursor-pointer"
                :class="[currentTab === tab.id ? 'bg-slate-400/50' : '']" @click="currentTab = tab.id">
                {{ tab.label }}
              </div>
            </div>
          </div>
          <div v-if="currentTab === 'info'"
            class="border border-gray-400 rounded-b-md px-2 py-2 custom-grid gap-x-2 gap-y-1 overflow-x-auto">
            <div class="font-bold">Name</div>
            <div>{{ itemData.name }}</div>
            <div class="font-bold">MAC</div>
            <div>{{ itemData.mac || '-' }}</div>
            <div class="font-bold">Description</div>
            <div>{{ itemData.description }}</div>
            <div class="font-bold">Categories</div>
            <div class="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
              <NuxtLink v-for="category of itemData.categories" :href="`/products/category/${category}`"
                class="underline">
                {{ category }}
              </NuxtLink>
              <template v-if="itemData.categories.length <= 0">
                <NuxtLink href="/products/uncategorized" class="italic underline">
                  Uncategorized
                </NuxtLink>
              </template>
            </div>
            <div class="font-bold">Created at</div>
            <div>{{ formatDate(itemData.createdAt) }}</div>
            <div class="font-bold">Last Updated</div>
            <div>{{ formatDate(itemData.updatedAt) }}</div>
            <template v-if="typeof itemData.nftId !== 'string'">
              <div class="font-bold">Owner</div>
              <div>{{ itemData.owner || '-' }}</div>
            </template>
            <template v-else>
              <div class="font-bold">Blockscan</div>
              <div>
                <NuxtLink :href="formatBlockscanLink(itemData.nftId)" external class="underline mr-2">
                  {{ formatBlockscanLink(itemData.nftId) }}
                </NuxtLink>
                <span title="Copy Link">
                  <Icon name="uil:copy" class="cursor-pointer" @click="copyText(formatBlockscanLink(itemData.nftId))" />

                </span>
              </div>
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
          <div v-if="currentTab === 'nft' && typeof itemData.nftId === 'string'"
            class="border border-gray-400 rounded-b-md px-2 py-2 custom-grid gap-x-2 gap-y-1 overflow-x-auto">
            <template v-if="nftNotFound">
              <div class="col-span-2 text-center text-2xl italic">NFT not exists</div>
            </template>
            <template v-else>
              <div>Blockscan</div>
              <div>
                <NuxtLink :href="formatBlockscanLink(itemData.nftId)" external class="underline mr-2">
                  {{ formatBlockscanLink(itemData.nftId) }}
                </NuxtLink>
                <span title="Copy Link">
                  <Icon name="uil:copy" class="cursor-pointer" @click="copyText(formatBlockscanLink(itemData.nftId))" />

                </span>
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
            </template>
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
                    <div class="italic">{{ formatUnits(priceWei, "ether") }} JBC</div>
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
                    <div class="italic">{{ formatUnits(newPriceWei, 'ether') }} JBC</div>
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
              <div :class="[isNftOwned ? 'pt-2' : '']">Tradable</div>
              <div>
                <div class="flex flex-row gap-x-2">
                  <div v-if="nftData.tradable" class="flex flex-row gap-x-1 items-center" title="Tradeable">
                    <Icon name="uil:check" size="1.5em" />
                    <span class="hidden sm:block">Tradeable</span>
                  </div>
                  <div v-else class="flex flex-row gap-x-1 items-center" title="Not Tradeable">
                    <Icon name="uil:times" size="1.5em" />
                    <span class="hidden sm:block">Not Tradeable</span>
                  </div>
                  <MumeButton v-if="isNftOwned" type="button" class="ml-auto" title="Toggle Tradeable"
                    @click="toggleTradeableFlag">
                    Toggle
                  </MumeButton>
                </div>
              </div>
              <template v-if="contractCodeSignature > 1">
                <div :class="[isNftOwned ? 'pt-2' : '']">Sellable</div>
                <div>
                  <div class="flex flex-row gap-x-2">
                    <div v-if="nftData.sellable" class="flex flex-row gap-x-1 items-center" title="Sellable">
                      <Icon name="uil:check" size="1.5em" />
                      <span class="hidden sm:block">Sellable</span>
                    </div>
                    <div v-else class="flex flex-row gap-x-1 items-center" title="Not Sellable">
                      <Icon name="uil:times" size="1.5em" />
                      <span class="hidden sm:block">Not Sellable</span>
                    </div>
                    <MumeButton v-if="isNftOwned" type="button" class="ml-auto" title="Toggle Sellable"
                      @click="toggleSellableFlag">
                      Toggle
                    </MumeButton>
                  </div>
                </div>
              </template>
              <div v-if="!isNftOwned && nftData.sellable && contractCodeSignature > 1" class="col-span-2">
                <MumeButton type="button" title="Buy NFT" @click="buyNft">
                  Buy NFT
                </MumeButton>
              </div>
              <template v-if="isNftOwned && isNftTradeable">
                <div class="pt-2">Transfer To</div>
                <div>
                  <div class="flex flex-row">
                    <MumeInput v-model="nftOptions.targetAddress" type="text" class="flex-1" inputClasses="rounded-r-none"
                      :invalid="!isTargetEthAddress" />
                    <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1 rounded-l-none"
                      title="Transfer NFT" @click="transferToken">
                      <Icon name="bi:send" />
                      <span class="hidden sm:block">Send</span>
                    </MumeButton>
                  </div>
                </div>
              </template>
              <template v-if="isNftOwned">
                <div class="col-span-2 my-2 flex flex-row items-center justify-center">
                  <MumeButton v-if="claimMuData.muClaimable" type="button"
                    class="inline-flex flex-row items-center gap-x-1" title="Claim MU" @click="claimMu">
                    <Icon name="mdi:cash-refund" />
                    <span>Claim MU</span>
                  </MumeButton>
                  <MumeButton v-else type="button" class="inline-flex flex-row items-center gap-x-1" title="MU Claimed"
                    disabled>
                    <Icon name="mdi:cash-refund" />
                    <span>MU Claimed</span>
                  </MumeButton>
                </div>
              </template>
            </template>
          </div>
          <div v-if="currentTab === 'stake' && typeof itemData.nftId === 'string' && (isNftOwned || stakeData.nftLending)"
            class="border border-gray-400 rounded-b-md px-2 py-2 custom-grid gap-x-2 gap-y-1 overflow-x-auto">
            <div class="pt-2">Claimable MU</div>
            <div class="flex flex-row items-center">
              <div class="flex-1 flex flex-col">
                <div>{{ formatUnits(stakeData.muToClaim, 'ether') }} MU</div>
              </div>
              <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1" title="Claim"
                @click="claimStakeMu">
                <Icon name="mdi:cash-refund" />
                <span class="hidden sm:block">Claim</span>
              </MumeButton>
            </div>
            <div>Reward Rate</div>
            <div>{{ formatUnits(stakeData.rewardMuPerDay, 'ether') }} MU/Day</div>

            <div v-if="!isNftLending" class="col-span-2 my-2 flex flex-row items-center justify-center">
              <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1" title="Stake Nft"
                @click="stakeNft">
                <IconIntenseBurner />
                <span>Stake Nft</span>
              </MumeButton>
            </div>
            <template v-else>
              <div>Staking Since</div>
              <div>
                {{ dayjs(stakeData.nftLendAt).format("YYYY-MM-DD HH:mm:ss") }}
              </div>
              <div class="pt-2">MU Generate</div>
              <div class="flex flex-row items-center">
                <div class="flex-1 flex flex-col">
                  <div>{{ formatUnits(stakeData.muStakePending, 'ether') }} MU</div>
                </div>
                <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1" title="Collect"
                  @click="collectStakeReward">
                  <Icon name="uil:money-withdraw" />
                  <span class="hidden sm:block">Collect</span>
                </MumeButton>
              </div>

              <div class="col-span-2 my-2 flex flex-row items-center justify-center gap-x-2">
                <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1" title="Claim Nft"
                  @click="claimStakeNft">
                  <IconIntenseBurner />
                  <span>Claim Nft</span>
                </MumeButton>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="text-xs text-center">Fonts made from <NuxtLink href="http://www.onlinewebfonts.com" external
          target="_blank">Web Fonts
        </NuxtLink> is licensed by CC BY 4.0</div>
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
import { BrowserProvider, Contract, formatUnits, parseUnits, toBigInt } from 'ethers'
import { useToast } from "vue-toastification";

import IconIntenseBurner from '~/assets/Incense_burner.svg'

import { jbcchain, walletConnectId, metadata, getMumeNftAbi, getLendNftAbi, getCodeSignatureByChain, isLendContractAddress } from "~/utils/web3"
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
const nftNotFound = ref(false);
const nftOptions = ref({
  edited: false,
  price: "",
  priceUnit: "ether",
  targetAddress: "",
});
const claimMuData = ref({
  muClaimable: false,
});

const stakeData = ref({
  nftLending: false,
  nftLendAt: new Date(),
  rewardMuPerDay: toBigInt("0"),
  muStakePending: toBigInt("0"),
  muToClaim: toBigInt("0"),
});

const isNftTradeable = computed(() => {
  if (!nftData.value) {
    return false;
  }
  return nftData.value.tradable;
});

const historyLoading = ref(false);
const historyShow = ref(false);
const selectedImgIndex: Ref<number | undefined> = ref(undefined);

const isDevUser = computed(() => isDeveloperUser(sessionData.value));
const useDevChain = computed(() => !!itemData.value ? itemData.value.devChain : useRuntimeConfig().public.USE_DEVCHAIN);
const chainVersion = computed(() => !!itemData.value ? itemData.value.chainVersion : useRuntimeConfig().public.CHAIN_VERSION);
const nftAbi = computed(() => {
  return getMumeNftAbi(useDevChain.value, chainVersion.value);
});
const claimAbi = computed(() => {
  return getClaimMuAbi(useDevChain.value, chainVersion.value);
});
const lendAbi = computed(() => {
  return getLendNftAbi(useDevChain.value, chainVersion.value);
});

const contractCodeSignature = computed(() => {
  return getCodeSignatureByChain(useDevChain.value, chainVersion.value);
});
const isWalletConnected = ref(false);
const isSelectedChainCorrect = ref(false);
const isNftValid = computed(() => isWalletConnected.value && isSelectedChainCorrect.value);
const isNftOwned = computed(() => web3Modal.getAddress()?.toLowerCase() === nftData.value?.owner.toLowerCase());
const isNftLending = computed(() => nftData.value?.owner && isLendContractAddress(nftData.value?.owner));

const isTargetEthAddress = computed(() => isAddress(nftOptions.value.targetAddress))

const priceWei = computed(() => {
  if (!nftData.value) {
    return toBigInt("0");
  }

  return nftData.value.price;
})
const newPriceWei = computed(() => {
  const price = nftOptions.value.price;
  const priceUnit = nftOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return weiValues;
})

const avaliableTabs = computed(() => {
  const basicTabs = [{
    label: "Info",
    id: 'info',
  }];

  if (typeof itemData.value?.nftId === 'string') {
    basicTabs.push({
      label: "NFT",
      id: 'nft',
    });
  }

  if (isNftOwned.value || stakeData.value.nftLending) {
    basicTabs.push(
      {
        label: "Stake",
        id: 'stake',
      });
  }

  return basicTabs;
});
const currentTab = ref(avaliableTabs.value[0].id);

async function quickSearchItems(keyword: string) {
  if (!keyword || searchLoading.value) {
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

function formatBlockscanLink(nftId: string) {
  return `https://exp-l1.jibchain.net/token/${nftAbi.value.address}/instance/${nftId}`;
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

async function loadNftDataWithLoading() {
  if (!isWalletConnected.value || typeof itemData.value?.nftId !== 'string' || nftLoading.value) {
    return;
  }

  loadingText.value = "Load NFT Data";
  nftNotFound.value = false;
  nftLoading.value = true;

  try {
    await loadNftData();
  } catch (err) {
    let message = "Can't Get NFT Data";
    if (err instanceof Error) {
      message = err.message
    }

    nftNotFound.value = true;

    useToast().error(message, {
      timeout: 5000
    });
  }

  nftLoading.value = false;
}

async function loadNftData() {
  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const abi = nftAbi.value;
  const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);

  switch (contractCodeSignature.value) {
    case 1:
      const response1 = await MumeArtToyContract.nftInfomationOf(itemData?.value?.nftId) as [string, boolean, bigint, string];
      nftData.value = {
        owner: response1[0],
        tradable: response1[1],
        sellable: true, // due chain bug
        price: response1[2],
        uri: response1[3],
      }
      break;
    default:
      const response2 = await MumeArtToyContract.nftInfomationOf(itemData?.value?.nftId) as [string, boolean, boolean, bigint, string];
      nftData.value = {
        owner: response2[0],
        tradable: response2[1],
        sellable: response2[2],
        price: response2[3],
        uri: response2[4],
      }
      break;
  }

  const abi2 = claimAbi.value;
  if (abi2) {
    const MumeArtToyClaimContract = new Contract(abi2.address, abi2.abi, signer);
    const canClaimMu = await MumeArtToyClaimContract.canClaimMu(itemData?.value?.nftId) as boolean;
    claimMuData.value.muClaimable = canClaimMu;
  }

  const abi3 = lendAbi.value;
  if (abi3) {
    const LendAbiContract = new Contract(abi3.address, abi3.abi, signer);
    const nftLending = await LendAbiContract.nftOldOwner(itemData?.value?.nftId) as string;
    stakeData.value.nftLending = nftLending.toLowerCase() == web3Modal.getAddress()?.toLowerCase();

    const claimableMu = await LendAbiContract.muToClaim(itemData?.value?.nftId) as bigint;
    stakeData.value.muToClaim = claimableMu;

    const lendStartAt = await LendAbiContract.lendStartAt(itemData?.value?.nftId) as bigint;
    stakeData.value.nftLendAt = dayjs(parseInt(lendStartAt.toString(), 10) * 1000).toDate();

    const rewardMuPerDay = await LendAbiContract.rewardMuPerDay() as bigint;
    stakeData.value.rewardMuPerDay = rewardMuPerDay;

    if (stakeData.value.nftLending) {
      const muStakePending = await LendAbiContract.currentSessionMuReward(itemData?.value?.nftId) as bigint;
      stakeData.value.muStakePending = muStakePending;
    }
  }
}

async function buyNft() {
  // Only V2 can buy nft on site
  if (!isNftValid.value || !nftData.value || typeof itemData.value?.nftId !== 'string' || contractCodeSignature.value <= 1) {
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

    const abi = nftAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.buyNft(
      nftData.value.owner, itemData.value.nftId, {
      value: nftData.value.price.toString()
    }
    );
    await tx.wait();

    nftLoading.value = false;
    useToast().success("NFT Purchased!", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Buy NFT";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });

    nftLoading.value = false;
  }
}

async function transferToken() {
  if (!isNftValid.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
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

    const abi = nftAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.safeTransferFrom(
      nftData.value.owner, nftOptions.value.targetAddress, itemData.value.nftId
    );
    await tx.wait();

    nftOptions.value.targetAddress = "";

    nftLoading.value = false;
    useToast().success("NFT Transfered", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Transfer NFT";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function toggleTradeableFlag() {
  if (!isNftValid.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
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

    const abi = nftAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.setTradeable(
      itemData.value.nftId, nextTradableFlag
    );
    await tx.wait();

    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Set Tradable Flag";
    if (err instanceof Error) {
      message = err.message
    }

    nftLoading.value = false;
    useToast().error(message, {
      timeout: 5000
    });
  }

}

async function setTradeable(nftId: string, state: boolean) {
  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();

  const abi = nftAbi.value;
  const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
  const tx = await MumeArtToyContract.setTradeable(
    nftId, state
  );
  await tx.wait();
}

async function toggleSellableFlag() {
  if (!isNftValid.value || !nftData.value || typeof itemData.value?.nftId !== 'string' || contractCodeSignature.value < 2) {
    return;
  }

  const nextTradableFlag = !nftData.value.sellable;
  loadingText.value = "Send Transaction";
  nftLoading.value = true;

  try {
    await setTradeable(itemData.value.nftId, nextTradableFlag);
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Set Sellable Flag";
    if (err instanceof Error) {
      message = err.message
    }

    nftLoading.value = false;
    useToast().error(message, {
      timeout: 5000
    });
  }

}

async function updatePrice() {
  if (!isNftValid.value || !nftData.value || typeof itemData.value?.nftId !== 'string') {
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

    const abi = nftAbi.value;
    const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyContract.setPrice(
      itemData.value.nftId, parseUnits(nftOptions.value.price, nftOptions.value.priceUnit),
    );
    await tx.wait();

    cancelEditPrice();
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Set Price";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function claimMu() {
  const abi = claimAbi.value;

  if (!claimMuData.value.muClaimable || !abi || typeof itemData.value?.nftId !== 'string') {
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

    const ClaimMuFromMumeNftContract = new Contract(abi.address, abi.abi, signer);

    const txSent = await ClaimMuFromMumeNftContract.claimMu(itemData.value?.nftId);
    await txSent.wait();
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Claim MU";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function approveNft(nftId: string, address: string) {
  const walletProvider = web3Modal.getWalletProvider()

  if (!web3Modal.getIsConnected()) throw Error("User disconnected")
  if (!walletProvider) throw Error("WalletProvider not found")

  const ethersProvider = new BrowserProvider(walletProvider);
  const signer = await ethersProvider.getSigner();
  const abi = nftAbi.value;
  const MumeArtToyContract = new Contract(abi.address, abi.abi, signer);
  const tx = await MumeArtToyContract.approve(
    address, nftId,
  );
  await tx.wait();
}

async function stakeNft() {
  const stakeAbi = lendAbi.value;

  if (isNftLending.value || !stakeAbi || typeof itemData.value?.nftId !== 'string') {
    return;
  }

  nftLoading.value = true;

  try {
    if (!isNftTradeable.value) {
      loadingText.value = "Set Tradeable";
      await setTradeable(itemData.value.nftId, true);
    }

    loadingText.value = "Approve Stake Contract";
    await approveNft(itemData.value?.nftId, stakeAbi.address);

    loadingText.value = "Send Transaction";
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const LendNftContract = new Contract(stakeAbi.address, stakeAbi.abi, signer);

    const txSent = await LendNftContract.lendNft(itemData.value?.nftId);
    await txSent.wait();
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Stake Nft";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function claimStakeNft() {
  const stakeAbi = lendAbi.value;

  if (!isNftLending.value || !stakeAbi || typeof itemData.value?.nftId !== 'string') {
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

    const LendNftContract = new Contract(stakeAbi.address, stakeAbi.abi, signer);

    const txSent = await LendNftContract.claimNft(itemData.value?.nftId);
    await txSent.wait();
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Claim Nft";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function collectStakeReward() {
  const stakeAbi = lendAbi.value;

  if (!isNftLending.value || !stakeAbi || typeof itemData.value?.nftId !== 'string') {
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

    const LendNftContract = new Contract(stakeAbi.address, stakeAbi.abi, signer);

    const txSent = await LendNftContract.renewLendSession(itemData.value?.nftId);
    await txSent.wait();
    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Claim Reward";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

async function claimStakeMu() {
  const stakeAbi = lendAbi.value;

  if (!stakeAbi || typeof itemData.value?.nftId !== 'string') {
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

    const LendNftContract = new Contract(stakeAbi.address, stakeAbi.abi, signer);

    console.log(stakeData.value.muToClaim.toString());
    const txSent = await LendNftContract.claimMuReward(itemData.value?.nftId, stakeData.value.muToClaim.toString());
    await txSent.wait();

    nftLoading.value = false;
    useToast().success("NFT Updated", {
      timeout: 5000
    });
  } catch (err) {
    let message = "Can't Claim MU";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });
    nftLoading.value = false;
  }
}

let timerId: NodeJS.Timeout | undefined;
onMounted(() => {
  timerId = setInterval(() => {
    isWalletConnected.value = !!(web3Modal.getIsConnected() && web3Modal.getWalletProvider());
    isSelectedChainCorrect.value = web3Modal.getChainId() === jbcchain.chainId;

    if (typeof itemData.value?.nftId === "string") {
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
</style>