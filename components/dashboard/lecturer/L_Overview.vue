<script setup lang="ts">

</script>

<template>
  <div>
    <h2 class="mb-4 text-4xl font-bold">
      Welcome, Prof Neels
    </h2>

    <div class="grid mt-10 gap-6 lg:grid-cols-4 md:grid-cols-2 md:gap-8">
      <!-- Card 1 -->
      <Card class="relative h-40 overflow-hidden rounded-lg shadow-[0px_0px_10px_1px_rgb(96,165,250)]">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <CardContent class="h-full flex flex-col justify-between p-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <span class="text-sm text-gray-700">CMPG 111</span>
              <span class="text-base text-gray-700 font-semibold">If Statements</span>
            </div>

            <!-- Icons row (flex, evenly spaced) -->
            <div class="mt-2 flex justify-between">
              <img class="h-10 w-10" src="/assets/bronze.png" alt="bronze">
              <img class="h-10 w-10" src="/assets/silver.png" alt="silver">
              <img class="h-10 w-10" src="/assets/gold.png" alt="gold">
            </div>

            <!-- Percentages row (flex, evenly spaced) -->
            <div class="mt-4 flex justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">67</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">55</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">47</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>
      <!-- Card 2 -->
      <Card class="relative h-40 overflow-hidden rounded-lg shadow-[0px_0px_10px_1px_rgb(96,165,250)]">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <CardContent class="h-full flex flex-col justify-between p-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <span class="text-sm text-gray-700">CMPG 111</span>
              <span class="text-base text-gray-700 font-semibold">Else Statements</span>
            </div>

            <!-- Icons row (flex, evenly spaced) -->
            <div class="mt-2 flex justify-between">
              <img class="h-10 w-10" src="/assets/bronze.png" alt="bronze">
              <img class="h-10 w-10" src="/assets/silver.png" alt="silver">
              <img class="h-10 w-10" src="/assets/gold.png" alt="gold">
            </div>

            <!-- Percentages row (flex, evenly spaced) -->
            <div class="mt-4 flex justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">55</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">37</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">12</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>

      <!-- Card 3 -->
      <Card class="relative h-40 overflow-hidden rounded-lg shadow-[0px_0px_10px_1px_rgb(96,165,250)]">
        <CardContent class="h-full flex flex-col justify-center p-4">
          <CardContent class="h-full flex flex-col justify-between p-4">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <span class="text-sm text-gray-700">CMPG 111</span>
              <span class="text-base text-gray-700 font-semibold">While Loops</span>
            </div>

            <!-- Icons row (flex, evenly spaced) -->
            <div class="mt-2 flex justify-between">
              <img class="h-10 w-10" src="/assets/bronze.png" alt="bronze">
              <img class="h-10 w-10" src="/assets/silver.png" alt="silver">
              <img class="h-10 w-10" src="/assets/gold.png" alt="gold">
            </div>

            <!-- Percentages row (flex, evenly spaced) -->
            <div class="mt-4 flex justify-between">
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">55</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">45</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
              <div class="flex items-baseline gap-1">
                <span class="text-lg text-gray-700 font-semibold">12</span>
                <span class="text-base text-gray-700 font-semibold">%</span>
              </div>
            </div>
          </CardContent>
        </CardContent>
      </Card>

      <!-- Card 4 -->
      <Card class="relative h-40 overflow-hidden rounded-lg shadow-[0px_0px_10px_1px_rgb(96,165,250)]">
        <CardContent class="h-full flex flex-col justify-between p-4">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <span class="text-sm text-gray-700">CMPG 111</span>
            <span class="text-base text-gray-700 font-semibold">Do-While Loops</span>
          </div>

          <!-- Icons row (flex, evenly spaced) -->
          <div class="mt-2 flex justify-between">
            <img class="h-10 w-10" src="/assets/bronze.png" alt="bronze">
            <img class="h-10 w-10" src="/assets/silver.png" alt="silver">
            <img class="h-10 w-10" src="/assets/gold.png" alt="gold">
          </div>

          <!-- Percentages row (flex, evenly spaced) -->
          <div class="mt-4 flex justify-between">
            <div class="flex items-baseline gap-1">
              <span class="text-lg text-gray-700 font-semibold">34</span>
              <span class="text-base text-gray-700 font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg text-gray-700 font-semibold">17</span>
              <span class="text-base text-gray-700 font-semibold">%</span>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-lg text-gray-700 font-semibold">6</span>
              <span class="text-base text-gray-700 font-semibold">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!--
  <Button variant="outline" class="flex items-center gap-2 px-3 py-2">
    <span class="text-sm font-medium">Next Question</span>
  </Button>
  -->
  <div class="mb-2 mt-8 flex items-center justify-between">
    <h4 class="md-4 flex justify-start font-semibold">
      Select a topic to edit your challenges:
    </h4>

    <!-- Navigation Buttons: Previous, Next, Submit -->
    <div class="md-4 flex justify-end gap-2">
      <Button variant="outline" class="flex items-center gap-2 px-3 py-2">
        <Icon name="solar:arrow-left-outline" class="h-4 w-4" />
        <span class="text-sm font-medium">Previous</span>
      </Button>
      <Button variant="outline" class="flex items-center gap-2 px-3 py-2">
        <Icon name="solar:arrow-right-outline" class="h-4 w-4" />
        <span class="text-sm font-medium">Next</span>
      </Button>
      <Button
        variant="outline" class="flex items-center gap-2 px-3 py-2"
      >
        <Icon name="solar:arrow-right-outline" class="h-4 w-4" />
        <span class="text-sm font-medium">Submit</span>
      </Button>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-3 md:grid-cols-2 md:gap-8">
    <div class="relative mt-14 h-100 overflow-hidden border rounded-lg bg-card text-card-foreground shadow">
      <!-- Description -->
      <p class="ml-2 mt-2">
        Discription:
      </p>
    </div>

    <div class="relative mt-14 h-100 overflow-hidden border rounded-lg bg-card text-card-foreground shadow">
      <!-- Code -->
      <p class="ml-2 mt-2">
        Code:
      </p>
    </div>

    <div class="relative mt-14 h-100 overflow-hidden border rounded-lg bg-card text-card-foreground shadow">
      <!-- Testcase -->
      <p class="ml-2 mt-2">
        Testcase:
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
