<script setup lang="ts">

</script>

<template>
  <p> <!-- TODO: section header --></p>
  <div class="mt-10 grid gap-6 lg:grid-cols-4 md:grid-cols-2 md:gap-8">
    <!-- Card 1 -->
    <Card class="h-40">
      <CardContent class="p-4 h-full flex flex-col justify-between">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <span class="text-sm text-gray-700">CMPG 111</span>
          <span class="text-base font-semibold text-gray-700">If Statements</span>
        </div>

        <!-- Icons row (flex, evenly spaced) -->
        <div class="flex justify-between mt-2">
          <img class="w-10 h-10" src="/assets/flat-icons/bronze.png" alt="bronze" />
          <img class="w-10 h-10" src="/assets/flat-icons/silver.png" alt="silver" />
          <img class="w-10 h-10" src="/assets/flat-icons/gold.png" alt="gold" />
        </div>

        <!-- Percentages row (flex, evenly spaced) -->
        <div class="flex justify-between mt-4">
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-gray-700">67</span>
            <span class="text-base font-semibold text-gray-700">%</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-gray-700">55</span>
            <span class="text-base font-semibold text-gray-700">%</span>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-semibold text-gray-700">47</span>
            <span class="text-base font-semibold text-gray-700">%</span>
          </div>
        </div>
      </CardContent>
    </Card>


    <!-- Card 2 -->
    <Card class="h-40">
      <CardContent class="p-4 h-full flex flex-col justify-center">
        <p class="text-gray-600">Card 2 content here</p>
      </CardContent>
    </Card>

    <!-- Card 3 -->
    <Card class="h-40">
      <CardContent class="p-4 h-full flex flex-col justify-center">
        <p class="text-gray-600">Card 3 content here</p>
      </CardContent>
    </Card>

    <!-- Card 4 -->
    <Card class="h-40">
      <CardContent class="p-4 h-full flex flex-col justify-center">
        <p class="text-gray-600">Card 4 content here</p>
      </CardContent>
    </Card>
  </div>

  <p> <!-- TODO: section header and buttons: example of secondary button below --></p>
  <!--
  <Button variant="outline" class="flex items-center gap-2 px-3 py-2">
    <Icon name="i-radix-icons-chevron-right" class="w-4 h-4" />
    <span class="text-sm font-medium">Next Question</span>
  </Button>
  -->

  <div class="grid gap-6 lg:grid-cols-3 md:grid-cols-2 md:gap-8">
    <div class="mt-14 h-100 border bg-card text-card-foreground shadow rounded-lg overflow-hidden relative">
      <!-- Description -->
    </div>

    <div class="mt-14 h-100 border bg-card text-card-foreground shadow rounded-lg overflow-hidden relative">
      <!-- Code -->
    </div>

    <div class="mt-14 h-100 border bg-card text-card-foreground shadow rounded-lg overflow-hidden relative">
      <!-- Testcase -->
    </div>
  </div>
</template>
