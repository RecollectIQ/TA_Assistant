<template>
  <div class="image-gallery-preview">
    <!-- Header -->
    <div v-if="showHeader" class="gallery-header">
      <h3 class="gallery-title">{{ title }}</h3>
      <div class="gallery-actions">
        <el-button v-if="allowReorder" size="small" @click="toggleReorderMode">
          <el-icon><Operation /></el-icon>
          {{ reorderMode ? 'Done Reordering' : 'Reorder' }}
        </el-button>
        <el-button
          v-if="allowDelete && images.length > 0"
          size="small"
          type="danger"
          @click="confirmDeleteAll"
        >
          <el-icon><Delete /></el-icon>
          Clear All
        </el-button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="images.length === 0" class="empty-state">
      <el-empty description="No images uploaded" />
    </div>

    <!-- Image Grid -->
    <div v-else class="gallery-content">
      <div class="image-grid" :class="{ 'reorder-mode': reorderMode }">
        <div
          v-for="(image, index) in images"
          :key="image.id"
          class="image-container"
          :class="{
            draggable: reorderMode,
            dragging: draggingId === image.id,
            'drag-over': dragOverId === image.id,
          }"
          :draggable="reorderMode"
          @dragstart="handleDragStart(image)"
          @dragover="handleDragOver(image)"
          @dragleave="handleDragLeave(image)"
          @drop="handleDrop(image)"
          @dragend="handleDragEnd"
        >
          <!-- Image -->
          <div class="image-wrapper">
            <img
              :src="image.dataUrl"
              :alt="image.name"
              class="gallery-image"
              @click="openPreview(index)"
            />

            <!-- Overlay -->
            <div class="image-overlay">
              <div class="image-info">
                <span class="image-order">#{{ index + 1 }}</span>
                <span class="image-name" :title="image.name">{{
                  truncateText(image.name, 15)
                }}</span>
                <span class="image-size">{{
                  InputValidator.formatFileSize(image.size)
                }}</span>
              </div>

              <!-- Actions -->
              <div class="image-actions">
                <el-button
                  v-if="allowView"
                  size="small"
                  type="text"
                  @click="openPreview(index)"
                >
                  <el-icon><View /></el-icon>
                </el-button>

                <el-button
                  v-if="allowDelete"
                  size="small"
                  type="text"
                  class="delete-btn"
                  @click="confirmDelete(image.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- Reorder Indicator -->
          <div v-if="reorderMode" class="reorder-indicator">
            <el-icon><Rank /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <el-dialog
      v-model="previewVisible"
      :title="currentPreviewImage?.name"
      width="80%"
      :fullscreen="false"
    >
      <div class="preview-content">
        <img
          v-if="currentPreviewImage"
          :src="currentPreviewImage.dataUrl"
          :alt="currentPreviewImage.name"
          class="preview-image"
        />
        <div class="preview-info">
          <p><strong>Name:</strong> {{ currentPreviewImage?.name }}</p>
          <p>
            <strong>Size:</strong>
            {{ InputValidator.formatFileSize(currentPreviewImage?.size || 0) }}
          </p>
          <p><strong>Order:</strong> #{{ currentPreviewIndex + 1 }}</p>
        </div>
      </div>

      <template #footer>
        <div class="preview-actions">
          <el-button
            :disabled="currentPreviewIndex === 0"
            @click="previousImage"
          >
            <el-icon><ArrowLeft /></el-icon>
            Previous
          </el-button>
          <span>{{ currentPreviewIndex + 1 }} / {{ images.length }}</span>
          <el-button
            :disabled="currentPreviewIndex === images.length - 1"
            @click="nextImage"
          >
            Next
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import {
    Delete,
    View,
    Operation,
    Rank,
    ArrowLeft,
    ArrowRight,
  } from '@element-plus/icons-vue';
  import type { StandardAnswerImage } from '@/types/grading';
  import { InputValidator } from '@/utils/validation';

  interface Props {
    images: StandardAnswerImage[];
    title?: string;
    allowReorder?: boolean;
    allowDelete?: boolean;
    allowView?: boolean;
    showHeader?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Image Gallery',
    allowReorder: true,
    allowDelete: true,
    allowView: true,
    showHeader: true,
  });

  const emit = defineEmits<{
    reorder: [newOrder: StandardAnswerImage[]];
    delete: [imageId: string];
    deleteAll: [];
  }>();

  // State
  const reorderMode = ref(false);
  const draggingId = ref<string | null>(null);
  const dragOverId = ref<string | null>(null);
  const previewVisible = ref(false);
  const currentPreviewIndex = ref(0);

  // Computed
  const currentPreviewImage = computed(
    () => props.images[currentPreviewIndex.value],
  );

  // Methods
  const toggleReorderMode = () => {
    reorderMode.value = !reorderMode.value;
  };

  const handleDragStart = (image: StandardAnswerImage) => {
    if (!reorderMode.value) return;
    draggingId.value = image.id;
  };

  const handleDragOver = (image: StandardAnswerImage) => {
    if (!reorderMode.value || draggingId.value === image.id) return;
    event?.preventDefault();
    dragOverId.value = image.id;
  };

  const handleDragLeave = (image: StandardAnswerImage) => {
    if (dragOverId.value === image.id) {
      dragOverId.value = null;
    }
  };

  const handleDrop = (targetImage: StandardAnswerImage) => {
    if (!reorderMode.value || !draggingId.value) return;

    event?.preventDefault();
    dragOverId.value = null;

    const draggedIndex = props.images.findIndex(
      (img) => img.id === draggingId.value,
    );
    const targetIndex = props.images.findIndex(
      (img) => img.id === targetImage.id,
    );

    if (
      draggedIndex !== -1 &&
      targetIndex !== -1 &&
      draggedIndex !== targetIndex
    ) {
      const newOrder = [...props.images];
      const [draggedImage] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedImage);

      // Update order property
      newOrder.forEach((img, index) => {
        img.order = index;
      });

      emit('reorder', newOrder);
    }
  };

  const handleDragEnd = () => {
    draggingId.value = null;
    dragOverId.value = null;
  };

  const openPreview = (index: number) => {
    currentPreviewIndex.value = index;
    previewVisible.value = true;
  };

  const previousImage = () => {
    if (currentPreviewIndex.value > 0) {
      currentPreviewIndex.value--;
    }
  };

  const nextImage = () => {
    if (currentPreviewIndex.value < props.images.length - 1) {
      currentPreviewIndex.value++;
    }
  };

  const confirmDelete = async (imageId: string) => {
    try {
      await ElMessageBox.confirm(
        'Are you sure you want to delete this image?',
        'Confirm Delete',
        {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          type: 'warning',
        },
      );

      emit('delete', imageId);
      ElMessage.success('Image deleted successfully');
    } catch {
      // User cancelled
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await ElMessageBox.confirm(
        'Are you sure you want to delete all images?',
        'Confirm Delete All',
        {
          confirmButtonText: 'Delete All',
          cancelButtonText: 'Cancel',
          type: 'warning',
        },
      );

      emit('deleteAll');
      ElMessage.success('All images deleted successfully');
    } catch {
      // User cancelled
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };
</script>

<style scoped>
  .image-gallery-preview {
    @apply space-y-4;
  }

  .gallery-header {
    @apply flex items-center justify-between mb-4;
  }

  .gallery-title {
    @apply text-lg font-semibold text-gray-900;
  }

  .gallery-actions {
    @apply flex gap-2;
  }

  .image-grid {
    @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4;
  }

  .image-container {
    @apply relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200;
  }

  .image-container.draggable {
    @apply cursor-move;
  }

  .image-container.dragging {
    @apply opacity-50 scale-95;
  }

  .image-container.drag-over {
    @apply border-blue-500 border-2;
  }

  .image-wrapper {
    @apply relative aspect-square;
  }

  .gallery-image {
    @apply w-full h-full object-cover cursor-pointer;
  }

  .image-overlay {
    @apply absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity duration-200;
  }

  .image-info {
    @apply absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity;
  }

  .image-order {
    @apply text-white text-xs font-bold;
  }

  .image-name {
    @apply text-white text-xs truncate;
  }

  .image-size {
    @apply text-white text-xs opacity-75;
  }

  .image-actions {
    @apply absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity;
  }

  .delete-btn {
    @apply text-red-500 hover:text-red-700;
  }

  .reorder-indicator {
    @apply absolute top-2 left-2 text-blue-500;
  }

  .empty-state {
    @apply text-center py-8;
  }

  .preview-content {
    @apply text-center;
  }

  .preview-image {
    @apply max-w-full max-h-96 mx-auto rounded;
  }

  .preview-info {
    @apply mt-4 text-left text-sm text-gray-600;
  }

  .preview-actions {
    @apply flex items-center justify-center gap-4;
  }
</style>
