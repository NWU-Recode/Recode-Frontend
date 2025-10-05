<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, watch, defineProps } from 'vue'
import * as z from 'zod'
import { toast } from '~/components/ui/toast'
import AvatarCarousel from '~/components/ui/avatar/AvatarCarousel.vue'
import { useApiFetch } from '@/composables/useApiFetch'

import bronzeIcon from '~/assets/flat-icons/bronze.png'
import silverIcon from '~/assets/flat-icons/silver.png'
import goldIcon from '~/assets/flat-icons/gold.png'
import rubyIcon from '~/assets/flat-icons/ruby.png'
import emeraldIcon from '~/assets/flat-icons/emerald.png'
import diamondIcon from '~/assets/flat-icons/diamond.png'

const { apiFetch } = useApiFetch()

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
  setPageLoading?: (val: boolean) => void
}>()

// --- Validation schema ---
const profileFormSchema = toTypedSchema(
    z.object({
      full_name: z.string().min(2).max(50),
      email: z.string().email(),
      phone: z.string().optional(),
      bio: z.string().max(160).optional(),
      avatar_url: z.string().url().optional(),
    })
)

// --- Form setup ---
const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
  },
})

const submitForm = handleSubmit(onSubmit)

const avatarOptions = Array.from({ length: 18 }, (_, i) => `/avatars/avatar${i + 1}.jpeg`)
const selectedAvatar = ref<string | null>(props.profile.avatar_url ?? null)
const avatarPreview = ref<string | null>(props.profile.avatar_url ?? null)

watch(selectedAvatar, (url) => {
  avatarPreview.value = url
  setValues({ avatar_url: url })
})

const submitting = ref(false)

// --- Badge icons mapping ---
const badgeIcons: Record<string, string> = {
  bronze: bronzeIcon,
  silver: silverIcon,
  gold: goldIcon,
  ruby: rubyIcon,
  emerald: emeraldIcon,
  diamond: diamondIcon,
}

// Badge counts
const badges = ref<Record<string, number>>({
  bronze: 0,
  silver: 0,
  gold: 0,
  ruby: 0,
  emerald: 0,
  diamond: 0,
})

// --- Fetch badges for the logged-in student ---
async function fetchBadgesForStudent() {
  try {
    // Get all modules visible to this student
    const modulesRes: Array<{ code: string }> = await apiFetch('/admin/')
    const moduleCodes: string[] = modulesRes.map((m) => m.code)

    // Reset counts
    badges.value = {
      bronze: 0,
      silver: 0,
      gold: 0,
      ruby: 0,
      emerald: 0,
      diamond: 0,
    }

    // Fetch badges for each module
    for (const moduleCode of moduleCodes) {
      const res: Array<{ badge_type: string; badge_count: number }> = await apiFetch(
          `/badges?module_code=${moduleCode}`
      )
      res.forEach((b) => {
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


// --- Watch profile prop for changes ---
watch(
    () => props.profile,
    (newProfile) => {
      if (newProfile.role === 'student' && newProfile.id) {
        fetchBadgesForStudent(newProfile.id.toString())
      }
    },
    { immediate: true }
)

// --- Submit handler ---
async function onSubmit(values: typeof profileFormSchema._type) {
  submitting.value = true
  try {
    let endpoint = ''
    let method: 'PUT' | 'PATCH' = 'PATCH'

    if (props.profile.role === 'student') {
      endpoint = '/student/me'
      method = 'PATCH'
    } else if (props.profile.role === 'lecturer') {
      endpoint = '/admin/me'
      method = 'PUT'
    }

    // Remove email if readonly
    const payload = { ...values }
    delete payload.email

    await apiFetch(endpoint, {
      method,
      body: payload,
    })

    toast({
      title: 'Profile updated',
      description: 'Your profile changes were saved successfully.',
    })
  } catch (e: any) {
    toast({
      title: 'Update failed',
      description: e.message || 'Something went wrong',
    })
  } finally {
    submitting.value = false
  }
}

watch(
    () => props.profile,
    (newProfile) => {
      if (newProfile) {
        setValues({
          full_name: newProfile.full_name || '',
          email: newProfile.email || '',
          phone: newProfile.phone || '',
          bio: newProfile.bio || '',
          avatar_url: newProfile.avatar_url || '',
        })
        selectedAvatar.value = newProfile.avatar_url ?? null
        avatarPreview.value = newProfile.avatar_url ?? null

        if (newProfile.role === 'student' && newProfile.id) {
          fetchBadgesForStudent(newProfile.id.toString())
        }
      }
    },
    { immediate: true }
)

</script>

<template>
  <form class="space-y-8" @submit.prevent="submitForm">
    <!-- SECTION 1: Avatar + Name + Title -->
    <Card class="p-4 md:p-6 flex flex-col items-center gap-4 md:gap-6">
      <div class="flex justify-center w-full pb-8">
        <AvatarCarousel v-model:selected="selectedAvatar" :profile="props.profile" />
      </div>

      <!-- Name + Title form fields -->
      <div class="flex flex-col w-full gap-4 md:flex-row md:gap-6">
        <FormField v-slot="{ componentField }" name="full_name">
          <FormItem class="w-full">
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="John Doe" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </Card>

    <!-- SECTION 2: Personal Details -->
    <Card class="p-6 space-y-6">
      <h3 class="text-lg font-medium">Personal Details</h3>

      <FormField v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" v-bind="componentField" readonly />
          </FormControl>
          <FormDescription>Email cannot be changed here.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel>Contact Number</FormLabel>
          <FormControl>
            <Input type="text" placeholder="+27 123 456 789" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="bio">
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea placeholder="Tell us a little bit about yourself" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </Card>

    <!-- SECTION 3: Personal Stats (Student only) -->
    <Card v-if="props.profile.role === 'student'" class="p-4 md:p-6 space-y-4 md:space-y-6">
      <h3 class="text-lg font-medium">Personal Stats</h3>

      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
        <div class="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 w-full md:w-auto overflow-x-auto">
          <div
              v-for="(icon, index) in Object.keys(badgeIcons)"
              :key="index"
              class="flex flex-col items-center min-w-[50px]"
          >
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
      <Button type="submit" :disabled="submitting">
        {{ submitting ? 'Updating...' : 'Update profile' }}
      </Button>
      <Button type="button" variant="outline" @click="resetForm">Reset form</Button>
    </div>
  </form>
</template>
