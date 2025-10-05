<script>

import {defineComponent} from "vue";
import L_Overview from "~/components/dashboard/lecturer/L_Overview.vue";
import L_Analytics from "~/components/dashboard/lecturer/L_Analytics.vue";
import Uploads from "~/components/dashboard/lecturer/Uploads.vue";

export default defineComponent({
  components: {Uploads, L_Analytics,  L_Overview}
})
</script>

<template>
  <DashboardLayout v-slot="{ activeTab }">
    <L_Overview v-if="activeTab === 'overview'" />
    <Uploads v-else-if="activeTab === 'uploads'" />
    <L_Analytics v-else-if="activeTab === 'analytics'" />
  </DashboardLayout>
</template>