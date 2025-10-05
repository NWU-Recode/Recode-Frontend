<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRuntimeConfig } from "#app";
import { useAuth } from "@/composables/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useApiFetch } from "@/composables/useApiFetch";

const emit = defineEmits<{
  (e: "uploaded", payload: any[]): void;
  (e: "close"): void;
}>();

const config = useRuntimeConfig();
const { user, isAuthenticated, fetchUser } = useAuth();
const { apiFetch } = useApiFetch();

const token = ref<string | null>(null);

interface FileItem {
  file: File;
  subject: string;
  title: string;
  topic: string;
  schedule: boolean;
  scheduledAt: string;
}
const files: FileItem[] = reactive([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

// Modules fetched from API
const modules = ref<string[]>([]);

async function initAuth() {
  if (!isAuthenticated.value) {
    const u = await fetchUser();
    if (!u) return;
  }
  token.value = localStorage.getItem("access_token");
}
initAuth();

// Fetch modules from API
async function fetchModules() {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const res = await apiFetch("/admin/", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    // Assume res is an array of objects with `code` property
    modules.value = res.map((m: any) => m.code);
  } catch (err) {
    console.error("Failed to fetch modules", err);
  }
}

onMounted(() => {
  fetchModules();
});

function onFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target?.files?.length) return;

  for (const f of Array.from(target.files)) {
    files.push({
      file: f,
      subject: modules.value[0] || "",
      title: f.name.replace(/\.[^/.]+$/, ""),
      topic: "",
      schedule: false,
      scheduledAt: new Date().toISOString().slice(0, 16),
    });
  }
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function removeFile(index: number) {
  files.splice(index, 1);
}

function clearAll() {
  files.splice(0, files.length);
  if (fileInputRef.value) fileInputRef.value.value = "";
}

function onCancel() {
  clearAll();
  emit("close");
}

async function uploadAll() {
  if (!files.length) {
    alert("Please select files to upload.");
    return;
  }

  for (const f of files) {
    if (!f.subject || !f.title.trim() || !f.topic.trim()) {
      alert("Please fill in Subject, Title, and Topic for all files.");
      return;
    }
  }

  if (!token.value) {
    await initAuth();
    if (!token.value) {
      alert("You must be logged in to upload slides");
      return;
    }
  }

  isUploading.value = true;

  try {
    const formData = new FormData();
    for (const f of files) {
      formData.append("files", f.file);
    }

    const params = {
      module_code: files[0].subject,
      include_signed_url: true,
      signed_ttl_sec: 900,
    };

    const result = await $fetch(`${config.public.apiBase}/slides/batch-upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      params,
    });

    emit(
        "uploaded",
        files.map((f) => ({
          subject: f.subject,
          fileName: f.file.name,
          uploadDate: f.schedule
              ? f.scheduledAt.split("T")[0]
              : new Date().toISOString().slice(0, 10),
          topic: f.topic,
          scheduled: f.schedule,
          scheduledAt: f.schedule ? f.scheduledAt : null,
          fileUrl: result?.signed_url ?? "#",
        }))
    );

    clearAll();
    emit("close");
  } catch (err: any) {
    console.error("Batch upload error:", err);
    alert("Upload failed. Please try again.");
  } finally {
    isUploading.value = false;
  }
}
</script>


<template>
  <div class="flex flex-col h-[80vh]">
    <!-- Sticky file selection -->
    <div
        class="border-2 border-dashed border-input rounded-2xl p-6 sm:p-10 text-center
             hover:bg-accent hover:border-accent-foreground transition cursor-pointer
             sticky top-0 bg-background z-10"
        @click="fileInputRef?.click()"
    >
      <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          multiple
          @change="onFileSelect"
      />
      <p class="font-semibold text-sm sm:text-base">Drag here</p>
      <p class="text-neutral-500 text-xs sm:text-sm">or click to browse</p>
    </div>

    <!-- Scrollable cards section -->
    <div class="flex-1 overflow-y-auto mt-4 space-y-4 px-1 sm:px-0">
      <div
          v-for="(f, i) in files"
          :key="i"
          class="border rounded-xl p-4 shadow flex flex-col gap-2 w-full"
      >
        <div class="flex justify-between items-start">
          <h4 class="font-semibold truncate">File: {{ f.file.name }}</h4>
          <Button variant="link" size="sm" @click="removeFile(i)">Remove</Button>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
          <!-- Subject Dropdown -->
          <div class="flex-1">
            <Label>Subject</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                  class="w-full px-2 py-1 border rounded-md shadow-sm cursor-pointer flex items-center justify-between"
              >
                {{ f.subject || "Select a subject" }}
              </DropdownMenuTrigger>

              <DropdownMenuContent class="w-full">
                <DropdownMenuItem
                    v-for="subj in subjects"
                    :key="subj"
                    @click="f.subject = subj"
                >
                  {{ subj }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <!-- Title -->
          <div class="flex-1">
            <Label>Title</Label>
            <Input v-model="f.title" placeholder="Enter title" />
          </div>

          <!-- Topic -->
          <div class="flex-1">
            <Label>Topic(s)</Label>
            <Input v-model="f.topic" placeholder="Enter topic(s)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons at bottom (outside scrollable section) -->
    <div class="flex flex-col sm:flex-row gap-2 mt-2 bg-background p-2 sm:p-0">
      <Button variant="link" @click="clearAll" class="w-full sm:w-auto">Clear</Button>
      <Button variant="outline" @click="onCancel" class="w-full sm:w-auto">Cancel</Button>
      <Button @click="uploadAll" :disabled="isUploading" class="w-full sm:w-auto">
        {{ isUploading ? "Uploading..." : "Upload All" }}
      </Button>
    </div>
  </div>
</template>

