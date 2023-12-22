<template>
  <MumeContainer class="flex flex-col justify-center items-center gap-y-2 min-w-[400px]">
    <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl  font-bold">
      Notice: การหยุดการออก Token MATN1
    </h3>
    <div class="px-4 py-2 w-full max-w-5xl text-center my-2">
      เนื่องจากเปิด Bug ที่ไม่น่าให้อภัยของ Smart Contract <NuxtLink
        href="https://exp-l1.jibchain.net/token/0x7650339946CfEaE8E8EFe34f85cAbE032612d7b4?tab=contact_code" external
        class="underline">MumeArtToyNft1</NuxtLink> ที่ทำให้ใครก็ได้สามารถซื้อ NFT
      โดยไม่ได้รับความยินยอมจากเจ้าของได้ (เจ้าของยังได้เงินจากการขายอยู่ดี) ทำให้ต้องหยุดการออก Token MATN1
      อย่างไรก็ตามกำลังพัฒนา Token Version 2 เพื่อแก้ไขปัญหาดังกล่าวนี้ หากแก้ไขได้แล้วจะทำการใช้ Token ใหม่นี้
    </div>
    <div class="w-full max-w-5xl text-center my-1">
      Update 2023-12-22: อัพเดทใช้เป็น Token Version 2 แล้ว
      <NuxtLink href="https://exp-l1.jibchain.net/token/0x85BB3FeAAfFfd526856Eac03E8E8f5d52B752Ca2" external
        class="underline">(MumeArtToyNft2)</NuxtLink>
    </div>
    <div class="flex flex-row justify-center my-2">
      <NuxtLink href="/">
        <MumeButton type="button">
          Home Page
        </MumeButton>
      </NuxtLink>
    </div>
    <MumeFixedBar></MumeFixedBar>
  </MumeContainer>
</template>

<script setup lang="ts">
useHead({
  title: "MUME Art-Toy | Apologize MATN1",
});

</script>