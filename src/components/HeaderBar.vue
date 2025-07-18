<template>
	<el-header
		height="60px"
		class="header-bar animate__animated animate__slideInDown"
	>
		<h1 class="text-[#9887EC] uppercase font-semibold text-2xl tracking-wide">
			{{ $t('app.title') }}
		</h1>
		<div class="header-actions">
			<LanguageSwitcher />
		</div>
	</el-header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<style scoped>
.header-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: transparent;
	padding: 0 20px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16px;
}

@media screen and (max-width: 768px) {
	.header-bar {
		padding: 0 10px;
	}
	
	.header-bar h1 {
		font-size: 1.5rem;
	}
}
</style>
