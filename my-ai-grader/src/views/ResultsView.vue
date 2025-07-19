<template>
  <div class="results-view">
    <el-container>
      <el-main>
        <div class="page-header">
          <h1>Grading Results</h1>
          <p class="page-subtitle">
            View and analyze all grading results with detailed analytics
          </p>
        </div>

        <el-card>
          <!-- Filters and Controls -->
          <div class="results-controls">
            <div class="controls-row">
              <div class="filters-section">
                <el-form :model="filters" inline class="filters-form">
                  <el-form-item label="Date Range">
                    <el-date-picker
                      v-model="filters.dateRange"
                      type="daterange"
                      range-separator="To"
                      start-placeholder="Start date"
                      end-placeholder="End date"
                      @change="applyFilters"
                    />
                  </el-form-item>

                  <el-form-item label="Standard Answer">
                    <el-select
                      v-model="filters.standardAnswerId"
                      placeholder="All standard answers"
                      clearable
                      @change="applyFilters"
                    >
                      <el-option
                        v-for="answer in availableStandardAnswers"
                        :key="answer.id"
                        :label="answer.title"
                        :value="answer.id"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Status">
                    <el-select
                      v-model="filters.status"
                      placeholder="All statuses"
                      clearable
                      @change="applyFilters"
                    >
                      <el-option label="Completed" value="completed" />
                      <el-option label="Failed" value="failed" />
                      <el-option label="Processing" value="processing" />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="Score Range">
                    <el-slider
                      v-model="filters.scoreRange"
                      range
                      :min="0"
                      :max="100"
                      @change="applyFilters"
                    />
                  </el-form-item>
                </el-form>
              </div>

              <div class="actions-section">
                <el-button @click="refreshResults" :loading="isLoading">
                  <el-icon><Refresh /></el-icon>
                  Refresh
                </el-button>
                <el-button type="primary" @click="exportResults">
                  <el-icon><Download /></el-icon>
                  Export All
                </el-button>
              </div>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="summary-cards">
            <BaseCard class="summary-card" variant="elevated">
              <div class="summary-content">
                <div class="summary-icon total">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="summary-info">
                  <h3>{{ summaryStats.total }}</h3>
                  <p>Total Results</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="summary-card" variant="elevated">
              <div class="summary-content">
                <div class="summary-icon completed">
                  <el-icon><SuccessFilled /></el-icon>
                </div>
                <div class="summary-info">
                  <h3>{{ summaryStats.completed }}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="summary-card" variant="elevated">
              <div class="summary-content">
                <div class="summary-icon failed">
                  <el-icon><CircleCloseFilled /></el-icon>
                </div>
                <div class="summary-info">
                  <h3>{{ summaryStats.failed }}</h3>
                  <p>Failed</p>
                </div>
              </div>
            </BaseCard>

            <BaseCard class="summary-card" variant="elevated">
              <div class="summary-content">
                <div class="summary-icon average">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="summary-info">
                  <h3>{{ summaryStats.averageScore }}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
            </BaseCard>
          </div>

          <!-- Charts Section -->
          <div class="charts-section">
            <div class="charts-grid">
              <BaseCard title="Score Distribution" class="chart-card">
                <div class="chart-container">
                  <canvas ref="scoreChartRef"></canvas>
                </div>
              </BaseCard>

              <BaseCard title="Grading Trends" class="chart-card">
                <div class="chart-container">
                  <canvas ref="trendChartRef"></canvas>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Results Table -->
          <div class="results-table-section">
            <BaseCard title="Detailed Results">
              <template #header>
                <div class="table-header">
                  <h3>Detailed Results</h3>
                  <div class="table-actions">
                    <el-input
                      v-model="searchQuery"
                      placeholder="Search student ID..."
                      prefix-icon="Search"
                      clearable
                      @input="applyFilters"
                    />
                  </div>
                </div>
              </template>

              <el-table
                :data="paginatedResults"
                style="width: 100%"
                :default-sort="{ prop: 'timestamp', order: 'descending' }"
                v-loading="isLoading"
              >
                <el-table-column
                  prop="timestamp"
                  label="Date"
                  sortable
                  width="180"
                >
                  <template #default="{ row }">
                    {{ formatDate(row.timestamp) }}
                  </template>
                </el-table-column>

                <el-table-column
                  prop="studentId"
                  label="Student ID"
                  sortable
                  width="150"
                />

                <el-table-column
                  prop="standardAnswerTitle"
                  label="Standard Answer"
                  sortable
                  width="200"
                />

                <el-table-column
                  prop="score"
                  label="Score"
                  sortable
                  width="100"
                >
                  <template #default="{ row }">
                    <el-tag :type="getScoreType(row.score)">
                      {{ row.score }}%
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="status"
                  label="Status"
                  sortable
                  width="120"
                >
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column
                  prop="confidence"
                  label="Confidence"
                  sortable
                  width="120"
                >
                  <template #default="{ row }">
                    <el-progress
                      :percentage="Math.round(row.confidence * 100)"
                      :stroke-width="15"
                      :text-inside="true"
                    />
                  </template>
                </el-table-column>

                <el-table-column
                  prop="processingTime"
                  label="Processing Time"
                  sortable
                  width="150"
                >
                  <template #default="{ row }">
                    {{ row.processingTime }}ms
                  </template>
                </el-table-column>

                <el-table-column label="Actions" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      type="text"
                      size="small"
                      @click="viewDetailedResult(row)"
                    >
                      View
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      @click="regradeResult(row)"
                    >
                      Re-grade
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="filteredResults.length"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handlePageChange"
                  @current-change="handlePageChange"
                />
              </div>
            </BaseCard>
          </div>
        </el-card>
      </el-main>
    </el-container>

    <!-- Detailed Result Modal -->
    <BaseModal
      v-model:isOpen="showResultModal"
      title="Detailed Grading Result"
      size="large"
    >
      <div v-if="selectedResult" class="detailed-result">
        <div class="result-header">
          <h3>Student: {{ selectedResult.studentId }}</h3>
          <el-tag :type="getScoreType(selectedResult.score)" size="large">
            Score: {{ selectedResult.score }}%
          </el-tag>
        </div>

        <div class="result-content">
          <div class="result-section">
            <h4>Submission Details</h4>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Student ID">
                {{ selectedResult.studentId }}
              </el-descriptions-item>
              <el-descriptions-item label="Standard Answer">
                {{ selectedResult.standardAnswerTitle }}
              </el-descriptions-item>
              <el-descriptions-item label="Score">
                {{ selectedResult.score }}%
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(selectedResult.status)">
                  {{ selectedResult.status }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Confidence">
                {{ Math.round(selectedResult.confidence * 100) }}%
              </el-descriptions-item>
              <el-descriptions-item label="Processing Time">
                {{ selectedResult.processingTime }}ms
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="result-section">
            <h4>Submission Image</h4>
            <img
              :src="selectedResult.submissionImage"
              :alt="`Submission by ${selectedResult.studentId}`"
              class="submission-preview"
            />
          </div>

          <div class="result-section">
            <h4>AI Feedback</h4>
            <div
              class="feedback-content"
              v-html="selectedResult.feedback"
            ></div>
          </div>

          <div class="result-section">
            <h4>Grading Criteria Breakdown</h4>
            <div class="criteria-breakdown">
              <div
                v-for="(criterion, index) in selectedResult.criteria"
                :key="index"
                class="criterion-item"
              >
                <div class="criterion-header">
                  <span class="criterion-name">{{ criterion.name }}</span>
                  <span class="criterion-score"
                    >{{ criterion.score }}/{{ criterion.maxScore }}</span
                  >
                </div>
                <el-progress
                  :percentage="(criterion.score / criterion.maxScore) * 100"
                  :stroke-width="10"
                />
                <p class="criterion-feedback">{{ criterion.feedback }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue';
  import {
    Document,
    SuccessFilled,
    CircleCloseFilled,
    TrendCharts,
    Refresh,
    Download,
    Search,
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import BaseCard from '@/components/common/BaseCard.vue';
  import BaseModal from '@/components/common/BaseModal.vue';
  import { useEnhancedGradingStore } from '@/stores/enhancedGradingStore';
  import type { HistoricalResult } from '@/types/grading';

  const gradingStore = useEnhancedGradingStore();

  // State
  const results = ref<HistoricalResult[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  const currentPage = ref(1);
  const pageSize = ref(20);
  const showResultModal = ref(false);
  const selectedResult = ref<HistoricalResult | null>(null);

  // Chart refs
  const scoreChartRef = ref<HTMLCanvasElement | null>(null);
  const trendChartRef = ref<HTMLCanvasElement | null>(null);

  // Filters
  const filters = ref({
    dateRange: [],
    standardAnswerId: '',
    status: '',
    scoreRange: [0, 100],
  });

  // Computed
  const availableStandardAnswers = computed(() => gradingStore.standardAnswers);

  const filteredResults = computed(() => {
    let filtered = results.value;

    // Apply search query
    if (searchQuery.value) {
      filtered = filtered.filter((result) =>
        result.studentId
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()),
      );
    }

    // Apply standard answer filter
    if (filters.value.standardAnswerId) {
      filtered = filtered.filter(
        (result) => result.standardAnswerId === filters.value.standardAnswerId,
      );
    }

    // Apply status filter
    if (filters.value.status) {
      filtered = filtered.filter(
        (result) => result.status === filters.value.status,
      );
    }

    // Apply score range filter
    filtered = filtered.filter(
      (result) =>
        result.score >= filters.value.scoreRange[0] &&
        result.score <= filters.value.scoreRange[1],
    );

    // Apply date range filter
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const [start, end] = filters.value.dateRange;
      filtered = filtered.filter((result) => {
        const date = new Date(result.timestamp);
        return date >= start && date <= end;
      });
    }

    return filtered;
  });

  const paginatedResults = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredResults.value.slice(start, end);
  });

  const summaryStats = computed(() => {
    const total = filteredResults.value.length;
    const completed = filteredResults.value.filter(
      (r) => r.status === 'completed',
    ).length;
    const failed = filteredResults.value.filter(
      (r) => r.status === 'failed',
    ).length;
    const averageScore =
      total > 0
        ? Math.round(
            filteredResults.value
              .filter((r) => r.status === 'completed')
              .reduce((sum, r) => sum + r.score, 0) / completed,
          )
        : 0;

    return { total, completed, failed, averageScore };
  });

  // Methods
  const loadResults = async () => {
    isLoading.value = true;
    try {
      await gradingStore.loadHistoricalResults();
      results.value = gradingStore.historicalResults;
      await nextTick();
      renderCharts();
    } catch (error) {
      ElMessage.error('Failed to load results');
      console.error('Error loading results:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const applyFilters = () => {
    currentPage.value = 1;
    renderCharts();
  };

  const renderCharts = async () => {
    if (!scoreChartRef.value || !trendChartRef.value) return;

    // Import Chart.js dynamically
    const Chart = await import('chart.js/auto');

    // Score Distribution Chart
    const scoreCtx = scoreChartRef.value.getContext('2d');
    if (scoreCtx) {
      new Chart.default(scoreCtx, {
        type: 'bar',
        data: {
          labels: ['0-59', '60-69', '70-79', '80-89', '90-100'],
          datasets: [
            {
              label: 'Number of Results',
              data: calculateScoreDistribution(),
              backgroundColor: [
                '#ef4444',
                '#f97316',
                '#eab308',
                '#22c55e',
                '#10b981',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }

    // Grading Trends Chart
    const trendCtx = trendChartRef.value.getContext('2d');
    if (trendCtx) {
      const trendData = calculateTrendData();
      new Chart.default(trendCtx, {
        type: 'line',
        data: {
          labels: trendData.labels,
          datasets: [
            {
              label: 'Average Score',
              data: trendData.scores,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Number of Gradings',
              data: trendData.counts,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  };

  const calculateScoreDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    filteredResults.value
      .filter((r) => r.status === 'completed')
      .forEach((result) => {
        if (result.score < 60) distribution[0]++;
        else if (result.score < 70) distribution[1]++;
        else if (result.score < 80) distribution[2]++;
        else if (result.score < 90) distribution[3]++;
        else distribution[4]++;
      });
    return distribution;
  };

  const calculateTrendData = () => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const scores = last7Days.map((date) => {
      const dayResults = filteredResults.value.filter(
        (r) => r.timestamp.startsWith(date) && r.status === 'completed',
      );
      return dayResults.length > 0
        ? Math.round(
            dayResults.reduce((sum, r) => sum + r.score, 0) / dayResults.length,
          )
        : 0;
    });

    const counts = last7Days.map(
      (date) =>
        filteredResults.value.filter((r) => r.timestamp.startsWith(date))
          .length,
    );

    return {
      labels: last7Days.map((date) => new Date(date).toLocaleDateString()),
      scores,
      counts,
    };
  };

  const handlePageChange = () => {
    // Pagination handled automatically by computed properties
  };

  const viewDetailedResult = (result: HistoricalResult) => {
    selectedResult.value = result;
    showResultModal.value = true;
  };

  const regradeResult = async (result: HistoricalResult) => {
    try {
      isLoading.value = true;
      const response = await gradingStore.regradeResult(result.id);
      if (response.success) {
        ElMessage.success('Re-graded successfully');
        await loadResults();
      } else {
        ElMessage.error(response.error || 'Failed to re-grade');
      }
    } catch (error) {
      ElMessage.error('Error during re-grading');
    } finally {
      isLoading.value = false;
    }
  };

  const exportResults = () => {
    const data = {
      filters: filters.value,
      summary: summaryStats.value,
      results: filteredResults.value,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grading-results-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshResults = () => {
    loadResults();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getScoreType = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getStatusType = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'danger';
      case 'processing':
        return 'info';
      default:
        return 'info';
    }
  };

  onMounted(() => {
    loadResults();
  });
</script>

<style scoped>
  .results-view {
    @apply h-full;
  }

  .page-header {
    @apply mb-6 text-center;
  }

  .page-header h1 {
    @apply text-3xl font-bold text-gray-900 mb-2;
  }

  .page-subtitle {
    @apply text-lg text-gray-600;
  }

  .results-controls {
    @apply mb-6;
  }

  .controls-row {
    @apply flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between;
  }

  .filters-section {
    @apply flex-1;
  }

  .filters-form {
    @apply flex flex-wrap gap-4 items-center;
  }

  .actions-section {
    @apply flex gap-2;
  }

  .summary-cards {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
  }

  .summary-card {
    @apply p-4;
  }

  .summary-content {
    @apply flex items-center space-x-4;
  }

  .summary-icon {
    @apply w-12 h-12 rounded-full flex items-center justify-center;
  }

  .summary-icon.total {
    @apply bg-blue-100 text-blue-600;
  }

  .summary-icon.completed {
    @apply bg-green-100 text-green-600;
  }

  .summary-icon.failed {
    @apply bg-red-100 text-red-600;
  }

  .summary-icon.average {
    @apply bg-purple-100 text-purple-600;
  }

  .summary-info h3 {
    @apply text-2xl font-bold text-gray-900;
  }

  .summary-info p {
    @apply text-sm text-gray-600;
  }

  .charts-section {
    @apply mb-6;
  }

  .charts-grid {
    @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
  }

  .chart-card {
    @apply h-96;
  }

  .chart-container {
    @apply h-full;
  }

  .results-table-section {
    @apply mb-6;
  }

  .table-header {
    @apply flex items-center justify-between;
  }

  .table-actions {
    @apply flex items-center gap-4;
  }

  .pagination-container {
    @apply mt-4 flex justify-end;
  }

  .detailed-result {
    @apply space-y-6;
  }

  .result-header {
    @apply flex items-center justify-between mb-4;
  }

  .result-section {
    @apply mb-6;
  }

  .result-section h4 {
    @apply font-semibold mb-3;
  }

  .submission-preview {
    @apply max-w-full max-h-96 rounded-lg border;
  }

  .feedback-content {
    @apply bg-gray-50 p-4 rounded-lg;
  }

  .criteria-breakdown {
    @apply space-y-4;
  }

  .criterion-item {
    @apply p-4 border rounded-lg;
  }

  .criterion-header {
    @apply flex justify-between items-center mb-2;
  }

  .criterion-name {
    @apply font-medium;
  }

  .criterion-score {
    @apply text-gray-600;
  }

  .criterion-feedback {
    @apply text-sm text-gray-600 mt-2;
  }
</style>
