<template>
  <div class="fixed bottom-0 right-0">
    <div v-if="!isGuest" class="bg-slate-700 border-2 shadow border-gray-400 flex flex-col gap-y-2 items-stretch">
      <NuxtLink v-if="isDevUser && !props.hideAdditem" href="/admin/add-item" title="Add Item"
        class="transition duration-200 px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:plus" />
        <span class="hidden sm:inline">Add Item</span>
      </NuxtLink>
      <slot></slot>
      <div title="Logout" @click="logout"
        class="transition duration-200 cursor-pointer px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:signout" />
        <span class="hidden sm:inline">Logout</span>
      </div>
    </div>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="formLoading" />
      </Transition>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";

const props = withDefaults(defineProps<{
  hideAdditem?: boolean,
}>(), {
  hideAdditem: false
});

const sessionData = useSessionData();
const formLoading = ref(false);

const isDevUser = computed(() => isDeveloperUser(sessionData.value));
const isGuest = computed(() => isGuestUser(sessionData.value));

async function logout() {
  formLoading.value = true;
  try {
    const { error } = await useFetch("/mapi/logout", {
      method: "post",
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    sessionData.value = {
      role: "guest",
    };

    useToast().success("Logout Successful!", {
      timeout: 5000
    });

    navigateTo("/");
  } catch (err) {
    console.error(err);

    let message = "Can't Login";
    if (err instanceof Error) {
      if (err.message === "Forbidden") {
        message = "Invalid Username/Password"
      } else {
        message = err.message
      }
    }

    useToast().error(message, {
      timeout: 5000
    });
  }

  formLoading.value = false;
}
</script>