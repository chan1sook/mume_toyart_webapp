<template>
  <MumeContainer class="flex flex-col min-w-[400px]">
    <div class="flex-1 flex flex-col overflow-y-auto">
      <form class="w-full p-4 flex flex-col justify-center items-center gap-y-2" @submit.prevent="editItem">
        <h3 class="transition-all duration-200 my-4 text-2xl transform scale-y-110 sm:text-3xl font-bold">
          Edit Item #{{ id }}
        </h3>
        <div class="custom-grid gap-x-2 gap-y-2 w-full max-w-5xl">
          <div class="pt-2">ID</div>
          <div>
            <MumeInput :model-value="id" type="input" readonly />
          </div>
          <div class="pt-2">Name</div>
          <div>
            <MumeInput v-model="itemData.name" type="input" placeholder="Name" required />
          </div>
          <div class="pt-2">Description</div>
          <div>
            <MumeTextArea v-model="itemData.name" type="input" placeholder="Description" required />
          </div>
          <div class="pt-2">Preview Images</div>
          <div class="flex flex-col gap-y-1">
            <div class="flex flex-row gap-x-2 items-center">
              <MumeFileInput accept="image/*" multiple :selectedText="selectedImageFileText" @change="updateImageFiles" />
              <MumeButton type="button" title="Reset" class="flex flex-row gap-x-2 items-center" @click="resetImages">
                <Icon name="uil:redo" />
                <span class="hidden sm:inline">Reset</span>
              </MumeButton>
            </div>
            <div class="text-sm">Limit 2MiB/each</div>
          </div>
          <div></div>
          <div>
            <div v-for="(linkData, i) of sortedImageLinks"
              class="flex flex-row items-center gap-x-2 border-b border-gray-400 last:border-0 hover:bg-white/10">
              <div class="flex flex-col gap-y-1">
                <div class="cursor-pointer" title="Up" @click="moveImageUp(i)">
                  <Icon name="uil:angle-up" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
                <div class="cursor-pointer" title="Down" @click="moveImageDown(i)">
                  <Icon name="uil:angle-down" size="2em" class="transition duration-200 text-gray-300 hover:text-white" />
                </div>
              </div>
              <div class="w-8">
                <Icon v-if="linkData.file" name="uil:asterisk" size="2em" />
              </div>
              <div class="flex-1 flex flex-row">
                <img :src="linkData.file ? linkData.link : getImagePath(linkData.link)"
                  class="mx-auto h-20 border border-gray-400 rounded" />
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
            <div class="flex flex-row gap-x-2 items-center">
              <MumeFileInput accept="application/pdf" :selectedText="selectedCertFileText"
                @change="updateCertificateFile" />
              <MumeButton type="button" title="Reset" class="flex flex-row gap-x-2 items-center">
                <Icon name="uil:redo" />
                <span class="hidden sm:inline">Reset</span>
              </MumeButton>
            </div>
            <div class="text-sm">Limit 20MiB</div>
          </div>
        </div>
        <div class="flex flex-row justify-center">
          <MumeButton type="submit" :disabled="!isFormValid" title="Save" class="flex flex-row gap-x-2 items-center">
            <Icon name="uil:save" />
            <span class="hidden sm:inline">Save</span>
          </MumeButton>
        </div>
      </form>
    </div>
    <Transition name="fade">
      <MumeLoadingModal v-if="itemLoading || formLoading" />
    </Transition>
  </MumeContainer>
</template>

<script lang="ts" setup>
import { useToast } from "vue-toastification";
import { getImagePath } from "~/utils/path";

definePageMeta({
  middleware: ["auth-user", "auth-dev"],
});

const { id } = useRoute().params;

useHead({
  title: `MUME Art-Toy | Edit Item #${id}`,
});

const itemLoading = ref(true);

const itemData = ref({
  name: "",
  description: "",
  owner: "",
});

const originalImagePaths: Ref<string[]> = ref([]);
const imagePathDirty: Ref<boolean> = ref(false);
const originalCertPath: Ref<string> = ref("");
const sortedImageLinks: Ref<BrowserUploadFileData[]> = ref([])
const newCertificateFile: Ref<File | undefined> = ref(undefined);
const formLoading = ref(false);

const isFormValid = computed(() => {
  return itemData.value.name !== ""
});

const selectedImageFileText = computed(() => {
  const newFileList = sortedImageLinks.value.filter((ele) => ele.file);
  if (newFileList.length > 0) {
    return `Add: ${newFileList.length} File(s)`;
  }
  return imagePathDirty.value ? `Changed` : '';
})

const selectedCertFileText = computed(() => {
  if (newCertificateFile.value) {
    return `Updated: ${newCertificateFile.value.name}`;
  }

  return `Old: ${originalCertPath.value}`;
})

async function loadItemData() {
  itemLoading.value = true;

  try {
    const { data, error } = await useFetch(`/mapi/artitem/${id}`);

    if (error.value) {
      let message = error.value.statusMessage;
      if (error.value.data && error.value.data.message) {
        message = error.value.data.message;
      }

      throw new Error(message);
    }

    if (!data.value) {
      throw new Error("Can't Get Item Data");
    }

    const artItem = (data.value as { artItem: ArtItemResponse }).artItem;
    itemData.value = {
      name: artItem.name,
      description: artItem.description,
      owner: artItem.owner,
    }
    originalImagePaths.value = artItem.imagePaths;
    sortedImageLinks.value = artItem.imagePaths.map((ele) => {
      return {
        link: ele,
      };
    })
    originalCertPath.value = artItem.certificatePath;
  } catch (err) {
    console.error(err);

    let message = "Can't Get Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    showError(message);
  }

  itemLoading.value = false;
}

function updateImageFiles(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files) {
      for (const file of files) {
        sortedImageLinks.value.push({
          link: URL.createObjectURL(file), file: file,
        })
      }
      imagePathDirty.value = true;
    }
  }
}

function moveImageUp(i: number) {
  if (i > 0 && i < sortedImageLinks.value.length) {
    const prevIndex = i - 1;
    const prevElement = sortedImageLinks.value[prevIndex];
    const targetElement = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(prevIndex, 2, targetElement, prevElement);
    imagePathDirty.value = true;
  }
}

function moveImageDown(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length - 1) {
    const targetElement = sortedImageLinks.value[i];
    const nextElement = sortedImageLinks.value[i + 1];
    sortedImageLinks.value.splice(i, 2, nextElement, targetElement);
    imagePathDirty.value = true;
  }
}

function removeImage(i: number) {
  if (i >= 0 && i < sortedImageLinks.value.length) {
    const oldLink = sortedImageLinks.value[i];
    sortedImageLinks.value.splice(i, 1);

    if (oldLink.file) {
      URL.revokeObjectURL(oldLink.link);
    }
    imagePathDirty.value = true;
  }
}

function resetImages() {
  const oldLinks = sortedImageLinks.value.filter((ele) => ele.file);
  sortedImageLinks.value = originalImagePaths.value.map((ele) => {
    return {
      link: ele,
    };
  });
  for (const link of oldLinks) {
    if (link.file) {
      URL.revokeObjectURL(link.link);
    }
  }
  imagePathDirty.value = false;
}

function updateCertificateFile(ev: Event) {
  if (ev.target instanceof HTMLInputElement) {
    const files = ev.target.files;
    if (files && files[0]) {
      newCertificateFile.value = files[0];
    }
  }
}

async function uploadImage(fileData: BrowserUploadFileData) {
  if (!fileData.file) {
    return fileData.link; // original file
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

async function editItem() {
  if (!isFormValid.value || formLoading.value) {
    return;
  }

  formLoading.value = true;
  try {
    const imgPaths = await Promise.all(sortedImageLinks.value.map(uploadImage));
    let certPath = originalCertPath.value;
    if (newCertificateFile.value) {
      certPath = await uploadCert(newCertificateFile.value);
    }

    const bodyData = {
      name: itemData.value.name,
      description: itemData.value.description,
      owner: itemData.value.owner,
      imagePaths: imgPaths,
      certificatePath: certPath,
    }

    const { data, error } = await useFetch(`/mapi/artitem/edit/${id}`, {
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
    useToast().success("Edit Item Successful!", {
      timeout: 5000
    });

    navigateTo(`/art/${id}`);
  } catch (err) {
    console.error(err);

    let message = "Can't Edit Item Data";
    if (err instanceof Error) {
      message = err.message
    }

    useToast().error(message, {
      timeout: 5000
    });

    formLoading.value = false;
  }
}

loadItemData();
</script>

<style scoped>
.custom-grid {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>
