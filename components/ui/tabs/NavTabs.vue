<script setup>
import { computed } from 'vue'
import { Tooltip } from '@/components/ui/tooltip'

const props = defineProps({
  options: Array,
  direction: {
    type: String,
    default: 'horizontal',
  },
  modelValue: [String, Number],
})

const emit = defineEmits(['update:modelValue', 'click', 'change'])

function clickOption(option) {
  if (option !== props.modelValue) {
    emit('update:modelValue', option)
    emit('change', option)
  }
  emit('click', option)
}

const __options = computed(() => {
  return props.options.map(option => ({
    ...option,
    value: option.value ?? option.name.toLowerCase(),
    visible: option.visible ?? true,
    selected: option.value === props.modelValue || option.name.toLowerCase() === props.modelValue,
  }))
})
</script>

<template>
  <div :class="direction === 'horizontal' ? 'flex flex-row gap-2' : 'flex flex-col space-y-2'">
    <template v-for="option of __options" :key="option.value">
      <div
        v-if="option.visible"
        class="relative"
        :data-tooltip-target="option.tooltip && `option-${option.value}`"
      >
        <button
          class="h-10 inline-flex items-center rounded-md px-3 py-2 transition-all duration-150"
          :class="[
            option.selected
              ? 'bg-purple-200 text-purple-600 font-semibold'
              : 'text-neutral-700 dark:text-neutral-200 hover:text-purple-600 hover:bg-transparent',
          ]"
          @click="clickOption(option.value)"
        >
          <div class="text-md w-full justify-start text-left font-semibold leading-none">
            {{ option.name }}
          </div>
        </button>

        <Tooltip v-if="option.tooltip" :id="`option-${option.value}`">
          {{ option.tooltip }}
        </Tooltip>
      </div>
    </template>
  </div>
</template>
