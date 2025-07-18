<template>
	<el-dropdown trigger="click" class="language-switcher">
		<el-button type="text" class="language-btn">
			<Globe class="w-4 h-4 mr-1" />
			{{ $t('language.switch') }}
			<ChevronDown class="w-4 h-4 ml-1" />
		</el-button>
		<template #dropdown>
			<el-dropdown-menu>
				<el-dropdown-item 
					@click="changeLanguage('en')"
					:class="{ 'is-active': currentLocale === 'en' }"
				>
					{{ $t('language.english') }}
				</el-dropdown-item>
				<el-dropdown-item 
					@click="changeLanguage('zh')"
					:class="{ 'is-active': currentLocale === 'zh' }"
				>
					{{ $t('language.chinese') }}
				</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe, ChevronDown } from 'lucide-vue-next'

const { locale, t } = useI18n()

const currentLocale = computed(() => locale.value)

const changeLanguage = (lang: string) => {
	locale.value = lang
	// Save to local storage
  localStorage.setItem('language', lang)
}

// Restore language setting from local storage
const savedLanguage = localStorage.getItem('language')
if (savedLanguage && ['en', 'zh'].includes(savedLanguage)) {
	locale.value = savedLanguage
}
</script>

<script lang="ts">
export default {
	name: 'LanguageSwitcher'
}
</script>

<style scoped>
.language-switcher {
	color: #9887EC;
}

.language-btn {
	color: #9887EC !important;
	font-size: 14px;
	display: flex;
	align-items: center;
	transition: all 0.3s ease;
}

.language-btn:hover {
	color: #7c6fd9 !important;
}

:deep(.el-dropdown-menu__item.is-active) {
	color: #9887EC;
	background-color: rgba(152, 135, 236, 0.1);
}

:deep(.el-dropdown-menu__item:hover) {
	color: #9887EC;
	background-color: rgba(152, 135, 236, 0.1);
}
</style>