<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleOverlayClick">
        <div
          class="modal-container"
          :class="{
            'max-w-sm': size === 'small',
            'max-w-2xl': size === 'large',
          }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <div class="modal-title" :id="titleId">
              <slot name="header">
                <h3 class="text-lg font-semibold">{{ title }}</h3>
              </slot>
            </div>
            <button
              v-if="closable"
              class="modal-close"
              @click="close"
              aria-label="Close modal"
            >
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Close } from '@element-plus/icons-vue';

  interface Props {
    isOpen: boolean;
    title?: string;
    size?: 'small' | 'medium' | 'large';
    closable?: boolean;
    maskClosable?: boolean;
    centered?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    closable: true,
    maskClosable: true,
    centered: true,
  });

  const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    close: [];
    open: [];
  }>();

  const titleId = computed(
    () => `modal-title-${Math.random().toString(36).substr(2, 9)}`,
  );

  const close = () => {
    emit('update:isOpen', false);
    emit('close');
  };

  const handleOverlayClick = () => {
    if (props.maskClosable) {
      close();
    }
  };
</script>

<style scoped>
  .modal-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4;
  }

  .modal-container {
    @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
  }

  .modal-header {
    @apply flex items-center justify-between p-4 border-b border-gray-200;
  }

  .modal-title {
    @apply flex-1;
  }

  .modal-close {
    @apply text-gray-400 hover:text-gray-600 transition-colors;
  }

  .modal-body {
    @apply p-4 max-h-[70vh] overflow-y-auto;
  }

  .modal-footer {
    @apply flex items-center justify-end gap-2 p-4 border-t border-gray-200;
  }

  /* Transitions */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: transform 0.3s ease;
  }

  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: scale(0.9) translateY(-20px);
  }
</style>
