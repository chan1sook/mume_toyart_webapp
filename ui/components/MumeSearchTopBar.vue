<template>
  <div class="px-4 py-2 bg-slate-700 border-b-2 shadow border-gray-400 flex flex-row gap-x-2">
    <div class="flex-1 flex flex-row">
      <MumeInput type="search" placeholder="Search" :model-value="props.modelValue" input-classes="rounded-r-none"
        required @input="onChange" />
      <MumeButton btn-classes="rounded-l-none p-0 flex flex-col items-center" :disabled="!props.modelValue"
        @click="searchItem(props.modelValue)">
        <Icon name="mdi:magnify" size="1.5em" />
      </MumeButton>
      <NuxtLink href="/admin/add-item" title="Add Item"
        class="ml-2 transition duration-200 px-2 py-1 flex flex-row gap-x-1 items-center hover:bg-white/10 active:bg-white/20">
        <Icon name="uil:plus" size="1.5em" />
        <span class="hidden sm:inline">Add Item</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string,
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "search", v: string): void;
}>();

function onChange(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    emit('update:modelValue', ev.target.value)
  }
}

function searchItem(keyword?: string) {
  if (!keyword) {
    return;
  }

  emit("search", keyword);
}
</script>