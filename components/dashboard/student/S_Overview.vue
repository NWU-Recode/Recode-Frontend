<script setup lang="ts">
// <!-- Importing necessary components -->
import { Check, Circle, Dot } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Stepper, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const steps = [
  {
    step: 1,
    title: 'Bronze',
  },
  {
    step: 2,
    title: 'Silver',
  },
  {
    step: 3,
    title: 'Gold',
  },
]
</script>

<template>
  <div>
    <div class="flex items-start justify-between">
      <div>
        <h2 class="mb-4 mt-4 text-4xl font-bold">
          Welcome to Recode,
        </h2>
        <h2 class="mb-4 text-4xl">
          Sorceror, Anneme Janse van Rensburg
        </h2>
      </div>
      <Card class="h-34 w-120 flex items-center justify-center overflow-hidden border border-blue-400/20 rounded-2xl bg-blue-400/10 px-8 py-6">
        <CardContent class="h-full w-full flex items-center justify-between p-0">
          <div class="bl-5 flex items-center gap-5">
            <div class="flex items-start gap-5">
              <span class="text-gray-1400 text-lg font-semibold">Your Trophies</span>
            </div>
          </div>
          <div class="br-5 flex items-end gap-5">
            <div class="flex flex-col items-center gap-2">
              <img src="/assets/flat-icons/diamond.png" alt="diamond" class="h-10 w-10">
              <span class="text-xl text-gray-700 font-bold">5</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <img src="/assets/flat-icons/emerald.png" alt="emerald" class="h-10 w-10">
              <span class="text-xl text-gray-700 font-bold">7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <div class="grid mt-10 gap-10 lg:grid-cols-4 md:grid-cols-2 md:gap-8">
    <!-- Card 1 -->
    <Card class="relative h-60 overflow-hidden rounded-lg shadow-[0px_0px_8px_1px_rgb(96,165,250)]">
      <CardContent class="h-full flex flex-col justify-center p-10">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <span class="text-sm text-gray-700">CMPG 111</span>
          <span class="text-base text-gray-700 font-semibold">If Statements</span>
        </div>
        <!-- Icons row (flex, evenly spaced) -->
        <div class="mb-4 mt-2 flex items-start items-center justify-between">
          <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
          <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
        </div>
        <!-- Progression in challenges progress bar (flex, evenly spaced) -->
        <Stepper class="w-full flex items-start gap-2">
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative w-full flex flex-col items-center justify-center"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
            />

            <StepperTrigger as-child>
              <Button
                :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                size="icon"
                class="z-10 shrink-0 rounded-full"
                :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
              >
                <Check v-if="state === 'completed'" class="size-5" />
                <Circle v-if="state === 'active'" />
                <Dot v-if="state === 'inactive'" />
              </Button>
            </StepperTrigger>

            <div class="mt-5 flex flex-col items-center text-center">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base"
              >
                {{ step.title }}
              </StepperTitle>
            </div>
          </StepperItem>
        </Stepper>
      </CardContent>
    </Card>
    <!-- Card 2 -->
    <Card class="relative h-60 overflow-hidden rounded-lg shadow-[0px_0px_8px_1px_rgb(96,165,250)]">
      <CardContent class="h-full flex flex-col justify-center p-10">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <span class="text-sm text-gray-700">CMPG 111</span>
          <span class="text-base text-gray-700 font-semibold">Else Statements</span>
        </div>
        <!-- Icons row (flex, evenly spaced) -->
        <div class="mb-4 mt-2 flex items-start items-center justify-between">
          <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
          <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
        </div>
        <!-- Progression in challenges progress bar (flex, evenly spaced) -->
        <Stepper class="w-full flex items-start gap-2">
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative w-full flex flex-col items-center justify-center"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
            />

            <StepperTrigger as-child>
              <Button
                :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                size="icon"
                class="z-10 shrink-0 rounded-full"
                :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
              >
                <Check v-if="state === 'completed'" class="size-5" />
                <Circle v-if="state === 'active'" />
                <Dot v-if="state === 'inactive'" />
              </Button>
            </StepperTrigger>

            <div class="mt-5 flex flex-col items-center text-center">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base"
              >
                {{ step.title }}
              </StepperTitle>
            </div>
          </StepperItem>
        </Stepper>
      </CardContent>
    </Card>
    <!-- Card 3 -->
    <Card class="relative h-60 overflow-hidden rounded-lg shadow-[0px_0px_8px_1px_rgb(96,165,250)]">
      <CardContent class="h-full flex flex-col justify-center p-10">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <span class="text-sm text-gray-700">CMPG 111</span>
          <span class="text-base text-gray-700 font-semibold">While Loops</span>
        </div>
        <!-- Icons row (flex, evenly spaced) -->
        <div class="mb-4 mt-2 flex items-start items-center justify-between">
          <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
          <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
        </div>
        <!-- Progression in challenges progress bar (flex, evenly spaced) -->
        <Stepper class="w-full flex items-start gap-2">
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative w-full flex flex-col items-center justify-center"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
            />

            <StepperTrigger as-child>
              <Button
                :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                size="icon"
                class="z-10 shrink-0 rounded-full"
                :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
              >
                <Check v-if="state === 'completed'" class="size-5" />
                <Circle v-if="state === 'active'" />
                <Dot v-if="state === 'inactive'" />
              </Button>
            </StepperTrigger>

            <div class="mt-5 flex flex-col items-center text-center">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base"
              >
                {{ step.title }}
              </StepperTitle>
            </div>
          </StepperItem>
        </Stepper>
      </CardContent>
    </Card>
    <!-- Card 4 -->
    <Card class="relative h-60 overflow-hidden rounded-lg shadow-[0px_0px_8px_1px_rgb(96,165,250)]">
      <CardContent class="h-full flex flex-col justify-center p-10">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <span class="text-sm text-gray-700">CMPG 111</span>
          <span class="text-base text-gray-700 font-semibold">Do-While Loops</span>
        </div>
        <!-- Icons row (flex, evenly spaced) -->
        <div class="mb-4 mt-2 flex items-start items-center justify-between">
          <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
          <img class="h-10 w-10" src="/assets/flat-icons/gold.png" alt="gold">
        </div>
        <!-- Progression in challenges progress bar (flex, evenly spaced) -->
        <Stepper class="w-full flex items-start gap-2">
          <StepperItem
            v-for="step in steps"
            :key="step.step"
            v-slot="{ state }"
            class="relative w-full flex flex-col items-center justify-center"
            :step="step.step"
          >
            <StepperSeparator
              v-if="step.step !== steps[steps.length - 1].step"
              class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-primary"
            />

            <StepperTrigger as-child>
              <Button
                :variant="state === 'completed' || state === 'active' ? 'default' : 'outline'"
                size="icon"
                class="z-10 shrink-0 rounded-full"
                :class="[state === 'active' && 'ring-2 ring-ring ring-offset-2 ring-offset-background']"
              >
                <Check v-if="state === 'completed'" class="size-5" />
                <Circle v-if="state === 'active'" />
                <Dot v-if="state === 'inactive'" />
              </Button>
            </StepperTrigger>

            <div class="mt-5 flex flex-col items-center text-center">
              <StepperTitle
                :class="[state === 'active' && 'text-primary']"
                class="text-sm font-semibold transition lg:text-base"
              >
                {{ step.title }}
              </StepperTitle>
            </div>
          </StepperItem>
        </Stepper>
      </CardContent>
    </Card>
  </div>
  <div>
    <h3 class="mt-10 overflow-x-auto rounded-lg text-2xl font-bold">
      Your Recent Challenges
    </h3>

    <Table class="mt-4 border">
      <TableCaption>A list of your recent challenges.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            Challenges
          </TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Time Spent</TableHead>
          <TableHead>
            Badges Earned
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell class="font-medium">
            If Statements
          </TableCell>
          <TableCell>CMPG 111</TableCell>
          <TableCell>1 hour</TableCell>
          <TableCell class="text-right">
            <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">
            Else Statements
          </TableCell>
          <TableCell>CMPG 111</TableCell>
          <TableCell>2 hour</TableCell>
          <TableCell class="text-right">
            <img class="h-10 w-10" src="/assets/flat-icons/silver.png" alt="silver">
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">
            While Loops
          </TableCell>
          <TableCell>CMPG 111</TableCell>
          <TableCell>3 hour</TableCell>
          <TableCell class="text-right">
            <img class="h-10 w-10" src="/assets/flat-icons/bronze.png" alt="bronze">
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">
            Do-While Loops
          </TableCell>
          <TableCell>CMPG 111</TableCell>
          <TableCell>1/2 hour</TableCell>
          <TableCell class="text-right">
            <img class="h-10 w-10" src="/assets/flat-icons/ruby.png" alt="ruby">
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>

</style>
