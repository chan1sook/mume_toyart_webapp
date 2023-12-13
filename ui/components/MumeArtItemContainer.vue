<template>
  <div class="transition duration-200 w-64 px-2 py-2 flex flex-row gap-x-2 items-center cursor-pointer hover:bg-white/10"
    @click="emit('click', props.item.itemId)">
    <img :src="props.item.image ? getImagePath(props.item.image) : getFakeImagePath('0')"
      class="w-20 border border-gray-400 rounded my-2" loading="lazy" />
    <div class="flex flex-col">
      <div class="whitespace-nowrap text-ellipsis">{{ props.item.name }}</div>
      <div class="text-sm">
        <span title="MAC">
          <Icon name="material-symbols:network-node" />:
        </span>
        {{ props.item.mac || '-' }}
      </div>
      <div v-if="props.item.nftId" class="text-sm">
        <span title="NFT #:">
          <Icon name="ri:nft-fill" />:
        </span>
        {{ props.item.nftId }}
      </div>
      <div v-else class="text-sm">
        <span title="Owner">
          <Icon name="uil:user" />:
        </span>
        {{ props.item.owner || '-' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getImagePath, getFakeImagePath } from "~/utils/path";

const props = defineProps<{
  item: ArtSearchResponse,
}>();


const emit = defineEmits<{
  (e: "click", v: string): void;
}>();
</script>