<script setup lang="ts">
  import { ElConfigProvider } from 'element-plus';
  import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
  import { School } from '@element-plus/icons-vue';
  import { onMounted } from 'vue';
  import axios from 'axios';

  const locale = zhCn;

  onMounted(async () => {
    try {
      const response = await axios.get('/api/greet');
      console.log('Response from backend:', response.data);
    } catch (error: any) {
      console.error('Error calling backend API:', error);
      if (error.response) {
        console.error('Backend Error Response Data:', error.response.data);
        console.error('Backend Error Response Status:', error.response.status);
        console.error(
          'Backend Error Response Headers:',
          error.response.headers,
        );
      } else if (error.request) {
        console.error(
          'Backend No Response Request (Network Error):',
          error.request,
        );
      } else {
        console.error('Axios Setup Error Message:', error.message);
      }
      console.error('Axios Error Config:', error.config);
    }
  });
</script>

<template>
  <ElConfigProvider :locale="locale">
    <el-container class="app-layout">
      <el-header class="app-header">
        <div class="logo-title">
          <el-icon :size="28" style="margin-right: 8px"><School /></el-icon>
          <h1>AI Grader</h1>
        </div>
        <el-menu
          mode="horizontal"
          :router="true"
          :default-active="$route.path"
          class="app-nav-menu"
        >
          <el-menu-item index="/">Home</el-menu-item>
          <el-menu-item index="/configuration">Configuration</el-menu-item>
          <el-menu-item index="/standard-answer">Standard Answer</el-menu-item>
          <el-menu-item index="/batch-grading">Batch Grading</el-menu-item>
          <el-menu-item index="/results">Results</el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="app-main-content">
        <router-view />
      </el-main>
    </el-container>
  </ElConfigProvider>
</template>

<style>
  /* Global styles - consider moving to a separate CSS file if it grows */
  body {
    margin: 0;
    font-family:
      'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', '\5FAE\8F6F\96C5\9ED1', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f4f5f7; /* Light gray background for the whole page */
  }

  #app {
    min-height: 100vh;
  }

  .app-layout {
    min-height: 100vh;
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid var(--el-border-color-light);
    background-color: #ffffff; /* White header background */
  }

  .logo-title {
    display: flex;
    align-items: center;
    font-size: 1.2em; /* Slightly larger title */
    color: var(
      --el-color-primary
    ); /* Use Element Plus primary color for title */
  }

  .logo-title h1 {
    margin: 0;
    font-weight: 600; /* Bolder title */
  }

  .app-nav-menu {
    border-bottom: none; /* Remove default border from horizontal menu */
  }

  .app-main-content {
    padding: 20px;
  }
</style>
