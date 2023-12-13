<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <MumeSearchTopBar v-model="searchKeyword" @search="quickSearchItems" />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="w-full p-4 flex flex-col justify-center items-center gap-y-1">
        <h3 class="transition-all duration-200 mt-4 mb-2 text-xl transform scale-y-110 sm:text-2xl font-bold">
          Uncategorized Products
        </h3>
        <div class="mb-2 w-full max-w-3xl flex flex-row gap-x-2 items-center">
          <MumeInput v-model="nameFilters" placeholder="Filters" class="flex-1"></MumeInput>
        </div>
        <template v-if="!productLoading">
          <div v-if="productsResults.length === 0">
            Items not found
          </div>
          <div v-else-if="filterProductsResults.length > 0 && !nameFilters">
            Found {{ productsResults.length }} item(s)
          </div>
          <div v-else>
            Found {{ filterProductsResults.length }} item(s) (Total: {{ productsResults.length }})
          </div>
        </template>
        <div class="flex flex-row justify-center flex-wrap gap-x-2 gap-y-1">
          <MumeArtItemContainer v-for="item of filterProductsResults" :item="item" @click="goToItemPage" />
        </div>
        <div class="my-2">
          <MumeButton @click="loadMoreProducts">
            <template v-if="productsResults.length > 0">Load More Items</template>
            <template v-else>Refresh</template>
          </MumeButton>
        </div>
      </div>
    </div>
    <MumeFixedBar hide-additem></MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="productLoading || searchLoading || goLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
useHead({
  title: "MUME Art-Toy | Uncategorized Products",
});

const productLoading = ref(false);
const goLoading = ref(false);
const productsResults: Ref<ArtSearchResponse[]> = ref([]);

const searchKeyword = ref("");
const searchLoading = ref(false);
const nameFilters = ref("");

const filterProductsResults = computed(() => {
  const keyword = nameFilters.value.toLocaleLowerCase();
  const validProducts: ArtSearchResponse[] = [];
  for (const product of productsResults.value) {
    if (product.name.toLocaleLowerCase().startsWith(keyword)) {
      validProducts.push(product);
    }
  }

  return validProducts;
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

async function loadProducts(nextfrom?: string, appended?: boolean) {
  if (productLoading.value) {
    return;
  }

  productLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/artsearch/uncategorized`, {
      query: {
        nextfrom
      },
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get Items");
    }

    const items = (data.value as { items: ArtSearchResponse[] }).items;
    if (appended) {
      productsResults.value = productsResults.value.concat(items);
    } else {
      productsResults.value = items;
    }
  } catch (err) {
    console.error(err);

    let message = "Can't Get Items";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  productLoading.value = false;
}

function loadMoreProducts() {
  if (productsResults.value.length <= 0) {
    loadProducts();
  } else {
    loadProducts(productsResults.value[productsResults.value.length - 1]._id, true);
  }
}

function goToItemPage(itemId: string) {
  goLoading.value = true;

  navigateTo(`/art/${itemId}`);
}

loadProducts();

</script>

