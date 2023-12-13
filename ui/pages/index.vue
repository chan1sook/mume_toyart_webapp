<template>
  <MumeContainer class="flex flex-col justify-center items-center gap-y-2 min-w-[400px]">
    <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl  font-bold">
      MUME Art-Toy
    </h3>
    <form class="w-full max-w-md flex flex-row items-stretch" @submit.prevent="quickSearchItems(searchKeyword)">
      <MumeInput type="search" label="Search" v-model="searchKeyword" class="flex-1" input-classes="rounded-r-none"
        required />
      <MumeButton type="submit" btn-classes="rounded-l-none p-0 flex flex-col items-center" :disabled="!searchKeyword">
        <Icon name="mdi:magnify" size="1.5em" />
      </MumeButton>
    </form>
    <div class="flex flex-row justify-center my-2">
      <NuxtLink href="/products">
        Browse All Products
      </NuxtLink>
    </div>
    <MumeFixedBar></MumeFixedBar>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="searchLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
const searchKeyword = ref("");
const searchLoading = ref(false);

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

</script>