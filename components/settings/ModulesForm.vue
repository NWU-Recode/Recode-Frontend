<script setup>
import { ref, onMounted } from 'vue'
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription} from '~/components/ui/dialog'
import { useApiFetch } from '~/composables/useApiFetch'

const { apiFetch } = useApiFetch()

// Props
const props = defineProps({
  profile: { type: Object, required: true },
})

// Modules & students
const modules = ref([])
const studentsByModule = ref({}) // { module_code: [{id, name, number}] }
const uploadStatus = ref({}) // { module_code: { success: '', error: '' } }

// Modal state
const addStudentModalOpen = ref(false)
const selectedModuleCode = ref(null)
const newStudentNumber = ref('')

// Helper to get token
function getToken() {
  return localStorage.getItem('token') || ''
}

// Fetch modules for lecturer
async function fetchModules() {
  try {
    const res = await apiFetch('/admin/', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    modules.value = res

    for (const mod of res) {
      await fetchStudents(mod.code)
    }
  } catch (err) {
    console.error('Failed to fetch modules', err)
  }
}

// Fetch students for a module
async function fetchStudents(moduleCode) {
  try {
    const res = await apiFetch(`/admin/${moduleCode}/students`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    studentsByModule.value[moduleCode] = res.map(s => ({
      id: s.id,
      name: s.name,
      number: s.number || s.student_number || s.id,
    }))
  } catch (err) {
    console.error(`Failed to fetch students for ${moduleCode}`, err)
    studentsByModule.value[moduleCode] = []
  }
}

// Upload CSV and batch enroll students
async function uploadCsv(moduleCode, file) {
  if (!file) return

  uploadStatus.value[moduleCode] = { success: '', error: '' }

  try {
    const text = await file.text()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)
    const studentIds = lines.slice(1)

    if (studentIds.length === 0) {
      uploadStatus.value[moduleCode].error = 'CSV is empty or invalid'
      return
    }

    const semesterId = modules.value.find(m => m.code === moduleCode)?.semester_id
    if (!semesterId) throw new Error('Semester ID not found')

    await apiFetch(`/admin/${moduleCode}/enrol/batch`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: { student_ids: studentIds, semester_id: semesterId },
    })

    await fetchStudents(moduleCode)
    uploadStatus.value[moduleCode].success = `${studentIds.length} student(s) successfully enrolled!`
  } catch (err) {
    console.error('Upload CSV failed', err)
    uploadStatus.value[moduleCode].error = 'Failed to enroll students. Please check your CSV.'
  }
}

// Add a single student via modal
async function addStudent() {
  if (!selectedModuleCode.value || !newStudentNumber.value) return

  try {
    const semesterId = modules.value.find(m => m.code === selectedModuleCode.value)?.semester_id
    await apiFetch(`/admin/${selectedModuleCode.value}/enrol`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: {
        student_id: newStudentNumber.value,
        semester_id: semesterId,
        status: 'active',
      },
    })

    await fetchStudents(selectedModuleCode.value)
    uploadStatus.value[selectedModuleCode.value].success = `Student ${newStudentNumber.value} enrolled successfully!`
    newStudentNumber.value = ''
    addStudentModalOpen.value = false
  } catch (err) {
    console.error('Add student failed', err)
    uploadStatus.value[selectedModuleCode.value].error = `Failed to enroll student ${newStudentNumber.value}`
  }
}

// Open modal for a module
function openAddStudentModal(moduleCode) {
  selectedModuleCode.value = moduleCode
  newStudentNumber.value = ''
  addStudentModalOpen.value = true
}

// Initial fetch
onMounted(fetchModules)
</script>

<template>
  <div v-if="props.profile.role === 'lecturer'">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead />
          <TableHead>Module Name</TableHead>
          <TableHead>Module Code</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-for="mod in modules" :key="mod.id" collapsible>
          <template #default>
            <TableCell>{{ mod.name }}</TableCell>
            <TableCell>{{ mod.code }}</TableCell>

            <TableCell class="flex items-center gap-2">
              <!-- Upload CSV button -->
              <Button size="sm" variant="secondary" as="label" class="cursor-pointer">
                <span>Upload CSV</span>
                <input
                    type="file"
                    class="hidden"
                    @change="e => uploadCsv(mod.code, e.target.files[0])"
                />
              </Button>

              <!-- Status icon -->
              <span v-if="uploadStatus[mod.code]" class="relative">
                <Icon
                    v-if="uploadStatus[mod.code]?.success"
                    name="i-radix-icons-check-circled"
                    class="w-4 h-4 text-green-600"
                    :title="uploadStatus[mod.code].success"
                />
                <Icon
                    v-else-if="uploadStatus[mod.code]?.error"
                    name="i-radix-icons-cross-circled"
                    class="w-4 h-4 text-red-600"
                    :title="uploadStatus[mod.code].error"
                />
              </span>

              <!-- Add student modal trigger -->
              <Button size="sm" variant="secondary" @click="openAddStudentModal(mod.code)">
                <Icon name="i-radix-icons-plus" class="w-4 h-4" />
                Add student
              </Button>
            </TableCell>
          </template>

          <template #expanded>
            <TableRow
                v-for="student in studentsByModule[mod.code] || []"
                :key="student.id"
                class="bg-muted/20"
            >
              <template #default>
                <TableCell />
                <TableCell />
                <TableCell>{{ student.number }}</TableCell>
                <TableCell />
              </template>
            </TableRow>
          </template>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <div v-else-if="props.profile.role === 'student'">
    <p>hello student</p>
  </div>

  <!-- Add Student Modal -->
  <Dialog v-model:open="addStudentModalOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Student</DialogTitle>
        <DialogDescription>
          Enter the student number to enroll in module {{ selectedModuleCode }}.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-4 flex flex-col gap-2">
        <Input
            type="text"
            placeholder="Student Number"
            v-model="newStudentNumber"
            class="border rounded px-2 py-1"
        />
        <div class="flex justify-end gap-2 mt-2">
          <Button size="sm" @click="addStudent">Enroll</Button>
          <Button size="sm" variant="secondary" @click="addStudentModalOpen = false">Cancel</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
