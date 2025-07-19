<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <el-icon v-if="loading" class="animate-spin">
      <Loading />
    </el-icon>
    <el-icon v-else-if="icon">
      <component :is="icon" />
    </el-icon>
    <span v-if="$slots.default" :class="{ 'ml-2': icon || loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Loading } from '@element-plus/icons-vue';

  interface Props {
    variant?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'warning'
      | 'danger'
      | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: any;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'medium',
    type: 'button',
    disabled: false,
    loading: false,
    fullWidth: false,
  });

  const emit = defineEmits<{
    click: [event: MouseEvent];
  }>();

  const buttonClasses = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': props.disabled || props.loading,
      'base-button--loading': props.loading,
      'base-button--full-width': props.fullWidth,
    },
  ]);

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', event);
    }
  };
</script>

<style scoped>
  .base-button {
    @apply inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .base-button--primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }

  .base-button--secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500;
  }

  .base-button--success {
    @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500;
  }

  .base-button--warning {
    @apply bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500;
  }

  .base-button--danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }

  .base-button--ghost {
    @apply bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border border-gray-300;
  }

  .base-button--small {
    @apply px-3 py-1.5 text-sm;
  }

  .base-button--medium {
    @apply px-4 py-2 text-base;
  }

  .base-button--large {
    @apply px-6 py-3 text-lg;
  }

  .base-button--disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .base-button--loading {
    @apply cursor-wait;
  }

  .base-button--full-width {
    @apply w-full;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
