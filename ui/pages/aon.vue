<template>
  <MumeContainer class="flex flex-col justify-center items-center gap-y-2 ">
    <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl  font-bold">
      Login
    </h3>
    <form class="flex flex-col gap-y-4" @submit.prevent="login">
      <div class="w-full max-w-md">
        <MumeInput type="text" label="Username" v-model="username" required />
      </div>
      <div class="w-full max-w-md flex flex-row items-stretch">
        <MumeInput :type="passwordShow ? 'text' : 'password'" label="Password" v-model="password" required
          input-classes="rounded-r-none" />
        <MumeButton btn-classes="rounded-l-none p-0 flex flex-col items-center" @click="togglePasswordVisiblity">
          <Icon v-if="passwordShow" name="uil:eye-slash" size="1.5em" />
          <Icon v-else name="uil:eye" size="1.5em" />
        </MumeButton>
      </div>
      <div class="flex flex-row justify-center">
        <MumeButton type="submit" :disabled="!isFormValid || formLoading" title="Login"
          class="flex flex-row gap-x-2 items-center">
          <Icon name="uil:signin" />
          <span class="hidden sm:inline">Login</span>
        </MumeButton>
      </div>
    </form>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="formLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script setup lang="ts">
import { useToast } from "vue-toastification";

useHead({
  title: "MUME Art-Toy | Login",
});

definePageMeta({
  middleware: ["auth-guest"],
});

const username = ref("");
const password = ref("");
const passwordShow = ref(false);
const isFormValid = computed(() => username.value !== "" && password.value !== "");
const formLoading = ref(false);

function togglePasswordVisiblity() {
  passwordShow.value = !passwordShow.value;
}

async function login() {
  if (!isFormValid.value || formLoading.value) {
    return;
  }

  formLoading.value = true;
  try {
    const { data, error } = await useFetch("/mapi/login", {
      method: "post",
      body: {
        username: username.value,
        password: password.value,
      }
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    useToast().success("Login Successful!", {
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