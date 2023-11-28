<template>
  <div class="w-full flex flex-row items-center gap-x-2">
    <input ref="input" type="file"
      class="hidden transition-all rounded outline-none duration-200 file:border-white file:mr-4 file:py-2 file:font-[Kanit] file:px-4 file:text-white file:rounded file:border file:bg-slate-600 hover:file:bg-slate-400 focus:outline-2 focus:outline-white"
      :accept="props.accept" :multiple="props.multiple" @change="onchange" />
    <MumeButton @click="openFile">
      Select File
    </MumeButton>
    <div v-if="props.selectedText" class="inline-block">{{ props.selectedText }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  accept?: string
  multiple?: boolean
  selectedText?: string,
}>()
const input: Ref<HTMLInputElement | null> = ref(null);

const emit = defineEmits<{
  (e: "change", v: Event): void;
}>();

function onchange(ev: Event) {
  emit('change', ev)
}

function openFile() {
  if (input.value) {
    input.value.click();
  }
}
</script>