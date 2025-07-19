import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import {
  validateFile,
  formatFileSize,
  generateUniqueId,
  sanitizeFileName,
} from '@/utils/validation';
import type { StandardAnswerImage } from '@/types/grading';
import type { ValidationRule } from '@/types/common';

export function useImageUpload(
  maxImages = 10,
  maxSize = 2 * 1024 * 1024, // 2MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
) {
  const images = ref<StandardAnswerImage[]>([]);
  const isDragging = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);

  const validationRules: ValidationRule[] = [
    { type: 'type', allowedTypes },
    { type: 'size', maxSize },
    { type: 'count', maxCount: maxImages },
  ];

  const canAddMoreImages = computed(() => images.value.length < maxImages);
  const totalSize = computed(() =>
    images.value.reduce((sum, img) => sum + img.size, 0),
  );

  const addImage = async (file: File): Promise<StandardAnswerImage | null> => {
    uploadError.value = null;

    // Validate file
    const validation = validateFile(file, validationRules);
    if (!validation.isValid) {
      uploadError.value = validation.error || 'Invalid file';
      return null;
    }

    // Check if we've reached the limit
    if (!canAddMoreImages.value) {
      uploadError.value = `Maximum ${maxImages} images allowed`;
      return null;
    }

    try {
      // Convert to data URL
      const dataUrl = await fileToDataUrl(file);

      const image: StandardAnswerImage = {
        id: generateUniqueId(),
        file,
        dataUrl,
        order: images.value.length,
        name: sanitizeFileName(file.name),
        size: file.size,
      };

      images.value.push(image);
      return image;
    } catch (error) {
      uploadError.value = 'Failed to process image';
      return null;
    }
  };

  const removeImage = (imageId: string) => {
    const index = images.value.findIndex((img) => img.id === imageId);
    if (index > -1) {
      images.value.splice(index, 1);
      // Reorder remaining images
      images.value.forEach((img, idx) => {
        img.order = idx;
      });
    }
  };

  const reorderImages = (newOrder: StandardAnswerImage[]) => {
    images.value = newOrder.map((img, idx) => ({
      ...img,
      order: idx,
    }));
  };

  const clearImages = () => {
    images.value = [];
    uploadError.value = null;
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      isDragging.value = false;
    }
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    uploadError.value = null;

    const files = Array.from(event.dataTransfer?.files || []);

    for (const file of files) {
      await addImage(file);
    }
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    for (const file of files) {
      await addImage(file);
    }

    // Reset input value to allow selecting the same file again
    target.value = '';
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    images,
    isDragging,
    uploadProgress,
    uploadError,
    canAddMoreImages,
    totalSize,
    addImage,
    removeImage,
    reorderImages,
    clearImages,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
}
