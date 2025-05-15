<template>
  <el-container direction="vertical" style="height: 100%">
    <el-header style="text-align: center; font-size: 20px; padding: 20px">
      步骤 1: 上传标准答案并定义评分细则
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
          <div>上传标准答案图片</div>
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
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 jpg/png/gif 文件，且不超过 2MB
            </div>
          </template>
        </el-upload>
        <div
          v-if="gradingStore.isLoadingAnalysis"
          style="margin-top: 10px; text-align: center"
        >
          <el-progress :percentage="100" :indeterminate="true" :duration="1" />
          <p>正在分析标准答案，请稍候...</p>
        </div>
        <div
          v-if="
            gradingStore.standardAnswerImageUrl &&
            !gradingStore.isLoadingAnalysis
          "
          style="margin-top: 20px; text-align: center"
        >
          <p>标准答案图片预览:</p>
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
          <div>标准答案分析结果</div>
        </template>
        <div
          v-if="gradingStore.analysisError"
          class="error-message"
          style="color: red; margin-bottom: 10px"
        >
          <p>分析失败:</p>
          <pre>{{ gradingStore.analysisError }}</pre>
        </div>
        <el-input
          type="textarea"
          :rows="8"
          placeholder="AI分析的标准答案结构将显示在这里..."
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
          <div>定义评分细则 (Rubric)</div>
        </template>
        <el-input
          v-model="gradingStore.gradingRubric"
          type="textarea"
          :rows="10"
          placeholder="请根据上方标准答案的分析结果，在此处填写详细的评分细则... (AI建议的Rubric已自动填充)"
        />
        <div
          v-if="
            gradingStore.suggestedRubricJson &&
            gradingStore.gradingRubric !== gradingStore.suggestedRubricJson
          "
          style="margin-top: 10px; font-size: 0.9em; color: #909399"
        >
          <p>
            提示: AI建议的Rubric已填充。您可以直接修改，或
            <el-button type="text" @click="restoreSuggestedRubric"
              >恢复AI建议的Rubric</el-button
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
        下一步：上传学生答案
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
      ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!');
      return false;
    }
    if (!isLt2M) {
      ElMessage.error('上传图片大小不能超过 2MB!');
      return false;
    }
    gradingStore.setStandardAnswerImageUrl(null);
    return true;
  };

  const handleStandardAnswerUpload = async (
    options: UploadRequestOptions,
  ): Promise<void> => {
    const file = options.file as UploadRawFile;
    // gradingStore.standardAnswerImageUrl = null; // Direct assignment removed, setStandardAnswerImageUrl(null) is in beforeStandardAnswerUpload

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;
        // Use the action to set the URL and reset other relevant states
        gradingStore.setStandardAnswerImageUrl(imageDataUrl);

        console.log(
          '[StandardAnswerView.vue] Attempting to call gradingStore.analyzeStandardAnswer',
        );
        console.log(
          '[StandardAnswerView.vue] typeof gradingStore.analyzeStandardAnswer is:',
          typeof gradingStore.analyzeStandardAnswer,
        );
        console.log(
          '[StandardAnswerView.vue] gradingStore instance:',
          gradingStore,
        );

        if (typeof gradingStore.analyzeStandardAnswer === 'function') {
          await gradingStore.analyzeStandardAnswer(imageDataUrl);
        } else {
          console.error(
            '[StandardAnswerView.vue] gradingStore.analyzeStandardAnswer is NOT a function! Store might be malformed or HMR issue.',
          );
          ElMessage.error(
            '发生内部错误: 分析函数不可用。请尝试刷新页面或重启服务。',
          );
          if (gradingStore.isLoadingAnalysis) {
            gradingStore.isLoadingAnalysis = false;
          }
        }
      } else {
        ElMessage.error('读取文件失败');
        if (gradingStore.isLoadingAnalysis) {
          gradingStore.isLoadingAnalysis = false;
        }
      }
    };
    reader.onerror = () => {
      ElMessage.error('读取文件发生错误');
      if (gradingStore.isLoadingAnalysis) {
        gradingStore.isLoadingAnalysis = false;
      }
    };
    reader.readAsDataURL(file);
  };

  const goToStudentUpload = () => {
    if (gradingStore.gradingRubric.trim() === '') {
      ElMessage.warning('请填写评分细则 (Rubric) 后再继续。');
      return;
    }
    router.push('/grading');
  };

  const restoreSuggestedRubric = () => {
    gradingStore.gradingRubric = gradingStore.suggestedRubricJson;
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
