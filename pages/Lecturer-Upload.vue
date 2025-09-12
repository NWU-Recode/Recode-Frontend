<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Top Bar -->
    <header class="bg-gray-900 text-white px-6 py-3 flex items-center">
      <h1 class="text-lg font-semibold">
        Lecturer dashboard → <span class="text-gray-300">UPLOADS</span>
      </h1>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6">
      <!-- Navigation -->
      <div class="flex justify-between items-center mb-6">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <img src="https://dummyimage.com/40x40/ccc/fff.png&text=RC" alt="Logo" class="w-10 h-10 rounded-full">
        </div>

        <!-- Nav Links -->
        <div class="flex space-x-6">
          <a href="#" class="text-gray-600 hover:text-gray-900">Overview</a>
          <a href="#" class="text-gray-900 font-semibold border-b-2 border-purple-400">Uploads</a>
          <a href="#" class="text-gray-600 hover:text-gray-900">Analytics</a>
        </div>

        <!-- Icons -->
        <div class="flex items-center space-x-4">
          <button>
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M5.121 17.804A3.001 3.001 0 018 15h8a3.001 3.001 0 012.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button>
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Upload Button -->
      <Button class = "flex items-center gap-2 px-3 py-2">
        <Icon name = "i-radix-icons-plus" class = "w-4 h-4"/>
        <span class = "text-sm font-medium"> New File Upload</span>
      </Button>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow p-4">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
              <th class="text-left p-3 rounded-tl-2xl">Filename</th>
              <th class="text-left p-3">Upload date</th>
              <th class="text-left p-3">Topic</th>
              <th class="text-left p-3 rounded-tr-2xl">File</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="p-3">First lecture slides</td>
              <td class="p-3">2025/07/21</td>
              <td class="p-3">Binary trees</td>
              <td class="p-3 text-blue-600 hover:underline cursor-pointer">binarytree.pptx</td>
            </tr>
            <tr v-for="i in 4" :key="i" class="border-b h-10">
              <td class="p-3"></td>
              <td class="p-3"></td>
              <td class="p-3"></td>
              <td class="p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
// No logic for now, static UI only
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
}
</style>
