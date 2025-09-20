<script setup lang="ts">
import { ref } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuth } from "@/composables/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emit = defineEmits<{
  (e: "uploaded", payload: any): void;
  (e: "close"): void;
}>()

const config = useRuntimeConfig()
const { user, isAuthenticated, fetchUser } = useAuth()
const token = ref<string | null>(null)

const title = ref("");
const topic = ref("");
const schedule = ref(false);
const dateTime = ref<string>(new Date().toISOString().slice(0, 16));
const file = ref<File | null>(null);
const isUploading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

async function initAuth() {
  if (!isAuthenticated.value) {
    const u = await fetchUser()
    if (!u) return
  }
  token.value = localStorage.getItem('access_token')
}

initAuth()

function clearAll() {
  title.value = "";
  topic.value = "";
  schedule.value = false;
  dateTime.value = new Date().toISOString().slice(0, 16);
  file.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function onCancel() {
  clearAll()
  emit("close")
}

function onClear() {
  if (isUploading.value) isUploading.value = false;
  clearAll();
}

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target?.files?.length) return;
  file.value = target.files[0];
}

async function uploadFile() {
  if (!file.value || !title.value.trim() || !topic.value.trim()) {
    alert("Please fill in Title, Topic(s) and choose a file.");
    return
  }

  if (!token.value) {
    await initAuth()
    if (!token.value) {
      alert("You must be logged in to upload slides");
      return
    }
  }

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append("file", file.value)

    const params: Record<string, any> = {
      topic_name: topic.value,
      include_signed_url: true,
      signed_ttl_sec: 900
    }
    if (schedule.value && dateTime.value) {
      params.given_at_iso = new Date(dateTime.value).toISOString()
    }

    const result = await $fetch(`${config.public.apiBase}/slides/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params
    })

    emit("uploaded", {
      subject: title.value,
      fileName: file.value.name,
      uploadDate: schedule.value
          ? dateTime.value.split("T")[0]
          : new Date().toISOString().slice(0, 10),
      topic: topic.value,
      fileUrl: result?.signed_url ?? "#",
      scheduled: schedule.value,
      scheduledAt: schedule.value ? dateTime.value : null,
    })

    clearAll()
    emit("close") // close modal after successful upload
  } catch (err: any) {
    console.error("Upload error:", err)
    alert("Upload failed. Please try again.");
  } finally {
    isUploading.value = false
  }
}

//TODO:add dropdown for subjects and show subjects the lecturer has
//TODO:analuze the slides and show recommended title / topics in the input fields
</script>

<template>
  <div class="flex flex-col gap-4 p-2 sm:p-6">
    <!-- Upload Area -->
    <div
        class="border-2 border-dashed border-input rounded-2xl p-6 sm:p-10 text-center hover:bg-accent hover:border-accent-foreground transition cursor-pointer"
        @click="fileInputRef?.click()"
    >
      <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          @change="onFileSelect"
      />
      <p class="font-semibold text-sm sm:text-base">
        Drag here
      </p>
      <p class=" text-neutral-500 text-xs sm:text-sm">
        or click to browse
      </p>
      <p v-if="file" class="mt-2 sm:mt-3 text-xs sm:text-sm">
        Selected: {{ file.name }}
      </p>
    </div>

    <!-- Slide details -->
    <div class="border-t pt-3 sm:pt-4">
      <h3 class=" font-semibold mb-2 text-sm sm:text-base">Slide details</h3>
      <div class="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
        <Label for="title" class="text-sm sm:text-base">Title</Label>
        <Input
            id="title"
            v-model="title"
            placeholder="Enter title"
            class="w-full"
        />

        <Label for="topic" class="mt-2 text-sm sm:text-base">Topic(s)</Label>
        <Input
            id="topic"
            v-model="topic"
            placeholder="Enter topic(s)"
            class="w-full"
        />
      </div>
    </div>

    <!-- Schedule -->
    <div class="border-t pt-3 sm:pt-4">
      <h3 class=" font-semibold pb-2 text-sm sm:text-base">Upload details</h3>
      <div class="flex items-center gap-2 pt-2 sm:pt-4">
        <Toggle v-model:pressed="schedule" />
        <Label for="schedule" class="text-sm sm:text-base">
          Schedule upload
        </Label>
      </div>

      <div v-if="schedule" class="mt-2 sm:mt-3">
        <Input
            type="datetime-local"
            v-model="dateTime"
            class="w-full"
        />
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row py-2 sm:py-4 gap-2 sm:gap-3 w-full">
      <Button
          variant="link"
          class="w-full sm:w-auto"
          @click="onClear"
      >
        Clear
      </Button>
      <Button
          variant="outline"
          class="w-full sm:w-auto"
          @click="onCancel"
      >
        Cancel
      </Button>

      <Button
          class="w-full sm:w-auto"
          @click="uploadFile"
          :disabled="isUploading"
      >
        {{ isUploading ? "Uploading..." : "Upload" }}
      </Button>
    </div>
  </div>
</template>
