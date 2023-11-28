<template>
  <div class="input-group flex-1 relative">
    <textarea :value="props.modelValue" :type="props.type" :required="props.required" :disabled="props.disabled"
      :readonly="props.readonly" :placeholder="props.label || props.placeholder"
      class="transition duration-200 w-full rounded-md px-2 py-2 bg-slate-600 outline-none border border-gray-400 focus:ring-2 focus:ring-white hover:border-white"
      :class="props.inputClasses" @input="onChange">
    </textarea>
    <label v-if="props.label"
      class="select-none transition-all duration-200 text-gray-400 px-2 absolute left-0 top-[50%] opacity-0 bg-transparent border-t border-l border-r border-transparent transform translate-y-[-50%]"
      :class="{ 'show': !!props.modelValue }">{{ props.label }}</label>
  </div>
</template>

<script setup lang="ts">
import type { InputTypeHTMLAttribute } from 'vue';

const props = defineProps<{
  modelValue?: any,
  type?: InputTypeHTMLAttribute,
  label?: string,
  placeholder?: string,
  inputClasses?: any,
  required?: boolean,
  disabled?: boolean,
  readonly?: boolean,
}>()

const emit = defineEmits<{
  (e: "update:modelValue", v: any): void;
}>();

function onChange(ev: Event) {
  if (ev.target instanceof HTMLTextAreaElement) {
    emit('update:modelValue', ev.target.value)
  }
}
</script>

<style scoped>
.input-group label.show {
  @apply opacity-100 scale-75 left-0 -top-1 bg-slate-600 text-white border-white;
}
</style>