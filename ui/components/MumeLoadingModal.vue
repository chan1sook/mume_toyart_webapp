<template>
  <div class="z-50 fixed inset-0 bg-gray-500/50 flex flex-row overflow-y-auto">
    <div class="m-auto bg-slate-600 rounded shadow px-12 py-6 flex flex-col items-center gap-y-2">
      <Icon name="uil:spinner-alt" size="48" class="animate-spin" />
      <div class="animate-pulse flex flex-row items-baseline gap-x-1">
        <span>{{ props.loadingText }}</span>
        <span v-for="i of 3" class="inline-block w-1 h-1 bg-white rounded-full"></span>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
const props = withDefaults(defineProps<{
  loadingText?: string,
}>(), {
  loadingText: "Loading",
});
</script>
