<template>
  <el-container class="grading-layout">
    <el-main class="image-display-area">
      <!-- New Card for Standard Answer Context -->
      <el-card
        v-if="standardAnswerAnalysis || currentRubric"
        shadow="never"
        style="
          margin-bottom: 20px;
          border: 1px solid var(--el-color-primary-light-3);
        "
      >
        <template #header>
          <div class="card-header">
            <span
              ><el-icon style="margin-right: 4px"><InfoFilled /></el-icon
              >评分参考信息</span
            >
          </div>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item
            v-if="standardAnswerAnalysis"
            label-style="width: 120px"
            label="标准答案分析"
          >
            <div
              style="white-space: pre-wrap; max-height: 150px; overflow-y: auto"
            >
              {{ standardAnswerAnalysis }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item
            v-if="currentRubric"
            label-style="width: 120px"
            label="评分细则 (Rubric)"
          >
            <div
              style="white-space: pre-wrap; max-height: 150px; overflow-y: auto"
            >
              {{ currentRubric }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <!-- End of New Card -->

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
          v-if="studentImageUrl"
          :src="studentImageUrl"
          fit="contain"
          class="uploaded-image-preview"
        />
        <el-empty v-else description="请上传图片进行批改" />
        <!-- 图片上传和展示逻辑将在此处实现 (模块 11.3) -->
      </el-card>
    </el-main>
    <el-aside width="70%" class="results-sidebar">
      <el-card shadow="never" style="height: 100%">
        <template #header>
          <div class="card-header">
            <span
              ><el-icon style="margin-right: 4px"><List /></el-icon
              >批改结果侧边栏</span
            >
          </div>
        </template>
        <div v-loading="gradingStore.isLoadingGrading" class="results-content">
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
                  gradingStore.isLoadingGrading
                    ? '正在努力分析中，请稍候...'
                    : '暂无详细反馈'
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
              :disabled="!studentImageUrl || gradingStore.isLoadingGrading"
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
  import { computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ElMessage,
    ElMessageBox,
    type UploadRawFile,
    type UploadRequestOptions,
  } from 'element-plus';
  import {
    UploadFilled,
    List,
    PictureFilled,
    InfoFilled,
    ChatDotSquare,
    Tools,
    EditPen,
    Download,
  } from '@element-plus/icons-vue';
  import { useGradingStore } from '@/stores/gradingStore';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  const gradingStore = useGradingStore();
  const router = useRouter();

  const standardAnswerAnalysis = computed(
    () => gradingStore.analyzedStandardAnswerText,
  );
  const currentRubric = computed(() => gradingStore.gradingRubric);

  const studentImageUrl = computed(() => gradingStore.studentAnswerImageUrl);

  const renderedMarkdown = computed(() => {
    const markdownText = gradingStore.gradingResult as string | null;

    if (
      typeof markdownText === 'string' &&
      markdownText &&
      !markdownText.startsWith('Error during grading:')
    ) {
      const cleanedMarkdown = markdownText.replace(/\\n/g, '\n');
      const rawHtml = marked(cleanedMarkdown);
      return DOMPurify.sanitize(rawHtml as string);
    }

    if (
      typeof markdownText === 'string' &&
      markdownText.startsWith('Error during grading:')
    ) {
      const errorHtml = marked(`\`\`\`text\n${markdownText}\n\`\`\``);
      return DOMPurify.sanitize(errorHtml as string);
    }

    if (gradingStore.gradingError) {
      const errorHtml = marked(`批改时发生错误: ${gradingStore.gradingError}`);
      return DOMPurify.sanitize(errorHtml as string);
    }

    return '';
  });

  const detailedFeedbackAvailable = computed(() => !!renderedMarkdown.value);

  onMounted(() => {
    if (
      !gradingStore.analyzedStandardAnswerText ||
      !gradingStore.gradingRubric
    ) {
      ElMessageBox.alert(
        '请先完成标准答案的上传和分析，并定义评分细则。',
        '缺少必要信息',
        {
          confirmButtonText: '前往设置',
          type: 'warning',
          callback: () => {
            router.push('/standard-answer');
          },
        },
      );
    }
  });

  const handleGradeImage = async () => {
    if (!gradingStore.studentAnswerImageUrl) {
      ElMessage.error('请先上传学生答题图片。');
      return;
    }
    if (
      !gradingStore.analyzedStandardAnswerText ||
      !gradingStore.gradingRubric
    ) {
      ElMessage.error('标准答案分析或评分细则缺失，请返回上一步完成设置。');
      return;
    }

    console.log(
      '[GradingView.vue] handleGradeImage: Calling store.gradeStudentAnswer',
    );
    await gradingStore.gradeStudentAnswer(
      gradingStore.studentAnswerImageUrl,
      gradingStore.gradingRubric,
      gradingStore.analyzedStandardAnswerText,
    );
  };

  const customImageUpload = async (options: UploadRequestOptions) => {
    const file = options.file as UploadRawFile;
    console.log(
      '[GradingView.vue] customImageUpload called for student file:',
      file.name,
    );

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;
        gradingStore.setStudentAnswerImageUrl(imageDataUrl);
        console.log(
          '[GradingView.vue] Image uploaded, now calling handleGradeImage to start grading.',
        );
        await handleGradeImage();
      } else {
        ElMessage.error('读取学生答题图片失败');
      }
    };
    reader.onerror = () => {
      ElMessage.error('读取学生答题图片时发生错误');
    };
    reader.readAsDataURL(file);
  };

  const beforeImageUpload = (rawFile: UploadRawFile): boolean => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(
      rawFile.type,
    );
    const isLt2M = rawFile.size / 1024 / 1024 < 2;
    if (!isImage) {
      ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!');
      return false;
    }
    if (!isLt2M) {
      ElMessage.error('上传图片大小不能超过 2MB!');
      return false;
    }
    gradingStore.setStudentAnswerImageUrl(null);
    return true;
  };
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
