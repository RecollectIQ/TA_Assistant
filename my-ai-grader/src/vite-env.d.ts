/// <reference types="vite/client" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'vite-plugin-eslint' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eslintPlugin: (options?: any) => any;
  export default eslintPlugin;
}

// Add declaration for Element Plus locale mjs file
declare module 'element-plus/dist/locale/zh-cn.mjs';
