<script setup lang="ts">

import UploadsModal from "~/components/dashboard/lecturer/UploadsModal.vue";

const open = ref(false)

const files = [
  {
    //TODO: replace this dummy data with NWU related dummy data
    subject: 'Math',
    fileName: 'algebra_notes.pdf',
    uploadDate: '2025-09-10',
    topic: 'Algebra',
    fileUrl: '#',
  },
  {
    subject: 'Physics',
    fileName: 'mechanics_intro.docx',
    uploadDate: '2025-09-11',
    topic: 'Mechanics',
    fileUrl: '#',
  },
  {
    subject: 'Computer Science',
    fileName: 'sorting_algorithms.pptx',
    uploadDate: '2025-09-12',
    topic: 'Algorithms',
    fileUrl: '#',
  },
]
</script>

<template>
  <div>
    <!-- Action button -->
    <div class="flex py-4">
      <Button class="flex items-center gap-2 px-3 py-2" @click="open = true">
        <Icon name="i-radix-icons-plus" class="w-4 h-4" />
        <span class="text-sm font-medium">New file upload</span>
      </Button>
    </div>

    <!-- Table -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>File name</TableHead>
          <TableHead>Upload date</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(file, i) in files" :key="i">
          <TableCell>{{ file.subject }}</TableCell>
          <TableCell>{{ file.fileName }}</TableCell>
          <TableCell>{{ file.uploadDate }}</TableCell>
          <TableCell>{{ file.topic }}</TableCell>
          <TableCell>
            <a
                :href="file.fileUrl"
                class="text-blue-600 hover:underline"
            >
              Download
            </a>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Dialog v-model:open="open">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload new file</DialogTitle>
        </DialogHeader>

        <UploadsModal />
      </DialogContent>
    </Dialog>
  </div>
</template>
