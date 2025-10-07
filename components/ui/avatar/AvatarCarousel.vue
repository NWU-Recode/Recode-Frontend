<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide } from 'vue3-carousel'
import Avatar from '~/components/ui/avatar/Avatar.vue'
import AvatarImage from '~/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '~/components/ui/avatar/AvatarFallback.vue'

const carouselRef = ref<InstanceType<typeof Carousel> | null>(null)

// Props
const props = withDefaults(
    defineProps<{
      profile: { full_name: string; avatar_url?: string | null }
      modelValue?: string | null
    }>(),
    { modelValue: null }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// Avatar options: include fallback as first item
const avatarOptions = [
  'FALLBACK',
  ...Array.from({ length: 18 }, (_, i) => `/avatars/avatar${i + 1}.jpeg`)
]

// Selected avatar
const selectedAvatar = ref<string | null>(props.modelValue ?? props.profile.avatar_url ?? null)
watch(selectedAvatar, (val) => emit('update:modelValue', val))

// Keep track of center index
const centerIndex = ref<number>(0)
onMounted(() => {
  const initialIndex =
      selectedAvatar.value && avatarOptions.includes(selectedAvatar.value)
          ? avatarOptions.findIndex(a => a === selectedAvatar.value)
          : 0
  centerIndex.value = initialIndex
})

// Select avatar by click
function selectAvatar(url: string, index: number) {
  selectedAvatar.value = url === 'FALLBACK' ? null : url
  centerIndex.value = index
  carouselRef.value?.slideTo(index)
}

// Navigate carousel
function nextAvatar() {
  const nextIndex = (centerIndex.value + 1) % avatarOptions.length
  selectAvatar(avatarOptions[nextIndex], nextIndex)
}
function prevAvatar() {
  const prevIndex = (centerIndex.value - 1 + avatarOptions.length) % avatarOptions.length
  selectAvatar(avatarOptions[prevIndex], prevIndex)
}

// Helper to determine size and opacity for center, adjacent, and side avatars
const sizeClass = (index: number) => {
  const distance = Math.abs(index - centerIndex.value)
  if (distance === 0) return 'h-35 w-35 rounded-[20px] transition-all duration-500'
  if (distance === 1 || distance === avatarOptions.length - 1)
    return 'h-26 w-26 rounded-[20px] transition-all duration-500 opacity-70 blur-[2px]'
  return 'h-22 w-22 rounded-[20px] transition-all duration-500 opacity-70 blur-[4px]'
}

// Compute center avatar source
const centerAvatarSrc = computed(() => selectedAvatar.value ?? props.profile.avatar_url)
</script>

<template>
  <div class="relative w-full max-w-2xl mx-auto">
    <!-- Fixed height container -->
    <div class="h-[140px]">
      <Carousel
          ref="carouselRef"
          :items-to-show="5"
          :wrap-around="true"
          :snap-align="'center'"
          :mouse-drag="true"
          :wheel="true"
          :transition="500"
          class="w-full h-full"
      >
        <Slide
            v-for="(avatar, index) in avatarOptions"
            :key="avatar + index"
            class="flex justify-center items-center h-full"
        >
          <div
              class="cursor-pointer flex items-center justify-center"
              :class="[sizeClass(index), index === centerIndex ? 'z-10' : '']"
              @click="selectAvatar(avatar, index)"
          >
            <Avatar :class="sizeClass(index)">
              <!-- Center avatar -->
              <template v-if="index === centerIndex">
                <AvatarImage v-if="centerAvatarSrc && avatar !== 'FALLBACK'" :src="centerAvatarSrc" />
                <AvatarFallback v-else>
                  <div
                      :class="sizeClass(index) + ' bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center font-extrabold text-xl'"
                  >
                    {{ props.profile.full_name.split(' ').map(n => n[0]).join('') }}
                  </div>
                </AvatarFallback>
              </template>

              <!-- Side avatars -->
              <template v-else>
                <AvatarImage v-if="avatar !== 'FALLBACK'" :src="avatar" />
                <AvatarFallback v-else>
                  <div
                      :class="sizeClass(index) + ' bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center font-extrabold text-xl'"
                  >
                    {{ props.profile.full_name.split(' ').map(n => n[0]).join('') }}
                  </div>
                </AvatarFallback>
              </template>
            </Avatar>
          </div>
        </Slide>

        <!-- Custom navigation buttons -->
        <template #addons>
          <div class="absolute top-1/2 -left-2 -translate-y-1/2 z-20">
            <button
                type="button"
                @click="prevAvatar"
                class="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow"
            >‹</button>
          </div>
          <div class="absolute top-1/2 -right-2 -translate-y-1/2 z-20">
            <button
                type="button"
                @click="nextAvatar"
                class="p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow"
            >›</button>
          </div>
        </template>
      </Carousel>
    </div>
  </div>
</template>

<style>
.carousel__slide {
  transition: transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease;
}
</style>
