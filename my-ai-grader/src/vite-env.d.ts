/// <reference types="vite/client" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    any
  >;
  export default component;
}

declare module 'vite-plugin-eslint' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eslintPlugin: (options?: any) => any;
  export default eslintPlugin;
}

// Add declaration for Element Plus locale mjs file
declare module 'element-plus/dist/locale/zh-cn.mjs';

// Generic module declarations to attempt to satisfy linter for common JS modules
declare module 'pinia' {
  export * from 'pinia/dist/pinia'; // Try to point to actual types if possible, or use 'any'
}

declare module 'axios' {
  import { AxiosStatic } from 'axios/index';
  const axios: AxiosStatic;
  export default axios;
}
