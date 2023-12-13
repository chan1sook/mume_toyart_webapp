<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <MumeSearchTopBar v-model="searchKeyword" @search="quickSearchItems" />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="w-full p-4 flex flex-col justify-center items-center gap-y-1">
        <h3 class="transition-all duration-200 my-4 text-xl transform scale-y-110 sm:text-2xl font-bold">
          Browse Products
        </h3>
        <div class="mb-2 w-full max-w-3xl flex flex-row gap-x-2 items-center">
          <MumeInput v-model="categoryFilters" placeholder="Filters" class="flex-1"></MumeInput>
        </div>
        <template v-if="!categoriesLoading">
          <div class="w-full max-w-5xl flex flex-row flex-wrap gap-x-2 gap-y-1">
            <NuxtLink v-if="filterCategoriesResults.all" href="/products/all" class="italic underline">
              All ({{ categoriesResult.totals }})
            </NuxtLink>
            <NuxtLink v-if="filterCategoriesResults.uncategorized" href="/products/uncategorized"
              class="italic underline">
              Uncategorized ({{ categoriesResult.uncategorized }})
            </NuxtLink>
            <template v-for="value, key of categoriesResult.categories">
              <NuxtLink v-if="filterCategoriesResults.categories.includes(key.toString())"
                :href="`/products/category/${key}`" class="underline">
                {{ key }} ({{ value }})
              </NuxtLink>
            </template>
          </div>
        </template>
      </div>
    </div>
    <MumeFixedBar hide-additem></MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="categoriesLoading || searchLoading || goLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
useHead({
  title: "MUME Art-Toy | Browse Products",
});

const categoriesLoading = ref(false);
const goLoading = ref(false);
const categoriesResult: Ref<ArtCategoriesResponse> = ref({
  totals: 0,
  uncategorized: 0,
  categories: {},
});

const searchKeyword = ref("");
const searchLoading = ref(false);
const categoryFilters = ref("");

const filterCategoriesResults = computed(() => {
  const keyword = categoryFilters.value.toLocaleLowerCase();
  const validCategories: string[] = [];
  for (const category of Object.keys(categoriesResult.value.categories)) {
    if (category.toLocaleLowerCase().startsWith(keyword)) {
      validCategories.push(category);
    }
  }

  return {
    all: "all".startsWith(keyword),
    uncategorized: "uncategorized".startsWith(keyword),
    categories: validCategories,
  }
})
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

async function loadProducts() {
  if (categoriesLoading.value) {
    return;
  }

  categoriesLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/artcategories`);

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get Categories");
    }

    categoriesResult.value = (data.value as { categories: ArtCategoriesResponse }).categories;
  } catch (err) {
    console.error(err);

    let message = "Can't Get Categories";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  categoriesLoading.value = false;
}

function goToItemPage(itemId: string) {
  goLoading.value = true;

  navigateTo(`/art/${itemId}`);
}

loadProducts();

</script>

