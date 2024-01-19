<template>
  <MumeContainer class="flex flex-col">
    <MumeSearchTopBar v-model="searchKeyword" @search="quickSearchItems" />
    <div class="flex-1 flex flex-col overflow-y-auto">
      <div class="px-2 py-2 w-full my-auto flex flex-col items-center">
        <h3 class="transition-all duration-200 mt-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          MUME Art-Toy
        </h3>
        <div v-if="useDevChain" class="text-red-300 capitalize">Test Site</div>
        <form class="mt-4 w-full max-w-md flex flex-row items-stretch" @submit.prevent="quickSearchItems(searchKeyword)">
          <MumeInput type="search" label="Search" v-model="searchKeyword" class="flex-1" input-classes="rounded-r-none"
            required />
          <MumeButton type="submit" btn-classes="rounded-l-none p-0 flex flex-col items-center"
            :disabled="!searchKeyword">
            <Icon name="mdi:magnify" size="1.5em" />
          </MumeButton>
        </form>
        <div class="flex flex-row flex-wrap gap-x-2 gap-y-1 items-center justify-center my-2">
          <MumeIndexMenu href="/products" icon="uil:folder-open" title="Browse Products">
            Products
          </MumeIndexMenu>
          <MumeIndexMenu href="/exchange-mu" icon="material-symbols:swap-horiz-rounded" title="Exchange MU-Coin">
            Exchange MU
          </MumeIndexMenu>
        </div>
        <div class="flex flex-col items-center">
          <NuxtLink class="underline"
            href="https://docs.google.com/document/d/1ptDmD8jMQcAokCoMgyJIcQ5FamZSFLnMXHbKKLvyQeE/edit#heading=h.vvdwee4g9yo2"
            external target="_blank">
            การ List เหรียญ MU บน Metamask
          </NuxtLink>
        </div>
      </div>
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
const useDevChain = computed(() => useRuntimeConfig().public.USE_DEVCHAIN);

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