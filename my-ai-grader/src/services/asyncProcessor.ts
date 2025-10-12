import { ElMessage, ElNotification } from 'element-plus';
import { cacheService } from './cacheService';

export interface ProcessingTask {
  id: string;
  type: 'analysis' | 'grading';
  data: any;
  apiConfig: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class AsyncProcessor {
  private static instance: AsyncProcessor;
  private tasks = new Map<string, ProcessingTask>();
  private maxConcurrentTasks = 3;
  private activeTasks = 0;
  private queue: string[] = [];

  static getInstance(): AsyncProcessor {
    if (!AsyncProcessor.instance) {
      AsyncProcessor.instance = new AsyncProcessor();
    }
    return AsyncProcessor.instance;
  }

  async processBatch(
    requestData: any,
    apiConfig: any,
    apiMethod: (data: any, config: any) => Promise<any>,
    onProgress?: (progress: number) => void,
  ): Promise<string> {
    const taskId = this.generateTaskId();

    const task: ProcessingTask = {
      id: taskId,
      type: 'grading',
      data: requestData,
      apiConfig,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);
    this.queue.push(taskId);
    this.processQueue();

    return taskId;
  }

  async processAnalysis(
    images: string[],
    apiConfig: any,
    apiMethod: (images: string[], config: any) => Promise<any>,
  ): Promise<string> {
    const taskId = this.generateTaskId();

    const task: ProcessingTask = {
      id: taskId,
      type: 'analysis',
      data: { images },
      apiConfig,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    this.tasks.set(taskId, task);
    this.queue.push(taskId);
    this.processQueue();

    return taskId;
  }

  private async processQueue(): Promise<void> {
    if (
      this.activeTasks >= this.maxConcurrentTasks ||
      this.queue.length === 0
    ) {
      return;
    }

    const taskId = this.queue.shift()!;
    const task = this.tasks.get(taskId);

    if (!task) return;

    this.activeTasks++;
    task.status = 'processing';
    task.startedAt = new Date();

    // Check cache first
    const cacheKey =
      task.type === 'analysis'
        ? cacheService.generateKey('analysis', task.data)
        : cacheService.generateKey('grading', task.data);

    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      task.status = 'completed';
      task.result = cachedResult;
      task.progress = 100;
      task.completedAt = new Date();

      ElNotification.success({
        title: 'Cache Hit',
        message: `Results loaded from cache`,
        duration: 3000,
      });

      this.activeTasks--;
      this.processQueue();
      return;
    }

    try {
      let result;

      if (task.type === 'analysis') {
        result = await this.processImages(task.data.images, task.apiConfig);
      } else {
        result = await this.processGradingBatch(task.data, task.apiConfig);
      }

      task.result = result;
      task.status = 'completed';
      task.progress = 100;
      task.completedAt = new Date();

      // Cache the result
      cacheService.set(
        cacheKey,
        result,
        task.type === 'analysis' ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000,
      );

      ElNotification.success({
        title: 'Processing Complete',
        message: `${task.type === 'analysis' ? 'Analysis' : 'Grading'} completed successfully`,
        duration: 5000,
      });
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Processing failed';
      task.completedAt = new Date();

      ElNotification.error({
        title: 'Processing Failed',
        message: task.error,
        duration: 5000,
      });
    } finally {
      this.activeTasks--;
      this.processQueue();
    }
  }

  private async processImages(images: string[], apiConfig: any): Promise<any> {
    const apiService = (await import('./apiService')).apiService;

    // Process images in batches
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const response = await apiService.analyzeMultiAnswer(batch, apiConfig);

      if (!response.success) {
        throw new Error(response.error);
      }

      results.push(response.data);
    }

    return results;
  }

  private async processGradingBatch(
    requestData: any,
    apiConfig: any,
  ): Promise<any> {
    const apiService = (await import('./apiService')).apiService;

    const response = await apiService.batchGrade(requestData, apiConfig);

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.data;
  }

  getTask(taskId: string): ProcessingTask | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): ProcessingTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveTasks(): ProcessingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === 'processing' || task.status === 'pending',
    );
  }

  getCompletedTasks(): ProcessingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === 'completed',
    );
  }

  getFailedTasks(): ProcessingTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === 'failed',
    );
  }

  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'pending') {
      task.status = 'failed';
      task.error = 'Cancelled by user';
      task.completedAt = new Date();

      // Remove from queue
      const queueIndex = this.queue.indexOf(taskId);
      if (queueIndex > -1) {
        this.queue.splice(queueIndex, 1);
      }

      return true;
    }
    return false;
  }

  clearCompletedTasks(): void {
    const completedTasks = this.getCompletedTasks();
    completedTasks.forEach((task) => this.tasks.delete(task.id));
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    queueSize: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      processing: tasks.filter((t) => t.status === 'processing').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      queueSize: this.queue.length,
    };
  }
}

export const asyncProcessor = AsyncProcessor.getInstance();
