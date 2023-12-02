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
        <div class="custom-grid gap-x-2 gap-y-1 w-full max-w-5xl">
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
          <div class="font-bold">Owner</div>
          <div>{{ itemData.owner || '-' }}</div>
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
              <span v-else-if="!historyShow" class="cursor-pointer focus:underline hover:underline" @click="loadHistory">
                View
              </span>
              <span v-else class="cursor-pointer focus:underline hover:underline" @click="historyShow = false">
                Hide
              </span>
            </div>
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
        <MumeLoadingModal v-if="itemLoading || searchLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { getImagePath, getCertPath } from "~/utils/path";
import { historyActionPretty } from "~/utils/history";

const { id } = useRoute().params;
useHead({
  title: `MUME Art-Toy | Art #${id}`,
});

const sessionData = useSessionData();
const searchKeyword = ref("");
const searchLoading = ref(false);
const itemLoading = ref(true);
const itemData: Ref<ArtItemResponse | undefined> = ref(undefined);
const historyList: Ref<ArtHistoryResponse[]> = ref([]);
const historyLoading = ref(false);
const historyShow = ref(false);
const selectedImgIndex: Ref<number | undefined> = ref(undefined);

const isDevUser = computed(() => isDeveloperUser(sessionData.value));

async function quickSearchItems(keyword: string) {
  if (!keyword) {
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


loadItemData();
</script>

<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>

