<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emit = defineEmits<{
  (e: "uploaded", payload: any): void;
  (e: "close"): void;
}>();

const title = ref("");
const topic = ref("");
const schedule = ref(false);
const dateTime = ref<string>(new Date().toISOString().slice(0, 16));
const file = ref<File | null>(null);
const isUploading = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target?.files?.length) file.value = target.files[0];
}

function clearAll() {
  title.value = "";
  topic.value = "";
  schedule.value = false;
  dateTime.value = new Date().toISOString().slice(0, 16);
  file.value = null;
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function onClear() {
  if (isUploading.value) isUploading.value = false;
  clearAll();
  emit("close");
}

async function uploadFile() {
  if (!file.value || !title.value.trim() || !topic.value.trim()) {
    alert("Please fill in Title, Topic(s) and choose a file.");
    return;
  }

  isUploading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate upload
    if (!isUploading.value) return;

    emit("uploaded", {
      subject: title.value,
      fileName: file.value.name,
      uploadDate: schedule.value
          ? dateTime.value.split("T")[0]
          : new Date().toISOString().slice(0, 10),
      topic: topic.value,
      fileUrl: "#",
      scheduled: schedule.value,
      scheduledAt: schedule.value ? dateTime.value : null,
    });

    clearAll();
    isUploading.value = false;
  } catch {
    isUploading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 font-sans">
    <!-- Upload Area -->
    <div
        class="border-2 border-dashed border-input rounded-2xl p-10 text-center hover:bg-accent hover:border-accent-foreground transition cursor-pointer"
        @click="fileInputRef?.click()"
    >
      <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          @change="onFileSelect"
      />
      <p class="text-base font-semibold text-muted-foreground">Drag here</p>
      <p class="text-sm font-normal text-muted-foreground">or click to browse</p>
      <p v-if="file" class="mt-3 text-sm font-medium text-foreground">
        Selected: {{ file.name }}
      </p>
    </div>

    <!-- Slide details -->
    <div class="border-t pt-4">
      <h3 class="text-sm font-semibold text-muted-foreground mb-2">Slide details</h3>
      <div class="flex flex-col gap-3">
        <Label for="title" class="text-sm font-medium">Title</Label>
        <Input id="title" v-model="title" placeholder="Enter title" class="text-sm font-normal" />

        <Label for="topic" class="text-sm font-medium">Topic(s)</Label>
        <Input id="topic" v-model="topic" placeholder="Enter topic(s)" class="text-sm font-normal" />
      </div>
    </div>

    <!-- Schedule -->
    <div class="border-t pt-4">
      <h3 class="text-sm font-semibold text-muted-foreground mb-2">Upload details</h3>
      <div class="flex items-center gap-2">
        <!-- Custom Toggle Switch -->
        <label class="toggle-container">
          <input type="checkbox" v-model="schedule" class="toggle-input"/>
          <span class="toggle-slider"></span>
        </label>
        <Label for="schedule" class="text-sm font-medium">Schedule upload</Label>
      </div>

      <div v-if="schedule" class="mt-3">
        <Input
            type="datetime-local"
            v-model="dateTime"
            class="w-full text-sm font-normal"
        />
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex py-4 gap-3">
      <Button
          variant="outline"
          class="flex items-center gap-2 px-3 py-2 text-sm font-medium"
          @click="onClear"
      >
        Clear
      </Button>

      <Button
          @click="uploadFile"
          :disabled="isUploading"
          class="text-sm font-semibold"
      >
        {{ isUploading ? "Uploading..." : "Upload" }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Style for the toggle switch */
.toggle-container {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  border-radius: 50%;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

.toggle-input:checked + .toggle-slider {
  background-color: #4CAF50;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}
</style>
