<template>
  <div class="w-12 h-12 rounded-full relative flex flex-row justify-center items-center bg-slate-600 border"
    :title="props.title || props.name">
    <slot>
      <span>{{ props.name }}</span>
    </slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  name: string,
  title?: string,
}>();

</script>

<style></style>