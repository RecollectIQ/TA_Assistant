import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint'; // Import the plugin
import { fileURLToPath, URL } from 'node:url'; // Import for path resolution

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({
      // Add the plugin
      cache: false, // Disable cache to ensure checks on every change
      include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.ts'],
      exclude: ['node_modules', 'dist'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
