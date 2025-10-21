<script setup lang="ts">
import UploadsModal from "~/components/dashboard/lecturer/UploadsModal.vue";
import { ref, onMounted, reactive } from "vue";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/composables/useAuth";
import { useApiFetch } from "@/composables/useApiFetch";
import Ruby from '~/assets/flat-icons/ruby.png'
import Emerald from '~/assets/flat-icons/emerald.png'
import Diamond from '~/assets/flat-icons/diamond.png'
import FunLoader from '~/components/FunLoader.vue'

const isLoading = ref(true)

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

const currentSemester = ref<any>(null);

async function fetchCurrentSemester() {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const semesters = await apiFetch("/semesters/", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    currentSemester.value = semesters.find(s => s.is_current) || null;

    if (!currentSemester.value) {
      console.warn("No current semester found");
    }
  } catch (err) {
    console.error("Failed to fetch semesters:", err);
  }
}

// Fetch modules
async function fetchModules() {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const res = await apiFetch("/admin/", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    // Only keep modules for current semester
    if (currentSemester.value) {
      modules.value = res.filter(m => m.semester_id === currentSemester.value.id);
    } else {
      modules.value = [];
    }
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

      // Sort slides by week_number ascending
      slidesByModule[mod.code] = res.sort((a: any, b: any) => (a.week_number ?? 0) - (b.week_number ?? 0));
    }
  } catch (err) {
    console.error("Failed to fetch slides:", err);
  }
}

async function downloadSlide(slideId: number) {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const res = await apiFetch(`/slides/${slideId}/download`, {
      headers: { Authorization: `Bearer ${token.value}` },
      params: { ttl: 300 }, // optional, default is 300
    });

    if (res.signed_url) {
      window.open(res.signed_url, "_blank"); // open in new tab
    } else {
      console.error("No signed URL returned for slide", slideId);
    }
  } catch (err) {
    console.error("Failed to download slide:", err);
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

      // normalize and add tier icon
      const normalized = res.map((c: any) => ({
        ...c,
        displayWeek: c.challenge_type === 'weekly' ? c.week_number : null,
        tierIcon:
            c.challenge_type === 'special'
                ? c.tier === 'ruby'
                    ? Ruby
                    : c.tier === 'emerald'
                        ? Emerald
                        : c.tier === 'diamond'
                            ? Diamond
                            : null
                : null,
      }));

      // Sort: weekly by week_number, special by release_date or due_date
      challengesByModule[mod.code] = normalized.sort((a: any, b: any) => {
        if (a.challenge_type === 'weekly' && b.challenge_type === 'weekly') {
          return (a.week_number ?? 0) - (b.week_number ?? 0);
        } else if (a.challenge_type === 'special' && b.challenge_type === 'special') {
          const aDate = new Date(a.release_date || a.due_date || 0).getTime();
          const bDate = new Date(b.release_date || b.due_date || 0).getTime();
          return aDate - bDate;
        } else {
          // mixed types: put weekly first
          return a.challenge_type === 'weekly' ? -1 : 1;
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch challenges:", err);
  }
}

// Handle new file upload
function handleUploaded(file: any) {
  if (!slidesByModule[file.subject]) slidesByModule[file.subject] = [];
  slidesByModule[file.subject].push(file);
  open.value = false;
}

// reactive for current week
const currentWeek = ref<number | null>(null);

async function fetchCurrentWeek() {
  if (!token.value) await initAuth();
  if (!token.value) return;

  try {
    const res = await apiFetch("/dashboard/current-week", {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    if (res && typeof res.current_week === "number") {
      currentWeek.value = res.current_week;
    } else {
      currentWeek.value = null;
    }
  } catch (err) {
    console.error("Failed to fetch current week:", err);
    currentWeek.value = null;
  }
}

const challengeStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return { label: 'Closed', color: 'green' }
    case 'active':
      return { label: 'Active', color: 'blue' }
    case 'draft':
      return { label: 'Not active', color: 'red' }
    default:
      return { label: 'Unknown', color: 'gray' }
  }
}

async function fetchAllData() {
  isLoading.value = true
  try {
    await fetchCurrentSemester();
    await fetchModules();
    await Promise.all([
      fetchSlides(),
      fetchChallenges(),
      fetchCurrentWeek(),
    ]);
  } catch (err) {
    console.error('Failed to fetch uploads data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchAllData()
})

</script>

<template>
  <FunLoader v-if="isLoading" />
  <div v-else class="space-y-10">
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
            <TableHead>Module Code</TableHead>
            <TableHead>Module Name</TableHead>
            <TableHead>Slides Count</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="mod in modules" :key="mod.id" collapsible>
            <template #default>
              <TableCell>{{ mod.code }}</TableCell>
              <TableCell>{{ mod.name }}</TableCell>
              <TableCell>{{ slidesByModule[mod.code]?.length || 0 }}</TableCell>
              <TableCell />
            </template>

            <template #expanded>
              <TableRow
                  v-for="slide in slidesByModule[mod.code] || []"
                  :key="slide.fileName"
                  class="bg-muted/20"
              >
                <template #default>
                  <TableCell />
                  <TableCell colspan="1">{{ slide.filename }}</TableCell>
                  <TableCell>{{slide.detected_topic}}</TableCell>
                  <TableCell>Week: {{ slide.week_number }}</TableCell>
                  <TableCell>
                    <Button
                        variant="link"
                        @click="downloadSlide(slide.id)"
                    >
                      Download
                    </Button>
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
            <TableHead>Module Code</TableHead>
            <TableHead>Module Name</TableHead>
            <TableHead>Challenges Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="mod in modules" :key="mod.id" collapsible>
            <template #default>
              <TableCell>{{ mod.code }}</TableCell>
              <TableCell>{{ mod.name }}</TableCell>
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
                  <TableCell colspan="1">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <span class="font-medium">{{ challenge.title }}</span>
                    </div>
                  </TableCell>

                  <!-- Week / Tier -->
                  <TableCell>
                    <template v-if="challenge.challenge_type === 'weekly'">
                      Week {{ challenge.displayWeek }}
                    </template>

                    <template v-else-if="challenge.challenge_type === 'special' && challenge.tierIcon">
                      <span v-if="challenge.displayWeek">Week {{ challenge.displayWeek }}:</span>
                      <img :src="challenge.tierIcon" class="w-6 h-6 inline-block ml-1" />
                    </template>
                  </TableCell>

                  <!-- Status -->
                  <TableCell>
                    <div class="flex items-center gap-2">
                      <span
                          class="w-2 h-2 rounded-full shadow-lg animate-pulse"
                          :class="`bg-${challengeStatusLabel(challenge.status).color}-500`"
                      ></span>
                      <span>{{ challengeStatusLabel(challenge.status).label }}</span>
                    </div>
                  </TableCell>
                </template>
              </TableRow>
            </template>

          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
