<script setup>
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { useApiFetch } from '@/composables/useApiFetch'
import AddModule from "~/components/dashboard/admin/AddModule.vue";
import AddSemester from "~/components/dashboard/admin/AddSemester.vue";

const { apiFetch } = useApiFetch()

// State
const semester = ref(null)
const modules = ref([]) // store all modules
const showSemesterModal = ref(false)
const showModuleModal = ref(false)
const selectedModule = ref(null)

// Fetch current semester (or first semester)
async function fetchSemester() {
  try {
    const res = await apiFetch('/semesters/')
    semester.value = res[0] || null
  } catch (err) {
    console.error('Failed to fetch semesters', err)
  }
}

// Fetch all modules
async function fetchModules() {
  try {
    modules.value = await apiFetch('/admin/modules')
  } catch (err) {
    console.error('Failed to fetch modules', err)
  }
}

// Module handlers
function openModuleModal() {
  selectedModule.value = null
  showModuleModal.value = true
}

function editModule(mod) {
  selectedModule.value = mod
  showModuleModal.value = true
}

async function deleteModule(mod) {
  const confirmed = window.confirm(`Are you sure you want to delete the module "${mod.name}"? This action cannot be undone.`)
  if (!confirmed) return

  try {
    await apiFetch(`/admin/${mod.id}`, {
      method: 'DELETE',
      body: null,
    })
    await fetchModules()
  } catch (err) {
    console.error('Failed to delete module', err)
  }
}

function closeModuleModal() {
  showModuleModal.value = false
}

// Initial fetch
onMounted(async () => {
  await fetchSemester()
  await fetchModules()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between mb-4">
      <h1 class="text-xl font-bold">Admin Dashboard</h1>
      <Button
          :disabled="!!semester"
          @click="showSemesterModal = true"
      >
        Add Semester
      </Button>
    </div>

    <!-- Semester info -->
    <div v-if="semester">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">
          Semester: {{ semester.term_name }} ({{ semester.year }})
        </h2>
        <Button @click="openModuleModal">Add Module</Button>
      </div>

      <p class="text-sm text-neutral-500 mb-2">
        {{ semester.start_date }} → {{ semester.end_date }}
        <span v-if="semester.is_current" class="ml-2 text-green-600 font-medium">(Current)</span>
      </p>
    </div>

    <!-- Modules Table -->
    <Table>
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
        <TableRow v-for="mod in modules" :key="mod.id">
          <TableCell>{{ mod.code }}</TableCell>
          <TableCell>{{ mod.name }}</TableCell>
          <TableCell>{{ mod.lecturer_id }}</TableCell>
          <TableCell>{{ mod.credits}}</TableCell>
          <TableCell class="text-center">
            <div class="flex gap-2 justify-center">
              <Button size="sm" variant="secondary" @click="editModule(mod)">Edit</Button>
              <Button size="sm" variant="destructive" @click="deleteModule(mod)">Delete</Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Module Modal -->
    <AddModule
        v-if="showModuleModal"
        :module="selectedModule"
        :semester-id="semester?.id"
        @close="closeModuleModal"
        @saved="fetchModules"
    />

    <!-- Add Semester Modal -->
    <AddSemester
        v-if="showSemesterModal"
        @close="showSemesterModal = false"
        @saved="async () => { showSemesterModal = false; await fetchSemester() }"
    />
  </div>
</template>