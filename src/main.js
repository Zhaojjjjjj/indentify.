import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import 'virtual:uno.css';
import App from './App.vue';
import './index.css';

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');
