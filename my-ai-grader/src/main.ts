import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import createPinia
import './style.css';
import App from './App.vue';
import router from './router'; // Import the router

// Import Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'; // Import Element Plus styles
import * as ElementPlusIconsVue from '@element-plus/icons-vue'; // Import icons

const app = createApp(App);

app.use(createPinia()); // Create and use Pinia instance
app.use(router); // Tell Vue to use the router
app.use(ElementPlus); // Use Element Plus plugin

// Register all Element Plus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
