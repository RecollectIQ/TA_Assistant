<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span
          ><el-icon style="margin-right: 4px"><Setting /></el-icon
          >题目配置管理</span
        >
      </div>
    </template>
    <el-empty description="题目配置功能正在建设中...">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </el-empty>
  </el-card>
</template>

<script setup lang="ts">
  // Placeholder for future script logic
</script>

<style scoped>
  .card-header {
    display: flex;
    align-items: center;
    font-size: 1.2em;
    font-weight: bold;
  }
</style>
