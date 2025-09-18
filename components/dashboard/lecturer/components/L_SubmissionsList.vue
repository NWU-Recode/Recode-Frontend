<script setup lang="ts">
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

const submissions = [
  { name: "John Doe", number: "31765387", topic: "If statements", badge: "Bronze", time: "10 min" },
  { name: "Jane Doe", number: "45609312", topic: "If statements", badge: "Gold", time: "2.3 hours" },
  { name: "Alex Mason", number: "32975107", topic: "If statements", badge: "Silver", time: "45 min" },
  { name: "Bianca Jackson", number: "26895032", topic: "If statements", badge: "Ruby", time: "4.7 hours" },
  { name: "Owen Mckenzie", number: "40787864", topic: "If statements", badge: "Gold", time: "57 min" },
  { name: "Monica Parker", number: "28356767", topic: "If statements", badge: "Silver", time: "1.1 hours" },
]
</script>

<template>
  <div class="mt-6 rounded-xl overflow-hidden border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student name</TableHead>
          <TableHead>Student number</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Badge</TableHead>
          <TableHead>Time spent</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(s, i) in submissions" :key="i">
          <TableCell>{{ s.name }}</TableCell>
          <TableCell>{{ s.number }}</TableCell>
          <TableCell>{{ s.topic }}</TableCell>
          <TableCell>{{ s.badge }}</TableCell>
          <TableCell>{{ s.time }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>

</style>