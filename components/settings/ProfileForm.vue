<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, watch, defineProps } from 'vue'
import * as z from 'zod'
import { toast } from '~/components/ui/toast'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import { AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import AvatarCarousel from '~/components/ui/avatar/AvatarCarousel.vue'
import { useRuntimeConfig } from '#app'

// --- Props ---
const props = defineProps<{
  profile: {
    full_name: string
    email: string
    phone?: string
    bio?: string
    avatar_url?: string | null
    title?: string
    role: 'student' | 'lecturer'
  }
  setPageLoading?: (val: boolean) => void
}>()

const config = useRuntimeConfig()

// --- Validation schema ---
const profileFormSchema = toTypedSchema(
    z.object({
      full_name: z.string().min(2).max(50),
      email: z.string().email(),
      phone: z.string().optional(),
      bio: z.string().max(160).optional(),
      avatar_url: z.string().url().optional(),
      title: z.string().optional(),
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
    title: '',
  },
})

const avatarOptions = Array.from({ length: 18 }, (_, i) => `/avatars/avatar${i + 1}.jpeg`)
const selectedAvatar = ref<string | null>(props.profile.avatar_url ?? null)
const avatarPreview = ref<string | null>(props.profile.avatar_url ?? null)

watch(selectedAvatar, (url) => {
  avatarPreview.value = url
  setValues({ avatar_url: url })
})

const submitting = ref(false)

// --- Watch profile prop for changes ---
watch(
    () => props.profile,
    (newProfile) => {
      resetForm({
        values: {
          full_name: newProfile.full_name ?? '',
          email: newProfile.email ?? '',
          phone: newProfile.phone ?? '',
          bio: newProfile.bio ?? '',
          avatar_url: newProfile.avatar_url ?? '',
          title: newProfile.title ?? '',
        },
      })
      avatarPreview.value = newProfile.avatar_url ?? null
      props.setPageLoading?.(false)
    },
    { immediate: true }
)

// --- Submit handler ---
const onSubmit = handleSubmit(async (values) => {
  submitting.value = true
  try {
    await $fetch(`${config.public.apiBase}/profiles/me`, {
      method: 'PUT',
      credentials: 'include',
      body: values,
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
})
</script>

<template>
  <form class="space-y-8" @submit="onSubmit">
    <!-- SECTION 1: Avatar + Name + Title -->
    <Card class="p-6 items-center gap-6">
      <div class="flex justify-center w-full max-w-2xl">
        <AvatarCarousel
            :profile="props.profile"
            v-model:selected="selectedAvatar"
        />
      </div>

      <!-- Name + Title form fields -->
      <div class="flex flex-col md:flex-row w-full gap-6 mt-6 md:mt-0">
        <FormField v-slot="{ componentField }" name="full_name">
          <FormItem class="w-full">
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input type="text" placeholder="John Doe" v-bind="componentField" class="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="title">
          <FormItem class="w-full">
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Select v-bind="componentField">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ms">Sorcerer Developer</SelectItem>
                    <SelectItem value="dr">Master Developer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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

    <!-- SECTION 3: Class Details (Lecturer only) -->
    <Card v-if="props.profile.role === 'lecturer'" class="p-6 space-y-6">
      <h3 class="text-lg font-medium">Class Details</h3>

      <div>
        <p class="font-small">Subjects</p>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside mt-2">
          <li>CMPG111</li>
          <li>MTHS115</li>
        </ul>
      </div>

      <div class="flex items-center justify-between mt-4">
        <div class="flex items-center gap-2">
          <span class="font-small">Students</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Icon
                    name="i-lucide-info"
                    class="w-4 h-4 text-neutral-500 cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Enroll students for each subject</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div class="flex gap-2">
          <Button variant="secondary" class="flex items-center gap-1">
            <Icon name="i-lucide-upload" /> Upload student CSV
          </Button>
          <Button variant="secondary" class="flex items-center gap-1">
            <Icon name="i-lucide-plus" /> Add student
          </Button>
        </div>
      </div>
    </Card>

    <!-- SECTION 4: Personal Stats (Student only) -->
    <Card v-if="props.profile.role === 'student'" class="p-6 space-y-6">
      <h3 class="text-lg font-medium">Personal Stats</h3>

      <div>
        <p class="font-small">Subjects</p>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-inside mt-2">
          <li>CMPG111</li>
          <li>MTHS115</li>
          <li>CMPG113</li>
          <li>PHSC111</li>
        </ul>
      </div>

      <div class="flex flex-col md:flex-row items-center md:items-start justify-between mt-8">
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-6 mb-6 md:mb-0">
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/bronze.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">2</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/silver.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">1</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/gold.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">0</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/ruby.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">1</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/emerald.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">0</span>
          </div>
          <div class="flex flex-col items-center">
            <img src="/assets/flat-icons/diamond.png" class="w-14 h-14" alt="" />
            <span class="text-lg mt-1">0</span>
          </div>
        </div>

        <div class="flex flex-col items-end md:ml-6">
          <span class="text-sm text-neutral-500">Awarded title</span>
          <span class="text-2xl font-medium">{{ props.profile.title || 'Trainee' }}</span>
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

