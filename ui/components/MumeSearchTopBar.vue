<template>
  <div
    class="px-2 sm:px-4 py-2 bg-slate-700 border-b-2 shadow border-gray-400 flex flex-col gap-x-2 gap-y-1 overflow-x-auto">
    <form class="flex-1 flex flex-row" @submit.prevent="searchItem(props.modelValue)">
      <NuxtLink href="/" title="Home"
        class="mr-2 transition duration-200 px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:home" size="1.5em" />
        <span class="hidden sm:inline">Home</span>
      </NuxtLink>
      <MumeInput type="search" placeholder="Search" :model-value="props.modelValue" class="flex-1"
        input-classes="rounded-r-none" required @input="onChange" />
      <MumeButton type="submit" btn-classes="rounded-l-none p-0 flex flex-col items-center" :disabled="!props.modelValue">
        <Icon name="mdi:magnify" size="1.5em" />
      </MumeButton>
      <NuxtLink v-if="isDevUser" href="/admin/add-item" title="Add Item"
        class="ml-2 transition duration-200 px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:plus" size="1.5em" />
        <span class="hidden sm:inline">Add Item</span>
      </NuxtLink>
    </form>
    <div class="ml-auto flex flex-row gap-x-2 gap-y-1 items-center">
      <template v-if="muTokenShow">
        <div class="whitespace-nowrap">{{ muTokenPretty }} MU</div>
        <NuxtLink href="/exchange-mu/" class="inline-block" title="Exchange">
          <Icon name="material-symbols:swap-horiz-rounded" size="1.5em"></Icon>
        </NuxtLink>
      </template>
      <ClientOnly>
        <w3m-button class="inline-block whitespace-nowrap" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, formatUnits, parseUnits, toBigInt } from 'ethers';
import { getMuAbi } from '~/utils/eth';

const props = defineProps<{
  modelValue?: string,
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "search", v: string): void;
}>();

const muTokenShow = ref(false);
const muToken = ref(toBigInt("0"));
const isDevUser = computed(() => isDeveloperUser(useSessionData().value));
const useDevChain = computed(() => useRuntimeConfig().public.USE_DEVCHAIN);
const chainVersion = computed(() => useRuntimeConfig().public.CHAIN_VERSION);
const muAbi = computed(() => {
  return getMuAbi(useDevChain.value, chainVersion.value);
});

const muTokenPretty = computed(() => {
  return formatUnits(muToken.value, "ether");
})

function onChange(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    emit('update:modelValue', ev.target.value)
  }
}

function searchItem(keyword?: string) {
  if (!keyword) {
    return;
  }

  emit("search", keyword);
}

const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [jbcchain],
  projectId: walletConnectId,
});

let timerId: NodeJS.Timeout | undefined;

async function updateMuBalance() {
  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = muAbi.value;
    const MumeArtToyExchangeContract = new Contract(abi.address, abi.abi, signer);

    const token = await MumeArtToyExchangeContract.balanceOf(signer.address) as bigint;
    muToken.value = token
  } catch (err) {
    let message = "Can't Get Mu Token Blanace";
    if (err instanceof Error) {
      message = err.message
    }

    console.error(err, message);
  }
}

function updateMuTokens() {
  muTokenShow.value = web3Modal.getIsConnected() && !!web3Modal.getWalletProvider() && web3Modal.getChainId() === jbcchain.chainId;

  if (muTokenShow.value) {
    updateMuBalance();
  }
}

onMounted(() => {
  updateMuTokens();

  timerId = setInterval(updateMuTokens, 200);
})

onBeforeUnmount(() => {
  clearInterval(timerId);
});
</script>