<template>
  <NuxtLink :href="props.href" :title="props.title"
    class="px-2 py-2 inline-flex flex-col gap-y-1 items-center hover:bg-white/10 active:bg-white/20">
    <Icon v-if="props.icon" :name="props.icon" size="2em" />
    <slot></slot>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  href?: string,
  title?: string,
  icon?: string,
}>(), {
});
</script>