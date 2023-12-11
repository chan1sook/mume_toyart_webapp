<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <MumeSearchTopBar v-model="searchKeyword" @search="fullSearchItems" />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="w-full p-4 flex flex-col justify-center items-center gap-y-1">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          Search Result
        </h3>
        <template v-if="!searchLoading">
          <div v-if="searchResults.length === 0">
            Not found items with keyword "{{ lastSearchKeyword }}"
          </div>
          <div v-else>
            Found {{ searchResults.length }} item(s)
          </div>
        </template>
        <div class="flex flex-row justify-center flex-wrap gap-x-2 gap-y-1">
          <div v-for="item of searchResults"
            class="transition duration-200 w-48 px-2 py-2 flex flex-col items-center cursor-pointer hover:bg-white/10"
            @click="goToItemPage(item.itemId)">
            <img :src="item.image ? getImagePath(item.image) : getFakeImagePath('0')"
              class="h-20 border border-gray-400 rounded my-2" />
            <div class="my-1">{{ item.name }}</div>
            <div class="text-sm">
              <span title="MAC">
                <Icon name="material-symbols:network-node" />:
              </span>
              {{ item.mac || '-' }}
            </div>
            <div v-if="item.nftId" class="text-sm">
              <span title="NFT #:">
                <Icon name="ri:nft-fill" />:
              </span>
              {{ item.nftId }}
            </div>
            <div v-else class="text-sm">
              <span title="Owner">
                <Icon name="uil:user" />:
              </span>
              {{ item.owner || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <MumeFixedBar hide-additem></MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="searchLoading || goLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
import { getImagePath, getFakeImagePath } from "~/utils/path";

const { keyword: oldKeyword } = useRoute().query;
const searchKeyword = ref(oldKeyword?.toString() || "");
const lastSearchKeyword = ref("");
const searchLoading = ref(false);
const goLoading = ref(false);
const searchResults: Ref<ArtSearchResponse[]> = ref([]);


async function fullSearchItems(keyword: string) {
  if (!keyword || searchLoading.value) {
    return;
  }

  searchLoading.value = true;
  lastSearchKeyword.value = keyword;

  try {
    const { data, error } = await useFetch(`/mapi/artsearch`, {
      query: {
        keyword
      }
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Search Items");
    }

    searchResults.value = (data.value as { items: ArtSearchResponse[] }).items;
  } catch (err) {
    console.error(err);

    let message = "Can't Search Items";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  searchLoading.value = false;
}

function goToItemPage(itemId: string) {
  goLoading.value = true;

  navigateTo(`/art/${itemId}`);
}

if (searchKeyword.value) {
  fullSearchItems(searchKeyword.value);
}
</script>

