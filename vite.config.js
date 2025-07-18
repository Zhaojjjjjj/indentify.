import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import tailwindcss from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			// 自动导入 Vue 相关函数，如：ref, reactive ...
			imports: ['vue', 'vue-router'],
		}),
		UnoCSS(),
		tailwindcss(),
	],
	base: './',
});
