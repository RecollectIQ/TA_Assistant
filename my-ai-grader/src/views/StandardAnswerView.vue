<template>
  <el-container direction="vertical" style="height: 100%">
    <el-header style="text-align: center; font-size: 20px; padding: 20px">
      Step 1: Upload Standard Answer and Define Rubric
    </el-header>
    <el-main
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
      "
    >
      <el-card style="width: 80%; max-width: 700px; margin-bottom: 20px">
        <template #header>
          <div>Upload Standard Answer Image</div>
        </template>
        <el-upload
          drag
          action="#"
          :show-file-list="false"
          :before-upload="beforeStandardAnswerUpload"
          :http-request="handleStandardAnswerUpload"
          accept="image/png, image/jpeg, image/gif"
          style="width: 100%"
          :disabled="gradingStore.isLoadingAnalysis"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">
            Drop file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">Only jpg/png/gif files, max 2MB</div>
          </template>
        </el-upload>
        <div
          v-if="gradingStore.isLoadingAnalysis"
          style="margin-top: 10px; text-align: center"
        >
          <el-progress :percentage="100" :indeterminate="true" :duration="1" />
          <p>Analyzing standard answer, please wait...</p>
        </div>
        <div
          v-if="
            gradingStore.standardAnswerImageUrl &&
            !gradingStore.isLoadingAnalysis
          "
          style="margin-top: 20px; text-align: center"
        >
          <p>Standard Answer Preview:</p>
          <el-image
            :src="gradingStore.standardAnswerImageUrl"
            style="max-width: 100%; max-height: 300px"
            fit="contain"
          />
        </div>
      </el-card>

      <el-card
        v-if="
          (gradingStore.analyzedStandardAnswerText ||
            gradingStore.analysisError) &&
          !gradingStore.isLoadingAnalysis
        "
        style="width: 80%; max-width: 700px; margin-bottom: 20px"
      >
        <template #header>
          <div>Standard Answer Analysis</div>
        </template>
        <div
          v-if="gradingStore.analysisError"
          class="error-message"
          style="color: red; margin-bottom: 10px"
        >
          <p>Analysis Failed:</p>
          <pre>{{ gradingStore.analysisError }}</pre>
        </div>
        <el-input
          type="textarea"
          :rows="8"
          placeholder="AI-analyzed standard answer structure will appear here..."
          :model-value="gradingStore.analyzedStandardAnswerText"
          readonly
        />
      </el-card>

      <el-card
        v-if="
          !gradingStore.isLoadingAnalysis &&
          gradingStore.analyzedStandardAnswerText &&
          !gradingStore.analysisError
        "
        style="width: 80%; max-width: 700px; margin-bottom: 20px"
      >
        <template #header>
          <div>Define Grading Rubric</div>
        </template>
        <el-input
          v-model="gradingStore.gradingRubric"
          type="textarea"
          :rows="10"
          placeholder="Based on the analysis above, enter detailed grading criteria here... (AI-suggested rubric has been auto-filled)"
        />
        <div
          v-if="
            gradingStore.suggestedRubricJson &&
            gradingStore.gradingRubric !== gradingStore.suggestedRubricJson
          "
          style="margin-top: 10px; font-size: 0.9em; color: #909399"
        >
          <p>
            Tip: AI-suggested rubric has been filled in. You can edit directly,
            or
            <el-button type="text" @click="restoreSuggestedRubric"
              >Restore AI Suggestion</el-button
            >
          </p>
        </div>
      </el-card>

      <el-button
        type="primary"
        size="large"
        :disabled="
          !gradingStore.analyzedStandardAnswerText ||
          !gradingStore.gradingRubric ||
          gradingStore.isLoadingAnalysis ||
          !!gradingStore.analysisError
        "
        @click="goToStudentUpload"
      >
        Next: Upload Student Answer
      </el-button>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
  // import { computed } from 'vue'; // computed is not used, remove or comment out
  import { useRouter } from 'vue-router';
  import {
    ElMessage,
    type UploadRawFile,
    type UploadRequestOptions,
  } from 'element-plus';
  import { UploadFilled } from '@element-plus/icons-vue';
  import { useGradingStore } from '@/stores/gradingStore';

  const gradingStore = useGradingStore();
  const router = useRouter();

  const beforeStandardAnswerUpload = (rawFile: UploadRawFile): boolean => {
    const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(
      rawFile.type,
    );
    const isLt2M = rawFile.size / 1024 / 1024 < 2;

    if (!isImage) {
      ElMessage.error('Only JPG/PNG/GIF format is allowed!');
      return false;
    }
    if (!isLt2M) {
      ElMessage.error('Image size must not exceed 2MB!');
      return false;
    }

    // Clear previous standard answer images
    gradingStore.clearStandardAnswerImages();
    return true;
  };

  const handleStandardAnswerUpload = async (
    options: UploadRequestOptions,
  ): Promise<void> => {
    const file = options.file as UploadRawFile;

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;

        // 创建标准答案图片对象
        const standardAnswerImage = {
          id: Date.now().toString(),
          dataUrl: imageDataUrl,
          name: file.name,
          order: 0,
          uploadedAt: new Date().toISOString(),
        };

        // Use new store method
        gradingStore.addStandardAnswerImage(standardAnswerImage);
        await gradingStore.analyzeStandardAnswer(imageDataUrl);
      } else {
        ElMessage.error('Failed to read file');
      }
    };
    reader.onerror = () => {
      ElMessage.error('Error occurred while reading file');
    };
    reader.readAsDataURL(file);
  };

  const goToStudentUpload = () => {
    if (!gradingStore.suggestedRubric.trim()) {
      ElMessage.warning('Please fill in the grading rubric before continuing.');
      return;
    }
    router.push('/grading');
  };

  const restoreSuggestedRubric = () => {
    gradingStore.gradingRubric = gradingStore.suggestedRubric;
  };
</script>

<style scoped>
  .el-main {
    background-color: #f4f4f5;
  }
  .el-card {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
  .el-upload__text em {
    color: #409eff;
  }
  .error-message {
    background-color: #fef0f0;
    color: #f56c6c;
    padding: 8px 15px;
    border-radius: 4px;
    border: 1px solid #fbc4c4;
    white-space: pre-wrap;
  }
</style>
