# Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the AI Grader system to support multi-image standard answers and batch grading capabilities. The enhancement builds upon the existing Vue.js frontend and Flask backend architecture while introducing new data structures, UI components, and API endpoints to handle multiple images and batch processing workflows.

The design maintains backward compatibility with the current single-image workflow while providing a seamless upgrade path for users who need more advanced capabilities.

## Architecture

### High-Level Architecture Changes

The system will maintain its current two-tier architecture (Vue.js frontend + Flask backend) but will introduce new components and modify existing ones:

1. **Frontend Enhancements**:
   - Complete frontend architecture restructure with modern patterns
   - API configuration management (URL, API Key, Model selection)
   - New multi-image upload and management components
   - Enhanced state management for handling image collections
   - Batch processing UI with progress tracking
   - Results management interface for multiple student submissions
   - Improved responsive design and user experience

2. **Backend Enhancements**:
   - New API endpoints for batch processing
   - Enhanced LLM service to handle multi-image contexts
   - Optimized prompt construction for multiple images
   - Batch processing queue management

3. **Data Flow Changes**:
   - Standard answers become collections of ordered images
   - Student submissions can be processed in batches
   - Results are stored and managed as collections with individual access

## Components and Interfaces

### Frontend Components

#### 0. API Configuration Management

**ApiConfigDialog.vue**
```typescript
interface ApiConfig {
  apiUrl: string;
  apiKey: string;
  modelName: string;
  maxTokens?: number;
  timeout?: number;
}

interface ApiConfigProps {
  visible: boolean;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
  onCancel: () => void;
  onTest: (config: ApiConfig) => Promise<boolean>;
}
```

**ConfigurationView.vue**
```typescript
interface ConfigurationState {
  apiConfig: ApiConfig;
  isTestingConnection: boolean;
  connectionStatus: 'untested' | 'success' | 'failed';
  lastTestError?: string;
}
```

#### 1. Multi-Image Standard Answer Management

**MultiImageUploader.vue**
```typescript
interface MultiImageUploaderProps {
  maxImages?: number;
  allowReorder?: boolean;
  onImagesChange: (images: StandardAnswerImage[]) => void;
}

interface StandardAnswerImage {
  id: string;
  file: File;
  dataUrl: string;
  order: number;
  name: string;
  size: number;
}
```

**ImageGalleryPreview.vue**
```typescript
interface ImageGalleryProps {
  images: StandardAnswerImage[];
  allowReorder: boolean;
  allowDelete: boolean;
  onReorder: (newOrder: StandardAnswerImage[]) => void;
  onDelete: (imageId: string) => void;
}
```

#### 2. Batch Student Upload and Processing

**BatchStudentUploader.vue**
```typescript
interface BatchUploaderProps {
  onBatchUpload: (students: StudentSubmission[]) => void;
  maxBatchSize?: number;
}

interface StudentSubmission {
  id: string;
  name: string;
  file: File;
  dataUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: GradingResult;
  error?: string;
}
```

**BatchProcessingProgress.vue**
```typescript
interface BatchProgressProps {
  submissions: StudentSubmission[];
  onCancel: () => void;
  onRetry: (submissionId: string) => void;
}
```

#### 3. Results Management

**BatchResultsOverview.vue**
```typescript
interface BatchResultsProps {
  submissions: StudentSubmission[];
  onViewDetail: (submissionId: string) => void;
  onExport: () => void;
  onEditResult: (submissionId: string, result: GradingResult) => void;
}
```

**StudentResultViewer.vue**
```typescript
interface StudentResultProps {
  submission: StudentSubmission;
  standardAnswerImages: StandardAnswerImage[];
  onNavigate: (direction: 'prev' | 'next') => void;
  onEdit: (result: GradingResult) => void;
}
```

### Backend API Interfaces

#### 1. Multi-Image Standard Answer Analysis

**POST /api/analyze_multi_answer**
```typescript
interface MultiAnalyzeRequest {
  images: Array<{
    data: string; // base64 data URL
    order: number;
    name: string;
  }>;
}

interface MultiAnalyzeResponse {
  analyzedText: string;
  suggestedRubricJson: string;
  imageAnalyses: Array<{
    order: number;
    analysis: string;
    keyPoints: string[];
  }>;
}
```

#### 2. Batch Grading

**POST /api/batch_grade**
```typescript
interface BatchGradeRequest {
  standardAnswerImages: Array<{
    data: string;
    order: number;
  }>;
  standardAnalysis: string;
  rubric: string;
  studentSubmissions: Array<{
    id: string;
    name: string;
    imageData: string;
  }>;
}

interface BatchGradeResponse {
  batchId: string;
  results: Array<{
    studentId: string;
    status: 'completed' | 'error';
    feedbackMarkdown?: string;
    error?: string;
  }>;
  summary: {
    total: number;
    completed: number;
    errors: number;
    averageScore?: number;
  };
}
```

### Enhanced Data Models

#### 1. Frontend State Management (Pinia Store)

```typescript
interface MultiImageGradingState {
  // Standard Answer Management
  standardAnswerImages: StandardAnswerImage[];
  multiImageAnalysis: string | null;
  suggestedRubric: string;
  isAnalyzingMultiImage: boolean;
  
  // Batch Processing
  studentSubmissions: StudentSubmission[];
  batchProcessingStatus: 'idle' | 'processing' | 'completed' | 'error';
  currentBatchId: string | null;
  batchProgress: {
    total: number;
    completed: number;
    errors: number;
  };
  
  // Results Management
  selectedSubmissionId: string | null;
  resultsFilter: 'all' | 'completed' | 'errors';
}
```

#### 2. Backend Data Structures

```python
class MultiImageStandardAnswer:
    def __init__(self):
        self.images: List[Dict] = []  # {order, data_url, analysis}
        self.combined_analysis: str = ""
        self.rubric: str = ""
        
class BatchGradingSession:
    def __init__(self):
        self.batch_id: str = ""
        self.standard_answer: MultiImageStandardAnswer = None
        self.submissions: List[Dict] = []  # {id, name, image_data, status, result}
        self.created_at: datetime = None
        self.status: str = "pending"
```

## Data Models

### API Configuration Store

A new store for managing API configuration:

```typescript
interface ApiConfigStore {
  // State
  apiConfig: ApiConfig;
  isConfigured: boolean;
  connectionStatus: 'untested' | 'testing' | 'success' | 'failed';
  lastTestError: string | null;
  
  // Actions
  saveApiConfig: (config: ApiConfig) => void;
  loadApiConfig: () => ApiConfig | null;
  testConnection: (config?: ApiConfig) => Promise<boolean>;
  clearConfig: () => void;
  
  // Getters
  isValidConfig: boolean;
  shouldShowConfigPrompt: boolean;
}
```

### Enhanced Grading Store

The existing `gradingStore.ts` will be completely restructured:

```typescript
interface EnhancedGradingStore {
  // Legacy single-image support (for backward compatibility)
  standardAnswerImageUrl: string | null;
  analyzedStandardAnswerText: string | null;
  studentAnswerImageUrl: string | null;
  
  // New multi-image standard answer support
  standardAnswerImages: StandardAnswerImage[];
  multiImageAnalysis: string | null;
  suggestedRubric: string;
  isAnalyzingMultiImage: boolean;
  
  // Batch processing
  studentSubmissions: StudentSubmission[];
  batchProcessingStatus: 'idle' | 'processing' | 'completed' | 'error';
  currentBatchId: string | null;
  batchProgress: BatchProgress;
  
  // Results management
  selectedSubmissionId: string | null;
  resultsFilter: 'all' | 'completed' | 'errors';
  
  // Actions
  analyzeMultiImageStandardAnswer: (images: StandardAnswerImage[]) => Promise<void>;
  processBatchGrading: (submissions: StudentSubmission[]) => Promise<void>;
  addStandardAnswerImage: (image: StandardAnswerImage) => void;
  removeStandardAnswerImage: (imageId: string) => void;
  reorderStandardAnswerImages: (newOrder: StandardAnswerImage[]) => void;
  selectSubmission: (submissionId: string) => void;
  updateSubmissionResult: (submissionId: string, result: GradingResult) => void;
  exportBatchResults: () => void;
  retryFailedSubmission: (submissionId: string) => Promise<void>;
}
```

### Backend Service Enhancements

The `llm_service.py` will be enhanced to handle multiple images:

```python
def call_multi_image_llm_api(
    api_url: str,
    api_key: str,
    model: str,
    prompt_text: str,
    image_data_urls: List[str],
    max_tokens: int = 8192
) -> dict:
    """Enhanced LLM API call supporting multiple images"""
    
def construct_multi_image_prompt(
    images_analysis: List[str],
    rubric: str,
    student_image_url: str
) -> str:
    """Construct optimized prompt for multi-image context"""
```

## Error Handling

### Frontend Error Handling

1. **Image Upload Errors**:
   - File size validation (per image and total batch)
   - File type validation
   - Network upload failures
   - Graceful degradation for partial uploads

2. **Batch Processing Errors**:
   - Individual submission failures don't stop batch
   - Retry mechanisms for failed submissions
   - Clear error reporting and recovery options

3. **State Management Errors**:
   - Robust error boundaries for component failures
   - State persistence during errors
   - User-friendly error messages

### Backend Error Handling

1. **API Rate Limiting**:
   - Implement queuing for batch requests
   - Respect LLM API rate limits
   - Graceful backoff strategies

2. **Memory Management**:
   - Efficient handling of multiple large images
   - Cleanup of temporary data
   - Memory usage monitoring

3. **LLM API Errors**:
   - Individual submission error isolation
   - Fallback strategies for API failures
   - Detailed error logging and reporting

## Testing Strategy

### Unit Testing

1. **Frontend Components**:
   - Multi-image upload component testing
   - Batch processing state management
   - Results navigation and editing
   - Error handling scenarios

2. **Backend Services**:
   - Multi-image LLM API integration
   - Batch processing logic
   - Error handling and recovery
   - Data validation and sanitization

### Integration Testing

1. **End-to-End Workflows**:
   - Complete multi-image standard answer setup
   - Full batch grading process
   - Results management and export
   - Error recovery scenarios

2. **API Testing**:
   - Multi-image analysis endpoint
   - Batch grading endpoint
   - Error response handling
   - Performance under load

### Performance Testing

1. **Load Testing**:
   - Large batch processing (50+ submissions)
   - Multiple concurrent users
   - Memory usage with large images
   - API response times

2. **Optimization Testing**:
   - Image compression effectiveness
   - Prompt optimization for token limits
   - Database query performance
   - Frontend rendering performance

## Frontend Architecture Restructure

### New Application Structure

The frontend will be completely restructured with a modern, scalable architecture:

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, modals, etc.)
│   ├── upload/          # Upload-related components
│   ├── grading/         # Grading-specific components
│   └── results/         # Results display components
├── views/               # Page-level components
│   ├── ConfigurationView.vue
│   ├── StandardAnswerView.vue
│   ├── BatchGradingView.vue
│   └── ResultsView.vue
├── stores/              # Pinia stores
│   ├── apiConfigStore.ts
│   ├── gradingStore.ts
│   └── uiStore.ts
├── services/            # API and utility services
│   ├── apiService.ts
│   ├── imageService.ts
│   └── exportService.ts
├── composables/         # Vue composition functions
│   ├── useImageUpload.ts
│   ├── useBatchProcessing.ts
│   └── useApiConfig.ts
├── types/               # TypeScript type definitions
│   ├── api.ts
│   ├── grading.ts
│   └── common.ts
└── utils/               # Utility functions
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

### Enhanced Navigation and Routing

```typescript
// New routing structure
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresConfig: false }
  },
  {
    path: '/configuration',
    name: 'Configuration',
    component: ConfigurationView,
    meta: { requiresConfig: false }
  },
  {
    path: '/standard-answer',
    name: 'StandardAnswer',
    component: StandardAnswerView,
    meta: { requiresConfig: true }
  },
  {
    path: '/batch-grading',
    name: 'BatchGrading',
    component: BatchGradingView,
    meta: { requiresConfig: true }
  },
  {
    path: '/results',
    name: 'Results',
    component: ResultsView,
    meta: { requiresConfig: true }
  }
];
```

### Backend API Configuration Integration

The backend will be enhanced to accept API configuration from frontend:

```python
# New API endpoint for dynamic configuration
@app.route('/api/configure', methods=['POST'])
def configure_api():
    """Configure API settings dynamically"""
    data = request.json
    api_url = data.get('apiUrl')
    api_key = data.get('apiKey')
    model_name = data.get('modelName')
    
    # Validate and store configuration
    # Return success/failure status

@app.route('/api/test_connection', methods=['POST'])
def test_api_connection():
    """Test API connection with provided configuration"""
    # Test connection and return status
```

## Implementation Phases

### Phase 0: Frontend Architecture Restructure
- Complete frontend codebase restructure
- Implement new component architecture
- Create API configuration management system
- Set up new routing and navigation
- Migrate existing functionality to new structure

### Phase 1: API Configuration Management
- Implement API configuration UI components
- Create configuration persistence (localStorage)
- Add connection testing functionality
- Integrate configuration with backend services
- Add configuration validation and error handling

### Phase 2: Multi-Image Standard Answers
- Implement multi-image upload components
- Enhance backend analysis for multiple images
- Update state management for image collections
- Basic multi-image preview and management
- Integration with API configuration system

### Phase 3: Batch Student Processing
- Implement batch upload functionality
- Create batch processing backend logic
- Add progress tracking and error handling
- Basic results overview
- Queue management for large batches

### Phase 4: Results Management
- Implement detailed results viewer
- Add navigation between student results
- Create export functionality
- Enhanced error recovery options
- Results filtering and search

### Phase 5: Optimization and Polish
- Performance optimizations
- Enhanced error handling
- UI/UX improvements
- Comprehensive testing
- Documentation and user guides

This design provides a solid foundation for implementing the multi-image and batch grading capabilities while completely modernizing the frontend architecture and adding flexible API configuration management.