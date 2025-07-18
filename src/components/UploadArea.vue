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
			拖拽图片到此或点击上传
		</div>
		<div class="text-xs text-gray-400 mt-2">
			支持 JPG、PNG 格式，文件大小不超过 {{ MAX_FILE_SIZE_MB }}MB
		</div>
	</el-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import { detect, modelReady } from '../composables/useImageDetection'
import type { UploadedData, DetectionResult } from '../types'

interface UploadFile {
	raw: File
	size: number
}

// 事件定义
const emit = defineEmits<{
	uploaded: [data: UploadedData]
}>()

// 响应式数据
const loading = ref(false)
const ready = modelReady
const MAX_FILE_SIZE_MB = 5

// 文件验证
const validateFile = (file: File): boolean => {
	const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB
	if (!isValidSize) {
		ElMessage.error(`上传图片大小不能超过 ${MAX_FILE_SIZE_MB}MB!`)
	}
	return isValidSize
}

// 处理文件变化
const handleFileChange = async (file: UploadFile) => {
	if (!ready.value || loading.value) return

	try {
		loading.value = true
		const loadingInstance = ElLoading.service({ 
			text: '分析中...', 
			background: 'rgba(0,0,0,0.4)', 
			customClass: 'text-[#9887EC]' 
		})

		const result = await detect(file.raw)
		if (result) {
			// 设置图片的实际尺寸
			const img = new Image()
			img.onload = () => {
				result.image.width = img.naturalWidth
				result.image.height = img.naturalHeight
				emit('uploaded', result)
			}
			img.src = result.image.src
		}

		loadingInstance.close()
	} catch (error) {
		console.error('图片分析失败:', error)
		ElMessage.error('图片分析失败，请重试')
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
