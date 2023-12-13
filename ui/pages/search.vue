<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <MumeSearchTopBar v-model="searchKeyword" @search="fullSearchItems" />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="w-full p-4 flex flex-col justify-center items-center gap-y-1">
        <h3 class="transition-all duration-200 mt-4 mb-2 text-xl transform scale-y-110 sm:text-2xl font-bold">
          Search Result
        </h3>
        <div class="mb-2 w-full max-w-3xl flex flex-row gap-x-2 items-center">
          <MumeInput v-model="nameFilters" placeholder="Filters" class="flex-1"></MumeInput>
        </div>
        <template v-if="!searchLoading">
          <div v-if="searchResults.length === 0">
            Items not found
          </div>
          <div v-else-if="filterSearchResults.length > 0 && !nameFilters">
            Found {{ searchResults.length }} item(s)
          </div>
          <div v-else>
            Found {{ filterSearchResults.length }} item(s) (Total: {{ searchResults.length }})
          </div>
        </template>
        <div class="flex flex-row justify-center flex-wrap gap-x-2 gap-y-1">
          <MumeArtItemContainer v-for="item of filterSearchResults" :item="item" @click="goToItemPage" />
        </div>
        <div class="my-2">
          <MumeButton @click="searchMoreProducts">
            <template v-if="searchResults.length > 0">Load More Items</template>
            <template v-else>Refresh</template>
          </MumeButton>
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
const { keyword: oldKeyword } = useRoute().query;
const searchKeyword = ref(oldKeyword?.toString() || "");

const title = computed(() => {
  if (searchKeyword.value) {
    return `MUME Art-Toy | Search - ${searchKeyword}`
  } else {
    return `MUME Art-Toy | Search`
  }
})

useHead({
  title: title,
});

const lastSearchKeyword = ref("");
const searchLoading = ref(false);
const goLoading = ref(false);
const searchResults: Ref<ArtSearchResponse[]> = ref([]);
const nameFilters = ref("");

const filterSearchResults = computed(() => {
  const keyword = nameFilters.value.toLocaleLowerCase();
  const validProducts: ArtSearchResponse[] = [];
  for (const product of searchResults.value) {
    if (product.name.toLocaleLowerCase().startsWith(keyword)) {
      validProducts.push(product);
    }
  }

  return validProducts;
});

async function fullSearchItems(keyword: string, nextfrom?: string, appended?: boolean) {
  if (!keyword || searchLoading.value) {
    return;
  }

  searchLoading.value = true;
  lastSearchKeyword.value = keyword;

  try {
    const { data, error } = await useFetch(`/mapi/artsearch`, {
      query: {
        keyword, nextfrom
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

    const items = (data.value as { items: ArtSearchResponse[] }).items;
    if (appended) {
      searchResults.value = searchResults.value.concat(items);
    } else {
      searchResults.value = items;
    }
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

function searchMoreProducts() {
  if (searchResults.value.length <= 0) {
    fullSearchItems(searchKeyword.value);
  } else {
    fullSearchItems(searchKeyword.value, searchResults.value[searchResults.value.length - 1]._id, true);
  }
}


function goToItemPage(itemId: string) {
  goLoading.value = true;

  navigateTo(`/art/${itemId}`);
}

if (searchKeyword.value) {
  fullSearchItems(searchKeyword.value);
}
</script>

