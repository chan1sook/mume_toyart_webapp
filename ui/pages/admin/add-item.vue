<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <div class="flex-1 flex flex-col overflow-y-auto">
      <form class="w-full p-4 flex flex-col justify-center items-center gap-y-2" @submit.prevent="addItem">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          New Item
        </h3>
        <div class="custom-grid gap-x-2 gap-y-2 w-full max-w-5xl">
          <div class="pt-2">Name</div>
          <div>
            <MumeInput v-model="itemData.name" type="input" placeholder="Name" required />
          </div>
          <div class="pt-2">MAC</div>
          <div>
            <MumeInput v-model="itemData.mac" type="input" placeholder="MAC" />
          </div>
          <div class="pt-2">Description</div>
          <div>
            <MumeTextArea v-model="itemData.description" type="input" placeholder="Description" required />
          </div>
          <div class="pt-2">Preview Images</div>
          <div class="flex flex-col gap-y-1">
            <MumeFileInput accept="image/*" multiple :selectedText="selectedImageFileText" @change="updateImageFiles" />
            <div class="text-sm">Limit 2MiB/each</div>
          </div>
          <div></div>
          <div class="flex flex-col gap-y-2">
            <div v-for="(link, i) of sortedImageLinks"
              class="flex flex-row items-center gap-x-2 border-b border-gray-400 last:border-0 hover:bg-white/10">
              <div class="flex flex-col gap-y-1">
                <div v-if="false" class="cursor-pointer" title="To Top">
                  <Icon name="uil:angle-double-up" size="2em"
                    class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Up" @click="moveImageUp(i)">
                  <Icon name="uil:angle-up" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Down" @click="moveImageDown(i)">
                  <Icon name="uil:angle-down" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div v-if="false" class="cursor-pointer" title="To Bottom">
                  <Icon name="uil:angle-double-down" size="2em"
                    class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
              </div>
              <div class="flex-1 flex flex-row">
                <img :src="link.link" class="mx-auto h-20 border border-gray-400 rounded" />
              </div>
              <div class="cursor-pointer" title="Remove" @click="removeImage(i)">
                <Icon name="uil:trash-alt" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
              </div>
            </div>
          </div>
          <div class="pt-2">Owner</div>
          <div>
            <MumeInput v-model="itemData.owner" type="input" placeholder="Owner" />
          </div>
          <div class="pt-2">Certificate</div>
          <div class="flex flex-col gap-y-1">
            <MumeFileInput accept="application/pdf" :selectedText="selectedCertFileText"
              @change="updateCertificateFile" />
            <div class="text-sm">Limit 20MiB</div>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <MumeButton type="submit" :disabled="!isFormValid || formLoading" title="Save"
            class="flex flex-row gap-x-2 items-center">
            <Icon name="uil:save" />
            <span class="hidden sm:inline">Save</span>
          </MumeButton>
        </div>
      </form>
    </div>
    <ClientOnly>
      <Transition name="fade">
        <MumeLoadingModal v-if="formLoading" />
      </Transition>
    </ClientOnly>
  </MumeContainer>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";

useHead({
  title: `MUME Art-Toy | Add Item`,
});

definePageMeta({
  middleware: ["auth-user", "auth-dev"],
});

const itemData = ref({
  name: "",
  mac: "",
  description: "",
  owner: "",
})
const sortedImageLinks: Ref<BrowserUploadFileData[]> = ref([])
const certificateFile: Ref<File | undefined> = ref(undefined);
const isFormValid = computed(() => {
  return itemData.value.name !== "" && !!certificateFile.value
});
const formLoading = ref(false);
const selectedImageFileText = computed(() => {
  return sortedImageLinks.value.length > 0 ? `Selected ${sortedImageLinks.value.length} File(s)` : ''
})
const selectedCertFileText = computed(() => {
  return certificateFile.value ? certificateFile.value.name : 'No File Selected'
})
function updateImageFiles(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files) {
      for (const file of files) {
        sortedImageLinks.value.push({
          link: URL.createObjectURL(file), file: file,
        })
      }
    }
  }
}

function moveImageUp(i: number) {
  if (i > 0 && i < sortedImageLinks.value.length) {
    const prevIndex = i - 1;
    const prevElement = sortedImageLinks.value[prevIndex];
    const targetElement = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(prevIndex, 2, targetElement, prevElement);
  }
}

function moveImageDown(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length - 1) {
    const targetElement = sortedImageLinks.value[i];
    const nextElement = sortedImageLinks.value[i + 1];
    sortedImageLinks.value.splice(i, 2, nextElement, targetElement);
  }
}

function removeImage(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length) {
    const oldLink = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(i, 1);

    URL.revokeObjectURL(oldLink.link);
  }
}

function updateCertificateFile(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files && files[0]) {
      certificateFile.value = files[0];
    }
  }
}

async function uploadImage(fileData: BrowserUploadFileData) {
  if (!fileData.file) {
    return fileData.link;
  }

  try {
    const formData = new FormData();
    formData.append("image", fileData.file);

    const { data, error } = await useFetch("/mapi/upload/image", {
      method: "post",
      body: formData,
      key: fileData.link,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get File Path");
    }

    return (data.value as UploadFileResponse).path;

  } catch (err) {
    let message = "Can't Upload Image";
    if (err instanceof Error) {
      message = err.message
    }
    console.error(message || err);
    return null;
  }
}

async function uploadCert(file?: File) {
  if (!file) {
    throw new Error("No File Found");
  }

  try {
    const formData = new FormData();
    formData.append("cert", file);

    const { data, error } = await useFetch("/mapi/upload/cert", {
      method: "post",
      body: formData,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get File Path");
    }

    return (data.value as UploadFileResponse).path;

  } catch (err) {
    let message = "Can't Upload Cert File";
    if (err instanceof Error) {
      message = err.message
    }

    throw new Error(message);
  }
}

async function addItem() {
  if (!isFormValid.value || formLoading.value) {
    return;
  }

  formLoading.value = true;
  try {
    const imgPaths = await Promise.all(sortedImageLinks.value.map(uploadImage));
    const certPath = await uploadCert(certificateFile.value);

    const bodyData = {
      name: itemData.value.name,
      mac: itemData.value.mac,
      description: itemData.value.description,
      owner: itemData.value.owner,
      imagePaths: imgPaths,
      certificatePath: certPath,
    }

    const { data, error } = await useFetch("/mapi/artitem/add", {
      method: "post",
      body: bodyData,
    });

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get New Item Data");
    }

    useToast().success("Add Item Successful!", {
      timeout: 5000
    });

    const id = (data.value as { artItem: ArtItemResponse }).artItem.itemId;
    navigateTo(`/art/${id}`);
  } catch (err) {
    console.error(err);

    let message = "Can't Add Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });

    formLoading.value = false;
  }
}
</script>

<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>
