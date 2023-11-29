<template>
  <MumeContainer class="flex flex-col justify-center items-center gap-y-2 min-w-[400px]">
    <h3 class="transition-all duration-200 my-4 text-4xl transform scale-y-110 sm:text-6xl font-bold">
      {{ props.error?.statusCode || 500 }}
    </h3>
    <div class="my-2 text-xl">{{ props.error?.message || props.error?.statusMessage }}</div>
    <div class="flex flex-row justify-center">
      <MumeButton type="button" btn-classes="p-0 flex flex-col items-center" @click="handleError">
        <span>Back to Home</span>
      </MumeButton>
    </div>
  </MumeContainer>
</template>

<script setup lang="ts">
useHead({
  title: "MUME Art-Toy | Error",
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: "/icon.png"
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,400;0,700;1,400;1,700&display=swap",
    },
  ],
});

const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>