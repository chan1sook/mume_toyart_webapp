<template>
  <MumeContainer class="flex flex-col alig ">
    <MumeSearchTopBar v-model="searchKeyword" @search="quickSearchItems" />
    <h3 class="mx-auto transition-all duration-200 mt-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
      MUME Art-Toy | Exchange MU
    </h3>
    <div class="px-2 w-full max-w-5xl mx-auto flex flex-col gap-y-2 items-center justify-center my-2">
      <div class="w-full flex gap-x-2 justify-center">
        <ClientOnly>
          <w3m-button class="inline-block" />
        </ClientOnly>
      </div>
      <template v-if="tokenEnabled">
        <div>You Spend</div>
        <div class="flex flex-row items-center">
          <div class="mr-2">JBC: </div>
          <MumeInput v-model="tokenOptions.price" type="number" min="0" step="1" class="flex-1" placeholder="Spend Token"
            inputClasses="rounded-r-none" :invalid="!isPriceValid" />
          <MumeSelect v-model="tokenOptions.priceUnit" class="inline-flex" selectClasses="rounded-l-none">
            <option value="wei">Wei</option>
            <option value="gwei">GWei</option>
            <option value="ether">Ether</option>
          </MumeSelect>
        </div>
        <div>You'll Get</div>
        <div class="flex flex-row items-center">
          <div class="mr-2">MU: </div>
          <MumeInput :model-value="formatUnits(estimatedMu, tokenOptions.resultPriceUnit)" class="flex-1"
            placeholder="Token Get" inputClasses="rounded-r-none" readonly />

          <MumeSelect v-model="tokenOptions.resultPriceUnit" class="inline-flex" selectClasses="rounded-l-none">
            <option value="wei">Wei</option>
            <option value="gwei">GWei</option>
            <option value="ether">Ether</option>
          </MumeSelect>
        </div>
        <div class="border border-gray-400 rounded-md px-2 py-2 flex flex-col gap-x-2 pay-y-2">
          <div class="w-full custom-grid gap-x-2 pay-y-1">
            <div class="font-bold">Conversation Rate</div>
            <div>{{ converstionRateStr }} MU per 1.0 JCB</div>
            <div class="font-bold">Fee Rate</div>
            <div>{{ feeRateStr }}%</div>

            <template v-if="isPriceValid">
              <div class="font-bold mt-2">You Spend</div>
              <div class="mt-2">{{ formatUnits(estimatedPaymentWei, 'ether') }} JBC</div>
              <div class="font-bold">Fee</div>
              <div>{{ formatUnits(estimatedFee, 'ether') }} JBC</div>
              <div class="font-bold">Converted JBC</div>
              <div>{{ formatUnits(esitmatedPaymentWofee, 'ether') }} JBC</div>
              <div class="font-bold">MU</div>
              <div>{{ formatUnits(estimatedMu, 'ether') }} MU</div>
            </template>
          </div>
        </div>
        <div class="flex flex-row">
          <MumeButton type="button" class="inline-flex flex-row items-center gap-x-1" title="Swap"
            :disabled="!tokenEnabled || !isPriceValid" @click="exchangeMintMu">
            <Icon name="material-symbols:swap-horiz-rounded" />
            <span class="hidden sm:block">Swap</span>
          </MumeButton>
        </div>
      </template>
    </div>
    <MumeFixedBar></MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="searchLoading || nftLoading" :loading-text="loadingText" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/vue'
import { BrowserProvider, Contract, formatUnits, parseUnits, toBigInt } from 'ethers';
import { getMuAbi } from '~/utils/eth';
import { useToast } from "vue-toastification";

useHead({
  title: "MUME Art-Toy | MU Exchange",
});

const loadingText: Ref<string | undefined> = ref(undefined);
const nftLoading = ref(false);
const searchKeyword = ref("");
const searchLoading = ref(false);
const tokenEnabled = ref(false);

const converstionRate = ref(toBigInt("0"));
const feeRate = ref(toBigInt("0"));

const tokenOptions = ref({
  price: "0",
  priceUnit: "ether",
  resultPriceUnit: "ether",
});

const converstionRateStr = computed(() => formatUnits(converstionRate.value, 18));
const feeRateStr = computed(() => formatUnits(feeRate.value, 6));

const estimatedPaymentWei = computed(() => {
  const price = tokenOptions.value.price;
  const priceUnit = tokenOptions.value.priceUnit;
  const weiValues = parseUnits(price, priceUnit);
  return weiValues;
})
const estimatedFee = computed(() => {
  const weiValues = estimatedPaymentWei.value;
  return weiValues * feeRate.value / toBigInt("1000000");
})
const esitmatedPaymentWofee = computed(() => {
  const weiValues = parseUnits(tokenOptions.value.price, tokenOptions.value.priceUnit);
  const fee = estimatedFee.value;
  return weiValues - fee;
})

const estimatedMu = computed(() => {
  const weiValues = esitmatedPaymentWofee.value;
  return weiValues * converstionRate.value / toBigInt("1000000000000000000");
})

const isPriceValid = computed(() => {
  const value = tokenOptions.value;
  try {
    const ethValue = parseUnits(value.price, value.priceUnit);
    return ethValue >= 0;
  } catch (err) {
    return false;
  }
})


const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [jbcchain],
  projectId: walletConnectId,
});

async function quickSearchItems(keyword: string) {
  if (!keyword || searchLoading.value) {
    return;
  }

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

async function getRates() {
  try {
    const walletProvider = web3Modal.getWalletProvider()

    if (!web3Modal.getIsConnected()) throw Error("User disconnected")
    if (!walletProvider) throw Error("WalletProvider not found")

    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();

    const abi = getMuAbi();
    const MumeArtToyMuContract = new Contract(abi.address, abi.abi, signer);

    const _converstionRate = await MumeArtToyMuContract.conversationRate() as bigint;
    converstionRate.value = _converstionRate

    const _feeRate = await MumeArtToyMuContract.feeRate() as bigint;
    feeRate.value = _feeRate;
  } catch (err) {
    let message = "Can't Get Mu Token Rate";
    if (err instanceof Error) {
      message = err.message
    }

    console.error(err, message);
  }
}

async function exchangeMintMu() {
  if (!isPriceValid.value || !tokenEnabled.value) {
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

    const abi = getMuAbi();
    const MumeArtToyMuContract = new Contract(abi.address, abi.abi, signer);
    const tx = await MumeArtToyMuContract.exchangeMint({ value: estimatedPaymentWei.value });
    await tx.wait();

    nftLoading.value = false;
    useToast().success("Token Minted", {
      timeout: 5000
    });

  } catch (err) {
    let message = "Can't Mint MU Token";
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

function updateValues() {
  tokenEnabled.value = web3Modal.getIsConnected() && !!web3Modal.getWalletProvider() && web3Modal.getChainId() === jbcchain.chainId
  if (tokenEnabled.value) {
    getRates();
  }
}
onMounted(() => {
  updateValues();

  timerId = setInterval(updateValues, 200);
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
</style>