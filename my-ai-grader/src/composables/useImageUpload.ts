import { ref, computed } from 'vue';
import { InputValidator } from '@/utils/validation';
import { generateUniqueId, compressImage } from '@/utils/fileUtils';
import type { StandardAnswerImage } from '@/types/grading';

export function useImageUpload(
  maxImages = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
) {
  const images = ref<StandardAnswerImage[]>([]);
  const isDragging = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const canAddMoreImages = computed(() => images.value.length < maxImages);
  const totalSize = computed(() =>
    images.value.reduce((sum, img) => sum + img.size, 0),
  );

  const addImage = async (
    file: File,
    compressedDataUrl?: string,
  ): Promise<StandardAnswerImage | null> => {
    uploadError.value = null;

    // Validate file
    const validation = InputValidator.validateFileUpload(file);
    if (!validation.isValid) {
      uploadError.value = validation.errors[0].message;
      return null;
    }

    // Check if we've reached the limit
    if (!canAddMoreImages.value) {
      uploadError.value = `Maximum ${maxImages} images allowed`;
      return null;
    }

    try {
      // Use provided compressed data URL or compress if needed
      let dataUrl = compressedDataUrl;
      if (!dataUrl) {
        dataUrl = await compressImage(file, 1920, 1080, 0.8);
      }

      const image: StandardAnswerImage = {
        id: generateUniqueId(),
        file,
        dataUrl,
        order: images.value.length,
        name: file.name.replace(/[^\w\s.-]/g, ''), // Sanitize filename
        size: file.size,
      };

      images.value.push(image);
      return image;
    } catch (error) {
      uploadError.value =
        error instanceof Error ? error.message : 'Failed to process image';
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
    if (
      event.currentTarget &&
      !(event.currentTarget as HTMLElement).contains(
        event.relatedTarget as Node,
      )
    ) {
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
