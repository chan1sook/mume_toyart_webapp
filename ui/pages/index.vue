<template>
  <MumeContainer class="flex flex-col justify-center items-center gap-y-2 min-w-[400px]">
    <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl  font-bold">
      MUME Art-Toy
    </h3>
    <div class="w-full max-w-md flex flex-row items-stretch">
      <MumeInput type="search" label="Search" v-model="searchKeyword" input-classes="rounded-r-none" required />
      <MumeButton btn-classes="rounded-l-none p-0 flex flex-col items-center" :disabled="!searchKeyword"
        @click="quickSearchItems(searchKeyword)">
        <Icon name="mdi:magnify" size="1.5em" />
      </MumeButton>
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

</script>