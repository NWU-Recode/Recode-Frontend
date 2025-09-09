<script setup>
import DashboardLayout from '~/components/dashboard/DashboardLayout.vue'
import { useAuth } from '~/composables/useAuth'
import S_Overview from "~/components/dashboard/student/S_Overview.vue";
import L_Overview from "~/components/dashboard/lecturer/L_Overview.vue";
import Uploads from "~/components/dashboard/lecturer/Uploads.vue";
import S_Analytics from "~/components/dashboard/student/S_Analytics.vue";
import L_Analytics from "~/components/dashboard/lecturer/L_Analytics.vue";

const { user } = useAuth()
</script>

<template>
  <DashboardLayout v-slot="{ activeTab }">
    <div v-if="activeTab === 'overview'">
      <S_Overview v-if="user.role === 'student'" />
      <L_Overview v-else-if="user.role === 'lecturer'" />
    </div>

    <div v-if="activeTab === 'uploads' && user.role === 'lecturer'">
      <Uploads />
    </div>

    <div v-if="activeTab === 'analytics'">
      <S_Analytics v-if="user.role === 'student'" />
      <L_Analytics v-else-if="user.role === 'lecturer'" />
    </div>
  </DashboardLayout>
</template>

