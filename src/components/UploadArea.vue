<template>
	<el-upload 
		:disabled="loading || !ready" 
		:show-file-list="false" 
		drag 
		:auto-upload="false" 
		:on-change="handleFileChange" 
		:before-upload="validateFile" 
		accept="image/*" 
		class="upload-area animate__animated animate__zoomIn"
	>
		<i class="el-icon--upload"></i>
		<div class="text-[#9887EC] font-medium">
			{{ $t('upload.dragText') }}
		</div>
		<div class="text-xs text-gray-400 mt-2">
			{{ $t('upload.supportText', { size: MAX_FILE_SIZE_MB }) }}
		</div>
	</el-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { detect, modelReady } from '../composables/useImageDetection'
import type { UploadedData, DetectionResult } from '../types'

const { t } = useI18n()

interface UploadFile {
	raw: File
	size: number
}

// Event definitions
const emit = defineEmits<{
	uploaded: [data: UploadedData]
}>()

// Reactive data
const loading = ref(false)
const ready = modelReady
const MAX_FILE_SIZE_MB = 5

/**
 * Validates the uploaded file
 * @param file - File to validate
 * @returns True if file is valid
 */
const validateFile = (file: File): boolean => {
	const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB
	if (!isValidSize) {
		ElMessage.error(t('upload.fileSizeError', { size: MAX_FILE_SIZE_MB }))
	}
	return isValidSize
}

/**
 * Handles file change event
 * @param file - Selected file
 */
const handleFileChange = async (file: UploadFile) => {
	if (!ready.value || loading.value) return

	try {
			loading.value = true
			const loadingInstance = ElLoading.service({ 
				text: t('upload.analyzing'), 
				background: 'rgba(0,0,0,0.4)', 
				customClass: 'text-[#9887EC]' 
			})

		const result = await detect(file.raw)
		if (result) {
			// Set actual image dimensions
			const img = new Image()
			img.onload = () => {
				// Create new image object to avoid modifying readonly properties
				const updatedResult = {
					...result,
					image: {
						...result.image,
						width: img.naturalWidth,
						height: img.naturalHeight
					}
				}
				emit('uploaded', updatedResult)
			}
			img.src = result.image.src
		}

		loadingInstance.close()
	} catch (error) {
			console.error('图片分析失败:', error)
			ElMessage.error(t('upload.analysisFailed'))
		} finally {
		loading.value = false
	}
}
</script>

<style scoped>
.upload-area {
	width: 30%;
	opacity: 0.8;
	transition: all 0.3s ease;
}

.upload-area:hover {
	opacity: 1;
	transform: translateY(-2px);
}

@media screen and (max-width: 768px) {
	.upload-area {
		width: 70%;
	}
}

.upload-area :deep(.el-upload-dragger) {
	border: 2px dashed #9887ec !important;
	border-radius: 12px;
	background: rgba(152, 135, 236, 0.05);
	transition: all 0.3s ease;
}

.upload-area :deep(.el-upload-dragger:hover) {
	border-color: #9887ec !important;
	background: rgba(152, 135, 236, 0.1);
}

.upload-area :deep(.el-upload__text) {
	color: #9887ec !important;
}
</style>
