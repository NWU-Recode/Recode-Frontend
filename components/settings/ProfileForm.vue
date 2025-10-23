<script setup lang="ts">
import { ref, reactive, watch, defineProps } from 'vue'
import AvatarCarousel from '~/components/ui/avatar/AvatarCarousel.vue'
import { useApiFetch } from '@/composables/useApiFetch'

import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'

const { apiFetch } = useApiFetch()
const emit = defineEmits(['profile-updated'])

// --- Props ---
const props = defineProps<{
  profile: {
    full_name: string
    email: string
    phone?: string
    bio?: string
    avatar_url?: string | null
    title_name?: string
    role: 'student' | 'lecturer'
  }
}>()

// --- Form state ---
type ProfileFormValues = {
  full_name: string
  email: string
  phone: string
  bio: string
  avatar_url: string | null
}

const formValues = reactive<ProfileFormValues>({
  full_name: '',
  email: '',
  phone: '',
  bio: '',
  avatar_url: null,
})

// --- Avatar setup ---
const avatarOptions = Array.from({ length: 18 }, (_, i) => `/avatars/avatar${i + 1}.jpeg`)
const selectedAvatar = ref<string | null>(props.profile.avatar_url ?? avatarOptions[0])
const avatarPreview = ref(selectedAvatar.value)

watch(selectedAvatar, (url) => {
  avatarPreview.value = url
  formValues.avatar_url = url || null
})

// --- Badge icons ---
const badgeIcons: Record<string, string> = {
  bronze: bronzeIcon,
  silver: silverIcon,
  gold: goldIcon,
  ruby: rubyIcon,
  emerald: emeraldIcon,
  diamond: diamondIcon,
}

const badges = ref<Record<string, number>>({
  bronze: 0,
  silver: 0,
  gold: 0,
  ruby: 0,
  emerald: 0,
  diamond: 0,
})

// --- Fetch badges ---
async function fetchBadgesForStudent() {
  try {
    // 1. Fetch all semesters and get the current one
    const semesters: any[] = await apiFetch('/semesters/')
    const currentSemester = semesters.find(s => s.is_current)
    if (!currentSemester) return

    // 2. Fetch modules for the student
    const modulesRes: Array<{ code: string; semester_id: string }> = await apiFetch('/admin/')

    // 3. Filter modules to only include those in the current semester
    const currentModules = modulesRes.filter(m => m.semester_id === currentSemester.id)
    const moduleCodes = currentModules.map(m => m.code)

    // 4. Reset badges
    badges.value = { bronze: 0, silver: 0, gold: 0, ruby: 0, emerald: 0, diamond: 0 }

    // 5. Fetch badges for each module in the current semester
    for (const moduleCode of moduleCodes) {
      const res: Array<{ badge_type: string; badge_count: number }> = await apiFetch(
          `/analytics/badges?module_code=${moduleCode}`
      )
      res.forEach(b => {
        const type = b.badge_type.toLowerCase()
        if (badges.value[type] !== undefined) {
          badges.value[type] += b.badge_count
        }
      })
    }
  } catch (err) {
    console.error('Failed to fetch badges:', err)
  }
}

// --- Populate form from props.profile ---
watch(
    () => props.profile,
    (newProfile) => {
      if (!newProfile) return

      formValues.full_name = newProfile.full_name || ''
      formValues.email = newProfile.email || ''
      formValues.phone = newProfile.phone || ''
      formValues.bio = newProfile.bio || ''
      formValues.avatar_url = newProfile.avatar_url || null

      selectedAvatar.value = newProfile.avatar_url ?? avatarOptions[0]
      avatarPreview.value = selectedAvatar.value

      if (newProfile.role === 'student') fetchBadgesForStudent()
    },
    { immediate: true }
)

// --- Submit handler ---
function submitForm() {
  console.log('Submit clicked!', formValues)

  const payload = {
    full_name: formValues.full_name,
    avatar_url: formValues.avatar_url ?? null,
    phone: formValues.phone ?? '',
    bio: formValues.bio ?? '',
  }

  console.log('Emitting payload:', payload)
  emit('profile-updated', payload)
}

// --- Reset form ---
function handleReset() {
  if (!props.profile) return

  formValues.full_name = props.profile.full_name || ''
  formValues.email = props.profile.email || ''
  formValues.phone = props.profile.phone || ''
  formValues.bio = props.profile.bio || ''
  formValues.avatar_url = props.profile.avatar_url || null

  selectedAvatar.value = props.profile.avatar_url ?? avatarOptions[0]
  avatarPreview.value = selectedAvatar.value
}
</script>

<template>
  <form class="space-y-8" @submit.prevent="submitForm">
    <!-- Avatar + Name -->
    <Card class="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6">
      <div class="flex justify-center w-full pb-8">
        <AvatarCarousel v-model="selectedAvatar" :profile="props.profile" />
      </div>

      <div class="flex flex-col w-full gap-4 md:flex-row md:gap-6">
        <FormField v-slot="{ componentField }">
          <FormItem class="w-full">
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input v-model="formValues.full_name" type="text" placeholder="John Doe" class="w-full" />
            </FormControl>
          </FormItem>
        </FormField>
      </div>
    </Card>

    <!-- Personal Details -->
    <Card class="p-6 space-y-6">
      <h3 class="text-lg font-medium">Personal Details</h3>

      <FormField v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input v-model="formValues.email" type="email" readonly />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Contact Number</FormLabel>
          <FormControl>
            <Input v-model="formValues.phone" type="text" placeholder="+27 123 456 789" />
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }">
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea v-model="formValues.bio" placeholder="Tell us a little bit about yourself" />
          </FormControl>
        </FormItem>
      </FormField>
    </Card>

    <!-- Student Stats -->
    <Card v-if="props.profile.role === 'student'" class="p-4 md:p-6 space-y-4 md:space-y-6">
      <h3 class="text-lg font-medium">Personal Stats</h3>

      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full md:w-auto overflow-x-auto">
          <div v-for="(icon, index) in Object.keys(badgeIcons)" :key="index" class="flex flex-col items-center min-w-[50px]">
            <img :src="badgeIcons[icon]" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">{{ badges[icon] || 0 }}</span>
          </div>
        </div>

        <div class="flex flex-col items-start md:items-end">
          <span class="text-sm text-neutral-500">Awarded title</span>
          <span class="text-2xl font-medium">{{ props.profile.title_name || 'Trainee' }}</span>
        </div>
      </div>
    </Card>

    <!-- Actions -->
    <div class="flex justify-start gap-2">
      <Button type="submit">Update profile</Button>
      <Button type="button" variant="outline" @click="handleReset">Reset form</Button>
    </div>
  </form>
</template>
