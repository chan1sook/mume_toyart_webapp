<template>
  <div>
    <slot></slot>
  </div>
</template>
  
<script setup lang="ts">
useHead({
  title: "MUME Art-Toy",
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

</script>



<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>