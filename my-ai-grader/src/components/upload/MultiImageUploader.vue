<template>
  <div class="multi-image-uploader">
    <!-- Upload Area -->
    <div
      class="upload-area"
      :class="{
        'upload-area--dragging': isDragging,
        'upload-area--disabled': !canAddMore,
      }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="triggerFileInput"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="upload-content">
        <el-icon class="upload-icon" :size="48"><UploadFilled /></el-icon>
        <div class="upload-text">
          <p class="upload-title">
            {{
              canAddMore ? 'Drag & drop images here' : 'Maximum images reached'
            }}
          </p>
          <p class="upload-subtitle">
            {{ canAddMore ? 'or click to browse' : '' }}
          </p>
        </div>
        <div class="upload-info">
          <span>{{ images.length }}/{{ maxImages }} images</span>
          <span>• Max {{ formatFileSize(maxFileSize) }} each</span>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <el-alert
      v-if="uploadError"
      type="error"
      :title="uploadError"
      :closable="true"
      @close="uploadError = ''"
    />

    <!-- Image Gallery -->
    <div v-if="images.length > 0" class="image-gallery">
      <div class="gallery-header">
        <h4>Uploaded Images ({{ images.length }})</h4>
        <el-button size="small" type="text" @click="clearAll">
          <el-icon><Delete /></el-icon>
          Clear All
        </el-button>
      </div>

      <div class="image-grid">
        <div
          v-for="image in images"
          :key="image.id"
          class="image-item"
          draggable="true"
          @dragstart="handleDragStart($event, image)"
          @dragover="handleDragOverImage($event, image)"
          @drop="handleDropImage($event, image)"
        >
          <div class="image-preview">
            <img :src="image.dataUrl" :alt="image.name" />
            <div class="image-overlay">
              <div class="image-info">
                <p class="image-name" :title="image.name">
                  {{ truncateText(image.name, 20) }}
                </p>
                <p class="image-size">{{ formatFileSize(image.size) }}</p>
              </div>
              <div class="image-actions">
                <el-button
                  size="small"
                  type="text"
                  class="remove-btn"
                  @click="removeImage(image.id)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div class="image-order">
            <el-tag size="small" type="info">#{{ image.order + 1 }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import { UploadFilled, Delete, Close } from '@element-plus/icons-vue';
  import type { StandardAnswerImage } from '@/types/grading';
  import { useImageUpload } from '@/composables/useImageUpload';
  import { formatFileSize, compressImage } from '@/utils/fileUtils';
  import { InputValidator } from '@/utils/validation';

  interface Props {
    maxImages?: number;
    maxFileSize?: number;
    onImagesChange?: (images: StandardAnswerImage[]) => void;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxImages: 10,
    maxFileSize: 2 * 1024 * 1024, // 2MB
  });

  const emit = defineEmits<{
    imagesChange: [images: StandardAnswerImage[]];
    'update:maxImages': [value: number];
  }>();

  const fileInput = ref<HTMLInputElement | null>(null);
  const dragCounter = ref(0);

  const {
    images,
    isDragging,
    uploadError,
    canAddMoreImages,
    addImage,
    removeImage,
    reorderImages,
    clearImages,
  } = useImageUpload(props.maxImages, props.maxFileSize);

  const canAddMore = computed(() => images.value.length < props.maxImages);

  // Watch for image changes and emit event
  const handleImageChange = () => {
    emit('imagesChange', [...images.value]);
  };

  const triggerFileInput = () => {
    if (canAddMore.value) {
      fileInput.value?.click();
    }
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    for (const file of files) {
      const validation = InputValidator.validateFileUpload(file);
      if (!validation.isValid) {
        ElMessage.error(
          `Invalid file ${file.name}: ${validation.errors[0].message}`,
        );
        continue;
      }

      try {
        // Compress large images before adding
        const compressedDataUrl = await compressImage(file, 1920, 1080, 0.8);
        const compressedFile = new File([file], file.name, { type: file.type });

        const result = await addImage(compressedFile, compressedDataUrl);
        if (result) {
          handleImageChange();
        }
      } catch (error) {
        ElMessage.error(
          `Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Reset input
    target.value = '';
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    dragCounter.value++;
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    dragCounter.value--;
    if (dragCounter.value === 0) {
      isDragging.value = false;
    }
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    dragCounter.value = 0;
    isDragging.value = false;

    const files = Array.from(event.dataTransfer?.files || []);

    for (const file of files) {
      const validation = InputValidator.validateFileUpload(file);
      if (!validation.isValid) {
        ElMessage.error(
          `Invalid file ${file.name}: ${validation.errors[0].message}`,
        );
        continue;
      }

      try {
        // Compress large images before adding
        const compressedDataUrl = await compressImage(file, 1920, 1080, 0.8);
        const compressedFile = new File([file], file.name, { type: file.type });

        const result = await addImage(compressedFile, compressedDataUrl);
        if (result) {
          handleImageChange();
        }
      } catch (error) {
        ElMessage.error(
          `Failed to process file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  };

  const handleDragStart = (event: DragEvent, image: StandardAnswerImage) => {
    event.dataTransfer!.setData('text/plain', image.id);
  };

  const handleDragOverImage = (
    event: DragEvent,
    targetImage: StandardAnswerImage,
  ) => {
    event.preventDefault();
  };

  const handleDropImage = (
    event: DragEvent,
    targetImage: StandardAnswerImage,
  ) => {
    event.preventDefault();

    const draggedId = event.dataTransfer!.getData('text/plain');
    const draggedIndex = images.value.findIndex((img) => img.id === draggedId);
    const targetIndex = images.value.findIndex(
      (img) => img.id === targetImage.id,
    );

    if (
      draggedIndex !== -1 &&
      targetIndex !== -1 &&
      draggedIndex !== targetIndex
    ) {
      const newImages = [...images.value];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedImage);

      reorderImages(newImages);
      handleImageChange();
    }
  };

  const clearAll = () => {
    clearImages();
    handleImageChange();
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  // Expose methods for parent components
  defineExpose({
    images,
    clearAll,
  });
</script>

<style scoped>
  .multi-image-uploader {
    @apply space-y-4;
  }

  .upload-area {
    @apply border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors;
  }

  .upload-area:hover {
    @apply border-blue-400 bg-blue-50;
  }

  .upload-area--dragging {
    @apply border-blue-500 bg-blue-100;
  }

  .upload-area--disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .upload-content {
    @apply flex flex-col items-center space-y-4;
  }

  .upload-icon {
    @apply text-gray-400;
  }

  .upload-title {
    @apply text-lg font-medium text-gray-700;
  }

  .upload-subtitle {
    @apply text-sm text-gray-500;
  }

  .upload-info {
    @apply text-xs text-gray-400 space-x-2;
  }

  .image-gallery {
    @apply space-y-4;
  }

  .gallery-header {
    @apply flex items-center justify-between;
  }

  .image-grid {
    @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4;
  }

  .image-item {
    @apply relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-transform hover:scale-105;
  }

  .image-preview {
    @apply relative aspect-square;
  }

  .image-preview img {
    @apply w-full h-full object-cover;
  }

  .image-overlay {
    @apply absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity;
  }

  .image-info {
    @apply absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 hover:opacity-100 transition-opacity;
  }

  .image-name {
    @apply text-white text-sm font-medium truncate;
  }

  .image-size {
    @apply text-white text-xs;
  }

  .image-actions {
    @apply absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity;
  }

  .remove-btn {
    @apply bg-red-500 text-white rounded-full p-1 hover:bg-red-600;
  }

  .image-order {
    @apply absolute top-2 left-2;
  }

  .hidden {
    @apply hidden;
  }
</style>
