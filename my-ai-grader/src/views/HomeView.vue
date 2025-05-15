<template>
  <el-card class="home-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span
          ><el-icon style="margin-right: 4px"><House /></el-icon>欢迎使用 AI
          Grader</span
        >
      </div>
    </template>
    <el-empty description="暂无更多内容，请选择操作">
      <el-button type="primary" @click="goToGrading">开始批改</el-button>
      <el-button @click="goToProfiles">管理题目配置</el-button>
    </el-empty>

    <div class="features-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-primary)"
                ><EditPen
              /></el-icon>
              <h3>智能评分</h3>
              <p>利用AI对图像进行自动化评分。</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-success)"
                ><Files
              /></el-icon>
              <h3>配置管理</h3>
              <p>灵活定义题目和评分标准。</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-warning)"
                ><Picture
              /></el-icon>
              <h3>图片处理</h3>
              <p>轻松上传和管理待批改图片。</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const goToGrading = () => {
    router.push('/grading');
  };

  const goToProfiles = () => {
    router.push('/profile-management');
  };
</script>

<style scoped>
  .home-card {
    max-width: 900px;
    margin: 20px auto;
  }

  .card-header {
    display: flex;
    align-items: center;
    font-size: 1.2em;
    font-weight: bold;
  }

  .features-section {
    margin-top: 40px;
  }

  .feature-item {
    text-align: center;
  }

  .feature-item h3 {
    margin-top: 10px;
    margin-bottom: 5px;
  }

  .feature-item p {
    font-size: 0.9em;
    color: #606266;
  }
</style>
