<script setup>
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useApiFetch } from '@/composables/useApiFetch'
import AddModule from '~/components/dashboard/admin/AddModule.vue'
import AddSemester from '~/components/dashboard/admin/AddSemester.vue'
import FunLoader from '~/components/FunLoader.vue'
import {ChevronLeft, ChevronRight} from "lucide-vue-next";

const { apiFetch } = useApiFetch()

// State
const semesters = ref([])
const modules = ref([])
const showSemesterModal = ref(false)
const showModuleModal = ref(false)
const selectedModule = ref(null)
const loading = ref(true) // ← new state

// Fetch all semesters
async function fetchSemesters() {
  try {
    semesters.value = await apiFetch('/semesters/')
  } catch (err) {
    console.error('Failed to fetch semesters', err)
  }
}

// Fetch all modules
async function fetchModules() {
  try {
    modules.value = await apiFetch('/analytics/admin/modules')
  } catch (err) {
    console.error('Failed to fetch modules', err)
  }
}

// Categorize semesters
const currentDate = () => new Date()

const currentSemester = computed(() =>
    semesters.value.find(
        s => new Date(s.start_date) <= currentDate() && new Date(s.end_date) >= currentDate()
    )
)

const upcomingSemesters = computed(() =>
    semesters.value.filter(s => new Date(s.start_date) > currentDate())
)

const completedSemesters = computed(() =>
    semesters.value.filter(s => new Date(s.end_date) < currentDate())
)

// Group modules by semester
const modulesBySemester = computed(() => {
  const grouped = {}
  for (const mod of modules.value) {
    if (!grouped[mod.semester_id]) grouped[mod.semester_id] = []
    grouped[mod.semester_id].push(mod)
  }
  return grouped
})

// Annotate semesters with a computed status
const annotatedSemesters = computed(() =>
    semesters.value.map(s => {
      const now = new Date()
      let status = 'upcoming'

      if (new Date(s.end_date) < now) status = 'completed'
      else if (new Date(s.start_date) <= now && new Date(s.end_date) >= now) status = 'current'

      return { ...s, computed_status: status }
    })
)

const currentWeek = ref(null)

async function fetchCurrentWeek() {
  if (!currentSemester.value) return
  try {
    const res = await apiFetch('/dashboard/current-week')
    currentWeek.value = res.current_week
  } catch (err) {
    console.error('Failed to fetch current week', err)
  }
}

const skipDelta = ref(0)
const isSkipping = ref(false)

async function skipWeeks(delta) {
  console.log('Skipping weeks by:', delta)
  if (!currentSemester.value) return
  isSkipping.value = true
  try {
    await apiFetch('/admin/demo/skip', {
      method: 'POST',
      body: { delta }
    })
    await fetchCurrentWeek()
  } catch (err) {
    console.error('Failed to skip weeks', err)
  } finally {
    isSkipping.value = false
  }
}

// Modal handlers
function openModuleModal() {
  selectedModule.value = null
  showModuleModal.value = true
}

function editModule(mod) {
  selectedModule.value = mod
  showModuleModal.value = true
}

async function deleteModule(mod) {
  const confirmed = window.confirm(`Are you sure you want to delete "${mod.name}"?`)
  if (!confirmed) return

  try {
    await apiFetch(`/admin/${mod.id}`, { method: 'DELETE' })
    await fetchModules()
  } catch (err) {
    console.error('Failed to delete module', err)
  }
}

function closeModuleModal() {
  showModuleModal.value = false
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([fetchSemesters(), fetchModules()])
    await fetchCurrentWeek()
  } finally {
    loading.value = false
  }
})

watch(currentSemester, async (val) => {
  if (val) await fetchCurrentWeek()
})
</script>

<template>
  <div>
    <FunLoader v-if="loading" />  <!-- 🌀 shows while data loads -->

    <div v-else>
      <!-- Header -->
      <div class="flex justify-between mb-4">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
        <div class="flex gap-2">
          <Button @click="openModuleModal">Add Module</Button>
          <Button @click="showSemesterModal = true">Add Semester</Button>
        </div>
      </div>

      <!-- Current Semester -->
      <div v-if="currentSemester" class="mb-8">
        <h2 class="text-lg font-semibold">Current Semester</h2>
        <p class="text-sm text-neutral-500 mb-2">
          {{ currentSemester.term_name }} ({{ currentSemester.year }}) |
          {{ currentSemester.start_date }} → {{ currentSemester.end_date }}
          <span class="ml-2 text-blue-400 font-medium">(Current)</span>
        </p>

        <div class="my-4 flex items-center gap-2">
          <!-- Skip week buttons -->
          <div class="flex items-center gap-1">
            <Button
                size="sm"
                variant="outline"
                :leftIcon="ChevronLeft"
                @click="skipWeeks(1)"
                :disabled="isSkipping"
            >
              1 week back
            </Button>

            <span class="font-medium ml-2">Current Week:</span>
            <span class="text-blue-500 mr-2">{{ currentWeek ?? '-' }}</span>

            <Button
                size="sm"
                variant="outline"
                :rightIcon="ChevronRight"
                @click="skipWeeks(-1)"
                :disabled="isSkipping"
            >
              1 week forward
            </Button>
          </div>
        </div>

        <Table v-if="modulesBySemester[currentSemester.id]?.length">
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead class="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="mod in modulesBySemester[currentSemester.id]" :key="mod.id">
              <TableCell>{{ mod.code }}</TableCell>
              <TableCell>{{ mod.name }}</TableCell>
              <TableCell>{{ mod.lecturer_id }}</TableCell>
              <TableCell>{{ mod.credits }}</TableCell>
              <TableCell class="text-center">
                <div class="flex gap-2 justify-center">
                  <Button size="sm" variant="secondary" @click="editModule(mod)">Edit</Button>
                  <Button size="sm" variant="destructive" @click="deleteModule(mod)">Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p v-else class="text-sm text-neutral-400 italic">No modules found for this semester.</p>
      </div>

      <!-- Upcoming Semesters -->
      <div v-if="upcomingSemesters.length" class="mb-8">
        <h2 class="text-lg font-semibold mb-2">Upcoming Semesters</h2>
        <div v-for="sem in upcomingSemesters" :key="sem.id" class="mb-6">
          <p class="text-sm text-neutral-500 mb-2">
            {{ sem.term_name }} ({{ sem.year }}) |
            {{ sem.start_date }} → {{ sem.end_date }}
            <span class="ml-2 text-red-400 font-medium">(Upcoming)</span>
          </p>

          <Table v-if="modulesBySemester[sem.id]?.length">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead class="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="mod in modulesBySemester[sem.id]" :key="mod.id">
                <TableCell>{{ mod.code }}</TableCell>
                <TableCell>{{ mod.name }}</TableCell>
                <TableCell>{{ mod.lecturer_id }}</TableCell>
                <TableCell>{{ mod.credits }}</TableCell>
                <TableCell class="text-center">
                  <div class="flex gap-2 justify-center">
                    <Button size="sm" variant="secondary" @click="editModule(mod)">Edit</Button>
                    <Button size="sm" variant="destructive" @click="deleteModule(mod)">Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p v-else class="text-sm text-neutral-400 italic">No modules assigned yet.</p>
        </div>
      </div>

      <!-- Completed Semesters -->
      <div v-if="completedSemesters.length">
        <h2 class="text-lg font-semibold mb-2">Completed Semesters</h2>
        <div v-for="sem in completedSemesters" :key="sem.id" class="mb-6">
          <p class="text-sm text-neutral-500 mb-2">
            {{ sem.term_name }} ({{ sem.year }}) |
            {{ sem.start_date }} → {{ sem.end_date }}
            <span class="ml-2 text-green-400 font-medium">(Completed)</span>
          </p>

          <Table v-if="modulesBySemester[sem.id]?.length">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="mod in modulesBySemester[sem.id]" :key="mod.id">
                <TableCell>{{ mod.code }}</TableCell>
                <TableCell>{{ mod.name }}</TableCell>
                <TableCell>{{ mod.lecturer_id }}</TableCell>
                <TableCell>{{ mod.credits }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p v-else class="text-sm text-neutral-400 italic">No modules found for this semester.</p>
        </div>
      </div>

      <!-- Modals -->
      <AddModule
          v-if="showModuleModal"
          :module="selectedModule"
          :semester-id="currentSemester?.id"
          :semesters="annotatedSemesters"
          @close="closeModuleModal"
          @saved="fetchModules"
      />

      <AddSemester
          v-if="showSemesterModal"
          :has-current="!!currentSemester"
          @close="showSemesterModal = false"
          @saved="async () => { showSemesterModal = false; await fetchSemesters() }"
      />
    </div>
  </div>
</template>