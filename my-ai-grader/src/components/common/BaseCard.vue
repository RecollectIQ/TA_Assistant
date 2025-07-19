<template>
  <div class="base-card" :class="cardClasses">
    <!-- Header -->
    <div v-if="$slots.header || title" class="base-card__header">
      <slot name="header">
        <h3 class="base-card__title">{{ title }}</h3>
      </slot>
    </div>

    <!-- Body -->
    <div class="base-card__body" :class="bodyClasses">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    title?: string;
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'small' | 'medium' | 'large';
    shadow?: boolean;
    hoverable?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    padding: 'medium',
    shadow: true,
    hoverable: false,
  });

  const cardClasses = computed(() => [
    'base-card',
    `base-card--${props.variant}`,
    {
      'base-card--shadow': props.shadow,
      'base-card--hoverable': props.hoverable,
    },
  ]);

  const bodyClasses = computed(() => [
    'base-card__body',
    `base-card__body--${props.padding}`,
  ]);
</script>

<style scoped>
  .base-card {
    @apply bg-white rounded-lg border border-gray-200;
  }

  .base-card--outlined {
    @apply border-2 border-gray-300;
  }

  .base-card--elevated {
    @apply shadow-md;
  }

  .base-card--shadow {
    @apply shadow-sm;
  }

  .base-card--hoverable {
    @apply transition-shadow hover:shadow-md;
  }

  .base-card__header {
    @apply px-4 py-3 border-b border-gray-200;
  }

  .base-card__title {
    @apply text-lg font-semibold text-gray-900;
  }

  .base-card__body {
    @apply flex-1;
  }

  .base-card__body--none {
    @apply p-0;
  }

  .base-card__body--small {
    @apply p-2;
  }

  .base-card__body--medium {
    @apply p-4;
  }

  .base-card__body--large {
    @apply p-6;
  }

  .base-card__footer {
    @apply px-4 py-3 border-t border-gray-200 bg-gray-50;
  }
</style>
