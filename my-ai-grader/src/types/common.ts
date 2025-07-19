// Common utility types and interfaces
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  type: 'size' | 'type' | 'dimensions' | 'count';
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxCount?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  total?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeHeaders: boolean;
  fields?: string[];
}

// Notification and error handling types
export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  context?: string;
}

export interface NotificationOptions {
  duration?: number;
  type?: 'success' | 'warning' | 'error' | 'info';
  action?: {
    text: string;
    onClick: () => void;
  };
}

// Utility types for component props and events
export interface BaseComponentProps {
  class?: string;
  style?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface BaseUploadProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

export interface DragDropEvent {
  isOver: boolean;
  files: File[];
}

// Image processing types
export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressedImage {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

// API request/response helpers
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Keyboard and accessibility types
export interface KeyboardEvent {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault: () => void;
}

// Debounce and throttle types
export type DebounceOptions = {
  delay: number;
  immediate?: boolean;
};

export type ThrottleOptions = {
  delay: number;
  leading?: boolean;
  trailing?: boolean;
};

// Theme and styling types
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontSize: string;
}

// Icon types
export type IconName =
  | 'upload'
  | 'download'
  | 'image'
  | 'document'
  | 'check'
  | 'close'
  | 'warning'
  | 'error'
  | 'loading'
  | 'edit'
  | 'delete'
  | 'search';

// Modal and dialog types
export interface ModalOptions {
  title?: string;
  width?: string | number;
  height?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
}

// Responsive design types
export interface ResponsiveConfig {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}
