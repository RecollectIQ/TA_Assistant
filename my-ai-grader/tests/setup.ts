import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Element Plus components
config.global.stubs = {
  'el-button': true,
  'el-input': true,
  'el-select': true,
  'el-option': true,
  'el-upload': true,
  'el-alert': true,
  'el-message': true,
  'el-notification': true,
  'el-tag': true,
  'el-icon': true,
  'el-table': true,
  'el-table-column': true,
  'el-progress': true,
  'el-dialog': true,
  'el-card': true,
  'el-row': true,
  'el-col': true,
  'el-divider': true,
  'el-switch': true,
  'el-slider': true,
  'el-checkbox': true,
  'el-checkbox-group': true,
  'el-radio': true,
  'el-radio-group': true,
  'el-form': true,
  'el-form-item': true,
  'el-tabs': true,
  'el-tab-pane': true,
  'el-dropdown': true,
  'el-dropdown-menu': true,
  'el-dropdown-item': true,
  'el-popover': true,
  'el-tooltip': true,
  'el-loading': true,
  'el-image': true,
  'el-empty': true,
};

// Mock Element Plus icons
config.global.mocks = {
  ...config.global.mocks,
  ElMessage: vi.fn(),
  ElNotification: vi.fn(),
  ElMessageBox: vi.fn(),
  ElLoading: vi.fn(),
};

// Mock file operations
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    readAsArrayBuffer: vi.fn(),
    onload: null,
    onerror: null,
    result: null,
  })),
});

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Mock canvas operations
Object.defineProperty(window, 'HTMLCanvasElement', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getContext: vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    }),
    toBlob: vi.fn((callback) => callback(new Blob())),
    toDataURL: vi.fn(),
    width: 0,
    height: 0,
  })),
});

// Mock Image
Object.defineProperty(window, 'Image', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    src: '',
    onload: null,
    onerror: null,
    width: 100,
    height: 100,
  })),
});
