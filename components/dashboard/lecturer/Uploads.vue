<script setup lang="ts">

import UploadsModal from "~/components/dashboard/lecturer/UploadsModal.vue";
import {Button} from "~/components/ui/button"
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from "~/components/ui/table"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "~/components/ui/dialog";

const open = ref(false)

const files = [
  {
    subject: 'CMPG111',
    fileName: 'lesson1.pdf',
    uploadDate: '2025-09-10',
    topic: 'If Statements',
    fileUrl: '#',
  },
  {
    subject: 'CMPG111',
    fileName: 'lesson2.docx',
    uploadDate: '2025-09-11',
    topic: 'Else Statements',
    fileUrl: '#',
  },
  {
    subject: 'CMPG111',
    fileName: 'lesson3.pptx',
    uploadDate: '2025-09-12',
    topic: 'While Loops',
    fileUrl: '#',
  },
]

function handleUploaded(file: any) {
  files.push(file)
  open.value = false
}

</script>

<template>
  <div>
    <!-- Action button -->
    <div class="flex py-4">
      <Button variant="outline" class="flex items-center gap-2 px-3 py-2" @click="open = true">
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
      <DialogContent class="w-full max-w-full md:max-w-md p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle class="text-sm sm:text-base">Upload new file</DialogTitle>
        </DialogHeader>

        <UploadsModal @close="open = false" @uploaded="handleUploaded" />
      </DialogContent>
    </Dialog>
  </div>
</template>
