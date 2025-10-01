<script setup lang="ts">
import UploadsModal from "~/components/dashboard/lecturer/UploadsModal.vue";
import { ref, onMounted, reactive } from "vue";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/composables/useAuth";
import { useApiFetch } from "@/composables/useApiFetch";

const open = ref(false);
const modules = ref<any[]>([]); // list of modules
const slidesByModule = reactive<Record<string, any[]>>({}); // slides grouped by module_code
const challengesByModule = reactive<Record<string, any[]>>({}); // challenges grouped by module_code

const { apiFetch } = useApiFetch();
const { user, isAuthenticated, fetchUser } = useAuth();
const token = ref<string | null>(null);

async function initAuth() {
  if (!isAuthenticated.value) {
    const u = await fetchUser();
    if (!u) return;
  }
  token.value = localStorage.getItem("access_token");
}
await initAuth();

// Fetch modules
async function fetchModules() {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const res = await apiFetch("/admin/", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    modules.value = res;
  } catch (err) {
    console.error("Failed to fetch modules", err);
  }
}

// Fetch slides per module
async function fetchSlides() {
  if (!token.value) await initAuth();
  if (!token.value || !modules.value.length) return;

  try {
    for (const mod of modules.value) {
      const res = await apiFetch(`/slides/?module_code=${mod.code}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      slidesByModule[mod.code] = res;
    }
  } catch (err) {
    console.error("Failed to fetch slides:", err);
  }
}

// Fetch challenges per module
async function fetchChallenges() {
  if (!token.value) await initAuth();
  if (!token.value || !modules.value.length) return;

  try {
    for (const mod of modules.value) {
      const res = await apiFetch(`/admin/${mod.code}/challenges`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      challengesByModule[mod.code] = res;
    }
  } catch (err) {
    console.error("Failed to fetch challenges:", err);
  }
}

// Publish a challenge
async function publishChallenge(moduleCode: string, challengeId: string) {
  if (!token.value) await initAuth();
  try {
    await apiFetch(`/admin/${moduleCode}/challenges/${challengeId}/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` },
    });
    const challenge = challengesByModule[moduleCode].find(c => c.id === challengeId);
    if (challenge) challenge.is_active = true;
  } catch (err) {
    console.error("Failed to publish challenge:", err);
  }
}

// Handle new file upload
function handleUploaded(file: any) {
  if (!slidesByModule[file.subject]) slidesByModule[file.subject] = [];
  slidesByModule[file.subject].push(file);
  open.value = false;
}

onMounted(async () => {
  await fetchModules();
  await fetchSlides();
  await fetchChallenges();
});

import { computed } from "vue";

// reactive for current week
const currentWeek = ref<number | null>(null);

// derive current week from semester start date
function calculateCurrentWeek() {
  if (!modules.value.length) return;

  // pick first module's semester start date
  const firstModule = modules.value[0];
  const startDateStr = firstModule.semester_start_date; // e.g., "2025-09-01"
  if (!startDateStr) return;

  const startDate = new Date(startDateStr);
  const now = new Date();

  // difference in days
  const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;

  currentWeek.value = week >= 1 && week <= 12 ? week : null;
}

// call after modules are fetched
onMounted(async () => {
  await fetchModules();
  calculateCurrentWeek();
  await fetchSlides();
  await fetchChallenges();
});

</script>

<template>
  <div class="space-y-10">
    <div class="mb-4">
      <h2 class="text-xl font-semibold">
        Current Week: <span v-if="currentWeek">{{ currentWeek }}</span><span v-else>N/A</span>
      </h2>
    </div>

    <!-- Slides Table -->
    <div>
      <div class="flex justify-between mb-4 items-center">
        <h3 class="text-lg font-semibold">Module Slides</h3>
        <Button variant="outline" class="flex items-center gap-2 px-3 py-2" @click="open = true">
          <span class="text-sm font-medium">New file upload</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Module Name</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Slides Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="mod in modules" :key="mod.id" collapsible>
            <template #default>
              <TableCell>{{ mod.name }}</TableCell>
              <TableCell>{{ mod.code }}</TableCell>
              <TableCell>{{ slidesByModule[mod.code]?.length || 0 }}</TableCell>
            </template>

            <template #expanded>
              <TableRow
                  v-for="slide in slidesByModule[mod.code] || []"
                  :key="slide.fileName"
                  class="bg-muted/20"
              >
                <template #default>
                  <TableCell />
                  <TableCell colspan="2">{{ slide.fileName }}</TableCell>
                  <TableCell>{{ slide.uploadDate }}</TableCell>
                  <TableCell>{{ slide.topic }}</TableCell>
                  <TableCell>
                    <a :href="slide.fileUrl" class="text-blue-600 hover:underline">Download</a>
                  </TableCell>
                </template>
              </TableRow>
            </template>
          </TableRow>
        </TableBody>
      </Table>

      <Dialog v-model:open="open">
        <DialogContent class="w-full max-w-full sm:max-w-xl md:max-w-3xl p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle class="text-sm sm:text-base">Upload new file</DialogTitle>
          </DialogHeader>

          <UploadsModal @close="open = false" @uploaded="handleUploaded" />
        </DialogContent>
      </Dialog>
    </div>

    <!-- Challenges Table -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Module Challenges</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Module Name</TableHead>
            <TableHead>Module Code</TableHead>
            <TableHead>Challenges Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="mod in modules" :key="mod.id" collapsible>
            <template #default>
              <TableCell>{{ mod.name }}</TableCell>
              <TableCell>{{ mod.code }}</TableCell>
              <TableCell>{{ challengesByModule[mod.code]?.length || 0 }}</TableCell>
            </template>

            <template #expanded>
              <TableRow
                  v-for="challenge in challengesByModule[mod.code] || []"
                  :key="challenge.id"
                  class="bg-muted/20"
              >
                <template #default>
                  <TableCell />
                  <TableCell colspan="2">{{ challenge.title }}</TableCell>
                  <TableCell /> <!-- week id / badge -->
                </template>
              </TableRow>
            </template>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
