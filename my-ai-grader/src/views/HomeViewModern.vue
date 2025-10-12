<template>
  <div class="modern-home">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content">
        <div class="hero-icon">
          <el-icon :size="80"><School /></el-icon>
        </div>
        <h1 class="hero-title">AI Grader</h1>
        <p class="hero-subtitle">智能批改，让教学更高效</p>

        <div class="hero-actions">
          <el-button
            type="primary"
            size="large"
            class="hero-btn primary-btn"
            @click="goToStandardAnswer"
          >
            <el-icon><Magic /></el-icon>
            开始智能批改
          </el-button>
          <el-button
            size="large"
            class="hero-btn secondary-btn"
            @click="goToProfiles"
          >
            <el-icon><Setting /></el-icon>
            配置管理
          </el-button>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="features-section">
      <div class="section-header">
        <h2>核心功能</h2>
        <p>AI驱动的智能批改系统</p>
      </div>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
        >
          <div
            class="feature-icon"
            :style="{ '--accent-color': feature.color }"
          >
            <el-icon :size="32"><component :is="feature.icon" /></el-icon>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
          <div class="feature-stats">
            <span class="stat">{{ feature.stat }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stats-grid">
        <div v-for="(stat, index) in stats" :key="index" class="stat-item">
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card" @click="goToStandardAnswer">
        <div class="action-icon">
          <el-icon><Upload /></el-icon>
        </div>
        <div class="action-content">
          <h4>上传标准答案</h4>
          <p>设置评分标准</p>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="action-card" @click="goToBatchGrading">
        <div class="action-icon">
          <el-icon><Files /></el-icon>
        </div>
        <div class="action-content">
          <h4>批量批改</h4>
          <p>一键处理多份作业</p>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="action-card" @click="goToResults">
        <div class="action-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="action-content">
          <h4>查看结果</h4>
          <p>分析批改报告</p>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import {
    School,
    Magic,
    Setting,
    Upload,
    Files,
    TrendCharts,
    ArrowRight,
    EditPen,
    Picture,
    DataAnalysis,
  } from '@element-plus/icons-vue';

  const router = useRouter();

  const features = [
    {
      icon: 'EditPen',
      title: '智能评分',
      description: '基于AI的自动化评分系统，准确识别答案要点',
      color: '#667eea',
      stat: '95% 准确率',
    },
    {
      icon: 'Files',
      title: '批量处理',
      description: '一次性处理多达50份作业，大幅提升效率',
      color: '#f093fb',
      stat: '50x 效率提升',
    },
    {
      icon: 'Picture',
      title: '图像识别',
      description: '支持多种图片格式，智能识别手写内容',
      color: '#4facfe',
      stat: '10+ 格式支持',
    },
    {
      icon: 'DataAnalysis',
      title: '数据分析',
      description: '详细的成绩分析和可视化报告',
      color: '#43e97b',
      stat: '实时统计',
    },
  ];

  const stats = [
    { number: '10,000+', label: '已批改作业' },
    { number: '500+', label: '活跃教师' },
    { number: '95%', label: '准确率' },
    { number: '24/7', label: '在线服务' },
  ];

  const goToStandardAnswer = () => router.push('/standard-answer');
  const goToProfiles = () => router.push('/profile-management');
  const goToBatchGrading = () => router.push('/batch-grading');
  const goToResults = () => router.push('/results');
</script>

<style scoped>
  .modern-home {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow-x: hidden;
  }

  /* Hero Section */
  .hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
  }

  .hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.7;
    animation: float 6s ease-in-out infinite;
  }

  .orb-1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .orb-2 {
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, #48cae4, #023e8a);
    top: 60%;
    right: 10%;
    animation-delay: 2s;
  }

  .orb-3 {
    width: 250px;
    height: 250px;
    background: linear-gradient(45deg, #06ffa5, #0077b6);
    bottom: 20%;
    left: 60%;
    animation-delay: 4s;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 600px;
    padding: 0 20px;
  }

  .hero-icon {
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeInUp 1s ease-out 0.5s forwards;
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 800;
    margin-bottom: 20px;
    background: linear-gradient(45deg, #fff, #f0f0f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    opacity: 0;
    animation: fadeInUp 1s ease-out 0.7s forwards;
  }

  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 40px;
    opacity: 0.9;
    opacity: 0;
    animation: fadeInUp 1s ease-out 0.9s forwards;
  }

  .hero-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
    opacity: 0;
    animation: fadeInUp 1s ease-out 1.1s forwards;
  }

  .hero-btn {
    padding: 15px 30px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    position: relative;
    overflow: hidden;
  }

  .primary-btn {
    background: linear-gradient(45deg, #ff6b6b, #feca57);
    color: white;
  }

  .primary-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
  }

  .secondary-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .secondary-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Features Section */
  .features-section {
    padding: 100px 20px;
    background: white;
    position: relative;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;
  }

  .section-header h2 {
    font-size: 3rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 10px;
  }

  .section-header p {
    font-size: 1.2rem;
    color: #718096;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background: white;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--accent-color);
  }

  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(
      45deg,
      var(--accent-color),
      var(--accent-color)
    );
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0.9;
  }

  .feature-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 15px;
  }

  .feature-card p {
    color: #718096;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .feature-stats {
    padding-top: 15px;
    border-top: 1px solid #e2e8f0;
  }

  .stat {
    font-weight: 600;
    color: var(--accent-color);
    font-size: 1.1rem;
  }

  /* Stats Section */
  .stats-section {
    padding: 80px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .stat-item {
    opacity: 0;
    animation: fadeInUp 1s ease-out forwards;
  }

  .stat-item:nth-child(1) {
    animation-delay: 0.1s;
  }
  .stat-item:nth-child(2) {
    animation-delay: 0.2s;
  }
  .stat-item:nth-child(3) {
    animation-delay: 0.3s;
  }
  .stat-item:nth-child(4) {
    animation-delay: 0.4s;
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 10px;
  }

  .stat-label {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  /* Quick Actions */
  .quick-actions {
    padding: 80px 20px;
    background: #f7fafc;
    max-width: 800px;
    margin: 0 auto;
  }

  .action-card {
    display: flex;
    align-items: center;
    padding: 25px;
    background: white;
    border-radius: 15px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  }

  .action-card:hover {
    transform: translateX(10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .action-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-right: 20px;
  }

  .action-content {
    flex: 1;
  }

  .action-content h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 5px;
  }

  .action-content p {
    color: #718096;
    margin: 0;
  }

  .action-arrow {
    color: #cbd5e0;
    transition: all 0.3s ease;
  }

  .action-card:hover .action-arrow {
    color: #667eea;
    transform: translateX(5px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .hero-subtitle {
      font-size: 1.2rem;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }

    .section-header h2 {
      font-size: 2rem;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
