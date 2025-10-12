// Multi-image standard answer interfaces
export interface StandardAnswerImage {
  id: string;
  file: File;
  dataUrl: string;
  order: number;
  name: string;
  size: number;
  uploadedAt?: string;
}

export interface MultiAnalyzeRequest {
  images: {
    data: string; // base64 data URL
    order: number;
    name: string;
  }[];
}

export interface MultiAnalyzeResponse {
  analyzedText: string;
  suggestedRubricJson: string;
  imageAnalyses: {
    order: number;
    analysis: string;
    keyPoints: string[];
  }[];
}

// Batch student processing interfaces
export interface StudentSubmission {
  id: string;
  name: string;
  file: File;
  dataUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: GradingResult;
  error?: string;
}

export interface GradingResult {
  feedbackMarkdown: string;
  score?: number;
  maxScore?: number;
  individualScores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

export interface BatchGradeRequest {
  standardAnswerImages: {
    data: string;
    order: number;
  }[];
  standardAnalysis: string;
  rubric: string;
  studentSubmissions: {
    id: string;
    name: string;
    imageData: string;
  }[];
}

export interface BatchGradeResponse {
  batchId: string;
  results: {
    studentId: string;
    status: 'completed' | 'error';
    feedbackMarkdown?: string;
    error?: string;
  }[];
  summary: {
    total: number;
    completed: number;
    errors: number;
    averageScore?: number;
  };
}

// Batch processing state
export interface BatchProgress {
  total: number;
  completed: number;
  errors: number;
}

// Store interfaces
export interface MultiImageGradingState {
  // Standard Answer Management
  standardAnswerImages: StandardAnswerImage[];
  multiImageAnalysis: string | null;
  suggestedRubric: string;
  isAnalyzingMultiImage: boolean;

  // Batch Processing
  studentSubmissions: StudentSubmission[];
  batchProcessingStatus: 'idle' | 'processing' | 'completed' | 'error';
  currentBatchId: string | null;
  batchProgress: BatchProgress;

  // Results Management
  selectedSubmissionId: string | null;
  resultsFilter: 'all' | 'completed' | 'errors';
}

// Enhanced grading store including legacy support
export interface EnhancedGradingStore extends MultiImageGradingState {
  // Legacy single-image support (backward compatibility)
  standardAnswerImageUrl: string | null;
  analyzedStandardAnswerText: string | null;
  studentAnswerImageUrl: string | null;
  gradingRubric: string | null;
  gradingResult: string | null;
  gradingError: string | null;
  isLoadingGrading: boolean;
}

// Component props interfaces
export interface MultiImageUploaderProps {
  maxImages?: number;
  allowReorder?: boolean;
  onImagesChange: (images: StandardAnswerImage[]) => void;
}

export interface ImageGalleryProps {
  images: StandardAnswerImage[];
  allowReorder: boolean;
  allowDelete: boolean;
  onReorder: (newOrder: StandardAnswerImage[]) => void;
  onDelete: (imageId: string) => void;
}

export interface BatchUploaderProps {
  onBatchUpload: (students: StudentSubmission[]) => void;
  maxBatchSize?: number;
}

export interface BatchProgressProps {
  submissions: StudentSubmission[];
  onCancel: () => void;
  onRetry: (submissionId: string) => void;
}

export interface BatchResultsProps {
  submissions: StudentSubmission[];
  onViewDetail: (submissionId: string) => void;
  onExport: () => void;
  onEditResult: (submissionId: string, result: GradingResult) => void;
}

export interface StudentResultProps {
  submission: StudentSubmission;
  standardAnswerImages: StandardAnswerImage[];
  onNavigate: (direction: 'prev' | 'next') => void;
  onEdit: (result: GradingResult) => void;
}

// Historical results for analytics
export interface HistoricalResult {
  id: string;
  studentId: string;
  standardAnswerId: string;
  standardAnswerTitle: string;
  score: number;
  maxScore: number;
  feedback: string;
  submissionImage: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'processing';
  confidence: number;
  processingTime: number;
  criteria: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
}

export interface BatchGradingResult {
  studentId: string;
  score: number;
  feedback: string;
  confidence: number;
  status: string;
  submissionImage: string;
  processingTime: number;
  error?: string;
}

export interface StandardAnswer {
  id: string;
  title: string;
  description: string;
  images: StandardAnswerImage[];
  rubric: {
    criteria: {
      name: string;
      maxScore: number;
      description: string;
    }[];
    totalScore: number;
  };
  analysis: string;
  createdAt: string;
  updatedAt: string;
}
