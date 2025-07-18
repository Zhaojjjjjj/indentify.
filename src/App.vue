<template>
	<div
		class="w-full h-100vh"
		data-slot="black-hole-background"
		:class="[
			'relative size-full overflow-hidden',
			`before:absolute before:left-1/2 before:top-1/2 before:block before:size-[140%] before:content-[''] before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,white_50%)] before:[transform:translate3d(-50%,-50%,0)] dark:before:[background:radial-gradient(ellipse_at_50%_55%,transparent_10%,black_50%)]`,
			`after:absolute after:left-1/2 after:top-1/2 after:z-[5] after:block after:size-full after:mix-blend-overlay after:content-[''] after:[background:radial-gradient(ellipse_at_50%_75%,#a900ff_20%,transparent_75%)] after:[transform:translate3d(-50%,-50%,0)]`,
		]"
	>
		<canvas ref="canvasRef" class="absolute inset-0 block size-full opacity-10 dark:opacity-20" />
		<motion.div
			:class="[
				'absolute left-1/2 top-[-71.5%] z-[3] h-[140%] w-[30%] rounded-b-full opacity-75 mix-blend-plus-darker blur-3xl [background-position:0%_100%] [background-size:100%_200%] [transform:translate3d(-50%,0,0)] dark:mix-blend-plus-lighter',
				'[background:linear-gradient(20deg,#00f8f1,#ffbd1e40_16.5%,#fe848f_33%,#fe848f40_49.5%,#00f8f1_66%,#00f8f180_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%] dark:[background:linear-gradient(20deg,#00f8f1,#ffbd1e20_16.5%,#fe848f_33%,#fe848f20_49.5%,#00f8f1_66%,#00f8f160_85.5%,#ffbd1e_100%)_0_100%_/_100%_200%]',
			]"
			:animate="{ backgroundPosition: '0% 300%' }"
			:transition="{ duration: 5, ease: 'linear', repeat: Infinity }" 
		/>
		<div class="absolute left-0 top-0 z-[7] size-full opacity-50 mix-blend-overlay dark:[background:repeating-linear-gradient(transparent,transparent_1px,white_1px,white_2px)]" />
		<div class="absolute left-0 top-0 z-[100] w-full h-full">
			<el-container class="h-full flex flex-col animate__animated animate__fadeIn">
				<HeaderBar />
				<p class="status mt-10px text-[#9887EC] font-medium text-center">{{ status }}</p>
				<el-main class="content-wrapper flex flex-col items-center justify-start gap-20px w-full pt-0 h-full overflow-auto">
					<el-scrollbar class="h-full w-full">
						<div class="flex flex-col items-center gap-20px rounded-8px py-20px w-full">
							<UploadArea @uploaded="handleImageUploaded" />
						</div>
						<div class="flex justify-center pb-10">
							<ImagePreview v-if="imageData.src" :data="{
								image: { src: imageData.src, width: 0, height: 0 },
								results: imageData.results
							}" />
						</div>
					</el-scrollbar>
				</el-main>
			</el-container>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { motion } from 'motion-v'
import HeaderBar from './components/HeaderBar.vue'
import UploadArea from './components/UploadArea.vue'
import ImagePreview from './components/ImagePreview.vue'
import { useBlackHoleAnimation } from './composables/useBlackHoleAnimation'
import { modelStatus } from './composables/useImageDetection'
import type { UploadedData, BlackHoleProps, ProcessedDetectionResult } from './types'

// 黑洞动画配置
const blackHoleProps: BlackHoleProps = {
	strokeColor: '#737373',
	numberOfLines: 50,
	numberOfDiscs: 50,
	particleRGBColor: [255, 255, 255],
}

// 使用黑洞动画
const { canvasRef } = useBlackHoleAnimation(blackHoleProps)

// 模型状态
const status = modelStatus

// 图片数据
const imageData = reactive<{
	src: string
	results: ProcessedDetectionResult[]
}>({
	src: '',
	results: [],
})

// 处理图片上传
const handleImageUploaded = (data: UploadedData) => {
	imageData.src = data.image.src
	imageData.results = data.results
}

</script>
