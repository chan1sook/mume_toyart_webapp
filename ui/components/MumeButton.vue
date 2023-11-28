<template>
  <button :type="props.type"
    class="transition-all duration-200 rounded-md px-2 py-2 sm:px-4 bg-slate-600 outline-none border border-gray-400 focus:border-white focus:ring-2 focus:ring-white hover:border-white disabled:border-gray-400 disabled:text-white/50"
    :class="props.btnClasses" :disabled="props.disabled" @click="emit('click')">
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: "button" | "submit" | "reset" | undefined,
  btnClasses?: any,
  disabled?: boolean,
}>(), {
  type: "button"
});

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>