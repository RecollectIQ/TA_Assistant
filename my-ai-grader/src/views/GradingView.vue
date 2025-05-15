<template>
  <el-container class="grading-layout">
    <el-main class="image-display-area">
      <el-card shadow="never" style="height: 100%">
        <template #header>
          <div class="card-header">
            <span
              ><el-icon style="margin-right: 4px"><PictureFilled /></el-icon
              >图片展示区</span
            >
          </div>
        </template>
        <el-upload
          class="image-uploader"
          action="#"
          :show-file-list="false"
          :on-success="handleImageSuccess"
          :before-upload="beforeImageUpload"
          :http-request="customImageUpload"
          drag
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 jpg/png 文件，且不超过 2MB
            </div>
          </template>
        </el-upload>
        <el-image
          v-if="imageUrl"
          :src="imageUrl"
          fit="contain"
          class="uploaded-image-preview"
        />
        <el-empty v-else description="请上传图片进行批改" />
        <!-- 图片上传和展示逻辑将在此处实现 (模块 11.3) -->
      </el-card>
    </el-main>
    <el-aside width="400px" class="results-sidebar">
      <el-card shadow="never" style="height: 100%">
        <template #header>
          <div class="card-header">
            <span
              ><el-icon style="margin-right: 4px"><List /></el-icon
              >批改结果侧边栏</span
            >
          </div>
        </template>
        <div v-loading="isLoadingGrade" class="results-content">
          <div class="detailed-feedback">
            <h4>
              <el-icon><ChatDotSquare /></el-icon> 详细反馈
            </h4>
            <el-scrollbar class="feedback-scrollbar">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div
                v-if="detailedFeedbackAvailable"
                class="markdown-content"
                v-html="renderedMarkdown"
              ></div>
              <el-empty
                v-else
                :description="
                  isLoadingGrade ? '正在努力分析中，请稍候...' : '暂无详细反馈'
                "
              />
            </el-scrollbar>
          </div>

          <el-divider />

          <div class="result-actions">
            <h4>
              <el-icon><Tools /></el-icon> 操作
            </h4>
            <el-button
              type="primary"
              :disabled="!imageUrl || isLoadingGrade"
              @click="handleGradeImage"
              ><el-icon style="margin-right: 4px"><EditPen /></el-icon
              >重新批改</el-button
            >
            <el-button type="success" plain disabled
              ><el-icon style="margin-right: 4px"><Download /></el-icon
              >下载报告</el-button
            >
          </div>
        </div>
        <!-- 结果展示和编辑逻辑将在此处实现 (模块 11.5) -->
      </el-card>
    </el-aside>
  </el-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import type {
    UploadProps,
    UploadRawFile /*, UploadFile */,
  } from 'element-plus';
  import {
    UploadFilled,
    List,
    PictureFilled,
    Memo,
    ChatDotSquare,
    Tools,
    EditPen,
    Download,
  } from '@element-plus/icons-vue';
  import { useGradingStore } from '@/stores/gradingStore';
  import axios from 'axios';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import defaultPrompt from '@/config/default_prompt.txt?raw'; // Import the prompt text

  const gradingStore = useGradingStore();

  const imageUrl = computed(() => gradingStore.imageUrl);

  const detailedFeedbackAvailable = ref(false);
  const gradingResultText = ref('');
  const isLoadingGrade = ref(false);

  const renderedMarkdown = computed(() => {
    if (detailedFeedbackAvailable.value && gradingResultText.value) {
      const rawHtml = marked(gradingResultText.value);
      return DOMPurify.sanitize(rawHtml as string);
    }
    return '';
  });

  const handleGradeImage = async () => {
    if (!imageUrl.value) {
      ElMessage.error('请先上传一张图片。');
      return;
    }
    isLoadingGrade.value = true;
    gradingResultText.value = '';
    detailedFeedbackAvailable.value = false;

    const promptText = defaultPrompt; // Use the imported prompt

    try {
      console.log('Sending to /api/grade (Base64):', {
        imageDataLength: imageUrl.value?.length, // Log length for brevity
        prompt: promptText,
      });
      const response = await axios.post('http://localhost:5000/api/grade', {
        imageData: imageUrl.value, // This will now be a base64 data URL
        prompt: promptText,
      });
      console.log('Response from /api/grade:', response.data);
      if (
        response.data &&
        response.data.choices &&
        response.data.choices[0] &&
        response.data.choices[0].message
      ) {
        const rawContent = response.data.choices[0].message.content;
        console.log('Raw AI content:', rawContent); // Log raw content for debugging
        gradingResultText.value = rawContent;
        detailedFeedbackAvailable.value = true;
        ElMessage.success('图片批改成功！');
      } else {
        ElMessage.error('从后端获取的批改结果格式不正确。');
        console.error('Unexpected response structure:', response.data);
        gradingResultText.value = JSON.stringify(response.data, null, 2);
        detailedFeedbackAvailable.value = true;
      }
    } catch (error: any) {
      console.error('Error calling /api/grade:', error);
      let errorMessage = '调用批改服务失败。';
      if (error.response) {
        console.error('Backend Error Data:', error.response.data);
        errorMessage += ` 错误: ${error.response.data?.error || error.response.status}`;
        gradingResultText.value = `错误: ${error.response.data?.error || '未知后端错误'}`;
      } else if (error.request) {
        errorMessage += ' 后端无响应。';
        gradingResultText.value = '错误: 后端服务无响应。';
      } else {
        errorMessage += ` ${error.message}`;
        gradingResultText.value = `错误: ${error.message}`;
      }
      ElMessage.error(errorMessage);
      detailedFeedbackAvailable.value = true;
    } finally {
      isLoadingGrade.value = false;
    }
  };

  const customImageUpload = (options: any) => {
    console.log('Custom upload method called for file:', options.file.name);
    const rawFile = options.file as UploadRawFile;

    // Validate file type and size again, just in case (though beforeUpload should handle it)
    if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
      ElMessage.error('图片必须是 JPG 或 PNG 格式!');
      options.onError(new Error('Invalid file type')); // Notify ElUpload of error
      return;
    }
    if (rawFile.size / 1024 / 1024 > 2) {
      ElMessage.error('图片大小不能超过 2MB!');
      options.onError(new Error('File too large')); // Notify ElUpload of error
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      gradingStore.setImageUrl(base64Url); // Store base64 URL
      ElMessage.success('图片上传成功，准备批改。');
      options.onSuccess({ url: base64Url }, options.file); // Notify ElUpload of success

      // Automatically trigger grading after successful upload and conversion
      setTimeout(() => {
        handleGradeImage();
      }, 0);
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      ElMessage.error('图片读取失败!');
      options.onError(error); // Notify ElUpload of error
    };
    reader.readAsDataURL(rawFile); // Read as Base64 Data URL
  };

  const handleImageSuccess: UploadProps['onSuccess'] = (
    response, // This will be the { url: base64Url } from customImageUpload's onSuccess
    uploadFile,
    // uploadFiles, // No longer needed with single image focus and customImageUpload handling it
  ) => {
    // This function might be less critical now customImageUpload handles everything,
    // but we'll keep it aligned in case ElUpload triggers it differently.
    console.log(
      'Image upload success (handleImageSuccess):',
      response,
      uploadFile,
    );
    let newImageUrl = '';
    if (response && (response as any).url) {
      newImageUrl = (response as any).url; // Should be base64 from customImageUpload
    } else if (uploadFile.url) {
      // Fallback if ElUpload provides its own URL (e.g. blob from internal processing)
      newImageUrl = uploadFile.url;
    }
    // Ensure store always has the base64 URL if possible
    // If newImageUrl is a blob, this would be problematic.
    // However, customImageUpload should ensure it's base64.
    if (newImageUrl) {
      gradingStore.setImageUrl(newImageUrl);
    } else {
      // If somehow we don't get a URL, try to re-process from raw if available.
      // This is a fallback, ideally customImageUpload ensures the store is set correctly.
      if (uploadFile.raw) {
        const reader = new FileReader();
        reader.onload = (e) => {
          gradingStore.setImageUrl(e.target?.result as string);
        };
        reader.readAsDataURL(uploadFile.raw);
      }
    }
  };

  const beforeImageUpload: UploadProps['beforeUpload'] = (
    rawFile: UploadRawFile,
  ) => {
    if (!['image/jpeg', 'image/png'].includes(rawFile.type)) {
      ElMessage.error('图片必须是 JPG 或 PNG 格式!');
      return false;
    }
    if (rawFile.size / 1024 / 1024 > 2) {
      ElMessage.error('图片大小不能超过 2MB!');
      return false;
    }
    return true;
  };

  // Placeholder for future script logic
</script>

<style scoped>
  .grading-layout {
    height: calc(
      100vh - 60px - 40px
    ); /* Full viewport height minus header (60px) and main padding (20px*2) */
    /* Adjust 60px if your header height is different */
  }

  .image-display-area,
  .results-sidebar {
    padding: 0; /* Remove default padding from el-main/el-aside if ElCard is direct child */
    height: 100%;
  }

  .image-display-area .el-card,
  .results-sidebar .el-card {
    border: none; /* Remove card border if it's part of a larger layout section */
    border-radius: 0; /* Remove card border-radius if it's flush with layout edges */
  }

  .card-header {
    display: flex;
    align-items: center;
    font-size: 1.1em; /* Slightly smaller for sub-sections */
    font-weight: bold;
  }

  /* Ensure cards fill their respective layout areas */
  :deep(.el-card__body) {
    height: calc(
      100% - 59px
    ); /* Adjust 59px if card header height is different */
    display: flex;
    flex-direction: column;
    /* justify-content: center; /* Center ElEmpty for now. Remove for image display area if content is top-aligned */
  }

  .results-sidebar :deep(.el-card__body) {
    justify-content: flex-start; /* Override for results sidebar to allow content to flow from top */
    padding: 0; /* Remove card body padding if .results-content handles it */
  }

  .image-display-area :deep(.el-card__body) {
    align-items: center; /* Keep centering for upload/image preview */
    justify-content: center;
  }

  .el-empty {
    flex-grow: 1;
  }

  /* If you want a visible separator */
  .results-sidebar {
    border-left: 1px solid var(--el-border-color-light);
  }

  /* 新增样式 */
  .image-uploader {
    margin-bottom: 20px;
    width: 100%; /* 让上传组件宽度适应卡片 */
  }

  .uploaded-image-preview {
    max-width: 100%;
    max-height: calc(100% - 160px); /* 示例值，根据上传组件和其他元素高度调整 */
    margin-top: 20px;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
  }

  :deep(.el-upload-dragger) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px; /* 给拖拽区域一个最小高度 */
  }

  .el-upload__text em {
    color: var(--el-color-primary);
  }

  /* 新增样式 for results sidebar content */
  .results-content {
    padding: 15px;
    font-size: 0.9em;
    display: flex; /* Make this a flex container */
    flex-direction: column; /* Stack children vertically */
    height: 100%; /* Ensure it tries to fill the card body */
    /* overflow: hidden; /* Let child elements (scrollbar) handle overflow */
  }

  .results-content h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.1em;
    display: flex;
    align-items: center;
    margin-right: 6px;
  }

  .results-content h4 .el-icon {
    margin-right: 6px;
  }

  .detailed-feedback {
    flex-grow: 1; /* Allow this section to grow and take available space */
    display: flex; /* Make it a flex container for its children (h4 and scrollbar) */
    flex-direction: column; /* Stack h4 and scrollbar vertically */
    min-height: 0; /* Crucial for allowing flex children to shrink and scroll */
    /* overflow: hidden; /* Let el-scrollbar handle its own overflow */
  }

  .detailed-feedback .el-scrollbar {
    padding-right: 10px; /* 避免内容紧贴滚动条 */
    flex-grow: 1; /* Allow scrollbar to take available space within detailed-feedback */
    height: 100%; /* Try to make scrollbar fill the .detailed-feedback container */
    /* When using el-scrollbar, its internal viewport needs to be what scrolls. */
    /* Ensure the content INSIDE el-scrollbar (i.e., .markdown-content) can naturally overflow. */
  }

  .feedback-scrollbar {
    width: 100%; /* Ensure scrollbar takes full width of its container */
  }

  .markdown-content {
    padding: 5px;
    /* Add styles for rendered markdown as needed, e.g., for code blocks */
    /* If content is still not showing fully, ensure this element doesn't have restrictive height/overflow */
    /* For example, removing a fixed height from here if it exists, or ensuring word-wrap.*/
    word-break: break-word; /* Help with very long unbreakable strings */
    text-align: left; /* Ensure markdown content itself is left-aligned */
  }

  .markdown-content :deep(pre) {
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;
    overflow-x: auto;
  }

  .markdown-content :deep(code) {
    font-family: 'Courier New', Courier, monospace;
  }

  .markdown-content :deep(h1),
  .markdown-content :deep(h2),
  .markdown-content :deep(h3),
  .markdown-content :deep(h4),
  .markdown-content :deep(h5),
  .markdown-content :deep(h6) {
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  .markdown-content :deep(p) {
    margin-bottom: 0.8em;
    line-height: 1.6;
  }

  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    padding-left: 20px;
  }

  .markdown-content :deep(li) {
    margin-bottom: 0.4em;
  }

  .result-actions .el-button {
    margin-right: 10px;
  }

  :deep(.el-descriptions__label) {
    width: 80px; /* 统一描述列表的标签宽度 */
  }
</style>
