import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import 'virtual:uno.css';
import App from './App.vue';
import './index.css';
import i18n from './i18n';

const app = createApp(App);
app.use(ElementPlus);
app.use(i18n);
app.mount('#app');
