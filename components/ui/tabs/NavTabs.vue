<script setup>
import { computed, ref } from 'vue';
import {Tooltip} from "@/components/ui/tooltip";

const props = defineProps({
  options: Array,
  direction: {
    type: String,
    default: 'horizontal',
  },
});

const emit = defineEmits(['update:modelValue', 'click', 'change']);

const model = defineModel()

const clickOption = (option) => {
  emit('update:modelValue', option);
  emit('click', option);

  if (option !== model.value) {
    emit('change', option);
    model.value = option;
  }
};

const __options = computed(() => {
  return props.options.map((option) => ({
    ...option,
    value: option.value ?? option.name.toLowerCase(),
    visible: option.visible ?? true,
    selected() {
      return this.value === props.modelValue;
    },
  }));
});
</script>

<template>
  <div :class="direction === 'horizontal' ? 'flex flex-row gap-2' : 'flex flex-col space-y-2'">
    <template v-for="option of __options" :key="option.value">
      <div
          v-if="option.visible"
          class="relative"
          :data-tooltip-target="option.tooltip && 'option-' + option.value"
      >
        <Button
            @click="clickOption(option.value)"
            :active="option.selected()"
            class="text-sm px-3 py-2 rounded-md transition-all duration-150 w-[150px] text-center"
            :class="[
                        option.selected()
                          ? 'bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white font-semibold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
                    ]"
        >
          {{ option.name }}
        </Button>

        <Tooltip v-if="option.tooltip" :id="'option-' + option.value">
          {{ option.tooltip }}
        </Tooltip>
      </div>
    </template>
  </div>
</template>
