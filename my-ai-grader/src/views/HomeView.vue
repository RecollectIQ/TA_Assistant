<template>
  <el-card class="home-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span
          ><el-icon style="margin-right: 4px"><House /></el-icon>Welcome to AI
          Grader</span
        >
      </div>
    </template>
    <el-empty description="No content yet, please select an action">
      <el-button type="primary" @click="goToStandardAnswer">Start Grading</el-button>
      <el-button @click="goToProfiles">Manage Configuration</el-button>
    </el-empty>

    <div class="features-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-primary)"
                ><EditPen
              /></el-icon>
              <h3>Smart Grading</h3>
              <p>Automated grading using AI for images.</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-success)"
                ><Files
              /></el-icon>
              <h3>Configuration Management</h3>
              <p>Flexibly define questions and grading criteria.</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="never">
            <div class="feature-item">
              <el-icon :size="40" color="var(--el-color-warning)"
                ><Picture
              /></el-icon>
              <h3>Image Processing</h3>
              <p>Easily upload and manage images for grading.</p>
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

  const goToStandardAnswer = () => {
    router.push('/standard-answer');
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
