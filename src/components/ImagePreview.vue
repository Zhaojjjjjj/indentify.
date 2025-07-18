<template>
	<div class="image-container relative inline-block mt-5 animate__animated animate__fadeIn">
		<img 
			:src="data.image.src" 
			alt="Uploaded Image" 
			class="max-w-80vw max-h-70vh rounded-lg shadow-2xl transition-all duration-300 hover:shadow-3xl" 
		/>
		<div
			v-for="item in processedResults"
			:key="item.id"
			class="bounding-box absolute border-2 border-solid box-border pointer-events-none transition-all duration-200"
			:style="getBoxStyle(item)"
		>
			<span
				class="label absolute px-2 py-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis pointer-events-none rounded font-bold shadow-lg backdrop-blur-sm"
				:style="getLabelStyle(item)"
			>
				{{ item.label }} ({{ (item.score * 100).toFixed(1) }}%)
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import labelMap from '../utils/labelMap'
import type { ProcessedDetectionResult, UploadedData } from '../types'

interface Props {
	data: UploadedData
}

const props = defineProps<Props>()

const processedResults = computed((): ProcessedDetectionResult[] => {
	if (!Array.isArray(props.data.results)) {
		return []
	}

	// Sort detection results by position
	const sortedResults = [...props.data.results].sort((a, b) => {
		if (a.box.ymin !== b.box.ymin) {
			return a.box.ymin - b.box.ymin
		}
		return a.box.xmin - b.box.xmin
	})

	const LABEL_HEIGHT = 26 // Label height
	const PADDING = 2 // Label spacing
	const MAX_VERTICAL_OFFSET = 50 // Maximum vertical offset

	const placedLabels: Array<{
		xmin: number
		xmax: number
		verticalOffset: number
	}> = []

	/**
	 * Generates a random color
	 * @returns Random HSL color string
	 */
	const generateRandomColor = (): string => {
		return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')
	}

	/**
	 * Generates a unique ID
	 * @returns Unique identifier string
	 */
	const generateId = (): string => {
		return `detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
	}

	return sortedResults.map((item) => {
			const { box } = item
			const translatedLabel = labelMap[item.label] || item.label
			const color = generateRandomColor()
			const id = generateId()

		let currentYOffset = 0

		// Calculate label position to avoid overlapping
		for (const placed of placedLabels) {
			const horizontalOverlap = Math.max(
				0, 
				Math.min(box.xmax, placed.xmax) - Math.max(box.xmin, placed.xmin)
			)
			if (horizontalOverlap > 0) {
				const placedLabelBottom = placed.verticalOffset + LABEL_HEIGHT + PADDING
				currentYOffset = Math.max(currentYOffset, placedLabelBottom)
			}
		}

		currentYOffset = Math.min(currentYOffset, MAX_VERTICAL_OFFSET)

		placedLabels.push({
			xmin: box.xmin,
			xmax: box.xmax,
			verticalOffset: currentYOffset,
		})

		return {
			...item,
			label: translatedLabel,
			color,
			id,
			verticalOffset: currentYOffset,
		}
	})
})

/**
 * Gets bounding box styles
 * @param item - Detection result
 * @returns Style object for the bounding box
 */
const getBoxStyle = (item: ProcessedDetectionResult) => {
	const { box } = item
	return {
		position: 'absolute',
		border: `2px solid ${item.color}`,
		left: `${box.xmin * 100}%`,
		top: `${box.ymin * 100}%`,
		width: `${(box.xmax - box.xmin) * 100}%`,
		height: `${(box.ymax - box.ymin) * 100}%`,
		boxSizing: 'border-box',
		borderRadius: '6px',
		zIndex: 98,
		boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.3)`,
	}
}

/**
 * Gets label styles
 * @param item - Detection result
 * @returns Style object for the label
 */
const getLabelStyle = (item: ProcessedDetectionResult) => {
	return {
		position: 'absolute',
		top: `-${28 + item.verticalOffset}px`,
		left: '-2px',
		backgroundColor: item.color,
		color: 'white',
		padding: '4px 8px',
		fontSize: '12px',
		fontWeight: '600',
		borderRadius: '6px',
		whiteSpace: 'nowrap',
		cursor: 'default',
		zIndex: 99,
		border: '1px solid rgba(255, 255, 255, 0.2)',
	}
}
</script>

<style scoped>
</style>
