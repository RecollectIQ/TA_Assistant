<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <h2>AI Grader</h2>
      </div>

      <div class="nav-menu">
        <router-link to="/" class="nav-link" active-class="active">
          <el-icon><HomeFilled /></el-icon>
          <span>Home</span>
        </router-link>

        <router-link to="/configuration" class="nav-link" active-class="active">
          <el-icon><Setting /></el-icon>
          <span>Configuration</span>
        </router-link>

        <router-link
          to="/standard-answer"
          class="nav-link"
          active-class="active"
        >
          <el-icon><Document /></el-icon>
          <span>Standard Answer</span>
        </router-link>

        <router-link to="/batch-grading" class="nav-link" active-class="active">
          <el-icon><UploadFilled /></el-icon>
          <span>Batch Grading</span>
        </router-link>

        <router-link to="/results" class="nav-link" active-class="active">
          <el-icon><TrendCharts /></el-icon>
          <span>Results</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import {
    HomeFilled,
    Setting,
    Document,
    UploadFilled,
    TrendCharts,
  } from '@element-plus/icons-vue';
</script>

<style scoped>
  .app-navigation {
    @apply bg-white shadow-sm border-b;
  }

  .nav-container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  .nav-brand {
    @apply flex items-center justify-between h-16;
  }

  .nav-brand h2 {
    @apply text-xl font-bold text-gray-900;
  }

  .nav-menu {
    @apply flex space-x-4;
  }

  .nav-link {
    @apply flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors;
  }

  .nav-link.active {
    @apply text-blue-600 bg-blue-50;
  }

  .nav-link:hover {
    @apply text-gray-900 bg-gray-100;
  }
</style>
