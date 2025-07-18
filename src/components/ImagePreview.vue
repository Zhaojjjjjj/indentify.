<template>
  <div class="image-preview">
    <!-- Main content area with side-by-side layout -->
    <div class="content-layout">
      <!-- Image section -->
      <div class="image-section">
        <div class="image-container">
          <img
            ref="imageRef"
            :src="data.image.src"
            :alt="$t('upload.analyzing')"
            class="preview-image"
            @load="onImageLoad"
          />

          <!-- Detection overlay -->
          <div v-if="imageLoaded && hasResults" class="detection-overlay">
            <!-- Detection boxes -->
            <div
              v-for="(result, index) in processedResults"
              :key="`box-${result.id}`"
              class="detection-box"
              :style="getBoxStyle(result, index)"
            ></div>

            <!-- Number labels -->
            <div
              v-for="(result, index) in processedResults"
              :key="`label-${result.id}`"
              class="number-label"
              :style="getNumberLabelStyle(result, index)"
            >
              {{ index + 1 }}
            </div>

            <!-- Connection lines for labels that need them -->
            <svg
              v-if="resultsWithLines.length > 0"
              class="connection-line"
              :width="imageWidth"
              :height="imageHeight"
            >
              <line
                v-for="result in resultsWithLines"
                :key="`line-${result.id}`"
                :x1="result.lineStart?.x || 0"
                :y1="result.lineStart?.y || 0"
                :x2="result.lineEnd?.x || 0"
                :y2="result.lineEnd?.y || 0"
                :stroke="result.color"
                :stroke-width="
                  selectedIndex === result.originalIndex ? '4' : '2'
                "
                :stroke-dasharray="
                  selectedIndex === result.originalIndex ? '8,4' : '5,5'
                "
                class="transition-all duration-200"
                :class="{
                  'opacity-90': selectedIndex === result.originalIndex,
                  'opacity-60': selectedIndex === null,
                }"
                :style="{
                  filter:
                    selectedIndex === result.originalIndex
                      ? `drop-shadow(0 0 8px ${result.color})`
                      : 'none',
                }"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Legend sidebar -->
      <div v-if="hasResults" class="legend-sidebar">
        <div 
          class="legend-container" 
          :class="{ 'single-item': legendItems.length === 1 }"
          :style="legendItems.length === 1 ? { minHeight: `${imageContainerHeight}px` } : {}"
        >
          <h3 class="legend-title text-#9887EC">
            {{ $t("results.detectedObjects") }}
          </h3>
          <el-scrollbar 
             class="legend-scrollbar" 
             :height="legendItems.length === 1 ? `${imageContainerHeight - 80}px` : '320px'"
           >
            <div class="legend-grid" :class="{ 'single-column': legendItems.length === 1 }">
              <div
                v-for="item in legendItems"
                :key="`legend-${item.id}`"
                class="legend-item"
                :class="{
                  highlighted:
                    highlightedIndex === item.index &&
                    selectedIndex !== item.index,
                  selected: selectedIndex === item.index,
                }"
                :style="{
                  borderColor: item.color,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                }"
                @mouseenter="handleMouseEnter(item.index)"
                @mouseleave="handleMouseLeave()"
                @click="toggleSelection(item.index)"
              >
                <div
                  class="legend-number"
                  :style="{ backgroundColor: item.color }"
                >
                  {{ item.number }}
                </div>
                <div class="legend-info">
                  <div class="legend-label" :style="{ color: item.color }">
                    {{ item.label || "Unknown" }}
                  </div>
                  <div class="legend-confidence" :style="{ color: item.color }">
                    {{ $t("results.confidence") }}:
                    {{ Math.round(item.score * 100) }}%
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- No results message -->
    <div v-if="!hasResults" class="no-results">
      <p>{{ $t("results.noResultsFound") }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import labelMap from "../utils/labelMap";
import type { ProcessedDetectionResult, UploadedData } from "../types";

interface Props {
  data: UploadedData;
}

const props = defineProps<Props>();

const { t } = useI18n();

// Reactive state
const imageRef = ref<HTMLImageElement>();
const imageLoaded = ref(false);
const imageWidth = ref(0);
const imageHeight = ref(0);
const highlightedIndex = ref<number | null>(null);
const selectedIndex = ref<number | null>(null);

// Image load handler
const onImageLoad = async () => {
  await nextTick();
  if (imageRef.value) {
    imageWidth.value = imageRef.value.offsetWidth;
    imageHeight.value = imageRef.value.offsetHeight;
    imageLoaded.value = true;
  }
};

// Mouse interaction handlers for legend only
const handleMouseEnter = (index: number) => {
  if (selectedIndex.value === null) {
    highlightedIndex.value = index;
  }
};

const handleMouseLeave = () => {
  if (selectedIndex.value === null) {
    highlightedIndex.value = null;
  }
};

// Toggle selection
const toggleSelection = (index: number) => {
  if (selectedIndex.value === index) {
    selectedIndex.value = null;
    highlightedIndex.value = null;
  } else {
    selectedIndex.value = index;
    highlightedIndex.value = index;
  }
};

const processedResults = computed((): ProcessedDetectionResult[] => {
  if (!Array.isArray(props.data.results)) {
    return [];
  }

  // Sort detection results by confidence score (highest first)
  const sortedResults = [...props.data.results].sort(
    (a, b) => b.score - a.score
  );

  /**
   * Generates a vibrant, distinguishable color
   * @param index - Index for consistent color generation
   * @returns HSL color string
   */
  const generateColor = (index: number): string => {
    const hue = (index * 137.508) % 360; // Golden angle approximation for good distribution
    return `hsl(${hue}, 70%, 50%)`;
  };

  /**
   * Generates a unique ID
   * @returns Unique identifier string
   */
  const generateId = (): string => {
    return `detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Calculates the best position for a number label
   * @param box - Bounding box coordinates
   * @param imageW - Image width
   * @param imageH - Image height
   * @returns Position object with coordinates and connection line info
   */
  const calculateLabelPosition = (box: any, imageW: number, imageH: number) => {
    const boxCenterX = (box.xmin + box.xmax) / 2;
    const boxCenterY = (box.ymin + box.ymax) / 2;
    const boxWidth = box.xmax - box.xmin;
    const boxHeight = box.ymax - box.ymin;

    // Try different positions in order of preference
    const positions = [
      // Top-left corner (preferred)
      { x: box.xmin, y: box.ymin, anchor: "top-left" },
      // Top-right corner
      { x: box.xmax, y: box.ymin, anchor: "top-right" },
      // Bottom-left corner
      { x: box.xmin, y: box.ymax, anchor: "bottom-left" },
      // Bottom-right corner
      { x: box.xmax, y: box.ymax, anchor: "bottom-right" },
    ];

    // For small objects, place label outside the box
    if (boxWidth < 0.1 || boxHeight < 0.1) {
      const margin = 0.02; // 2% margin
      return {
        x: Math.max(0, Math.min(1, box.xmin - margin)),
        y: Math.max(0, Math.min(1, box.ymin - margin)),
        anchor: "external",
        needsLine: true,
        lineStart: { x: boxCenterX * imageW, y: boxCenterY * imageH },
        lineEnd: {
          x: (box.xmin - margin) * imageW,
          y: (box.ymin - margin) * imageH,
        },
      };
    }

    // For normal-sized objects, use corner positioning
    return {
      x: positions[0].x,
      y: positions[0].y,
      anchor: positions[0].anchor,
      needsLine: false,
    };
  };

  return sortedResults.map((item, index) => {
    const { box } = item;
    const translatedLabel = labelMap[item.label] || item.label;
    const color = generateColor(index);
    const id = generateId();

    // Calculate optimal label position
    const labelPos = calculateLabelPosition(
      box,
      imageWidth.value,
      imageHeight.value
    );

    return {
      ...item,
      label: translatedLabel,
      color,
      id,
      labelPosition: labelPos,
      needsLine: labelPos.needsLine,
      lineStart: labelPos.lineStart,
      lineEnd: labelPos.lineEnd,
      verticalOffset: 0, // No longer needed with new positioning
    };
  });
});

/**
 * Gets the style for the bounding box
 * @param result - Detection result
 * @param index - Result index
 * @returns CSS style object
 */
const getBoxStyle = (result: ProcessedDetectionResult, index: number) => {
  const isSelected = selectedIndex.value === index;

  return {
    left: `${result.box.xmin * 100}%`,
    top: `${result.box.ymin * 100}%`,
    width: `${(result.box.xmax - result.box.xmin) * 100}%`,
    height: `${(result.box.ymax - result.box.ymin) * 100}%`,
    borderColor: result.color,
    borderWidth: isSelected ? "4px" : "2px",
    boxShadow: isSelected
      ? `0 0 20px ${result.color}, inset 0 0 10px ${result.color}40`
      : "none",
    zIndex: isSelected ? 15 : 1,
    transform: isSelected ? "scale(1.02)" : "scale(1)",
  };
};

/**
 * Gets the style for the number label
 * @param result - Detection result
 * @param index - Result index
 * @returns CSS style object
 */
const getNumberLabelStyle = (
  result: ProcessedDetectionResult,
  index: number
) => {
  const pos = result.labelPosition;
  if (!pos) return {};

  const isSelected = selectedIndex.value === index;

  return {
    left: `${pos.x * 100}%`,
    top: `${pos.y * 100}%`,
    backgroundColor: result.color,
    color: "white",
    transform:
      pos.anchor === "top-right" || pos.anchor === "bottom-right"
        ? "translateX(-100%)"
        : "translateX(0)",
    zIndex: isSelected ? 20 : 5,
    boxShadow: isSelected
      ? `0 0 15px ${result.color}, 0 0 30px ${result.color}60`
      : "none",
    scale: isSelected ? "1.3" : "1",
  };
};

// Computed properties for legend and interactions
const legendItems = computed(() => {
  return processedResults.value.map((result, index) => ({
    ...result,
    index,
    number: index + 1,
  }));
});

const resultsWithLines = computed(() => {
  return processedResults.value
    .map((result, index) => ({ ...result, originalIndex: index }))
    .filter((result) => result.needsLine);
});

const hasResults = computed(() => processedResults.value.length > 0);

// Get image height for single legend container
const imageContainerHeight = computed(() => {
  if (imageRef.value && legendItems.value.length === 1) {
    return imageRef.value.offsetHeight;
  }
  return 320; // Default height
});
</script>

<style scoped>
@reference "tailwindcss";

.image-preview {
  @apply relative w-full max-w-6xl mx-auto text-center;
}

.content-layout {
  @apply flex flex-col lg:flex-row gap-4 items-center lg:items-start justify-center;
  height: fit-content;
}

.image-section {
  @apply flex-shrink-0 w-full lg:w-auto;
  max-width: 100%;
}

@media (min-width: 1024px) {
  .image-section {
    max-width: 600px;
  }
}

.image-container {
  @apply relative w-full;
}

.preview-image {
  @apply w-full h-auto max-h-80 lg:max-h-96 object-contain rounded-lg shadow-lg;
  max-width: 100%;
}

.detection-overlay {
  @apply absolute inset-0;
}

.detection-box {
  @apply absolute border-2 rounded-md cursor-pointer transition-all duration-200;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.detection-box:hover {
  transform: scale(1);
}

.number-label {
  @apply absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-200;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.number-label:hover {
  transform: scale(1);
}

.tooltip {
  @apply absolute px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap pointer-events-none z-20;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.connection-line {
  @apply absolute inset-0 pointer-events-none;
}

.legend-sidebar {
  @apply w-full lg:w-82 flex-shrink-0 mt-4 lg:mt-0;
}

.legend-container {
  @apply p-3 bg-purple-300/10 backdrop-blur-sm rounded-lg border border-white/20 h-fit sticky top-4;
}

.legend-container.single-item {
  height: auto;
  min-height: 320px;
  display: flex;
  flex-direction: column;
}

.legend-title {
  @apply text-lg font-semibold mb-3 text-center;
}

.legend-scrollbar {
  width: 100%;
}

.legend-container.single-item .legend-scrollbar {
  flex: 1;
}

.legend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 4px;
  width: 100%;
}

.legend-grid.single-column {
  grid-template-columns: 1fr;
  place-items: center;
  height: 100%;
  align-content: center;
}

.legend-item {
  @apply flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200;
  background: rgba(255, 255, 255, 0.05);
  min-height: 60px;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-width: 1px !important;
}

.legend-item.highlighted {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  border-width: 2px !important;
}

.legend-item.selected {
  background: rgba(255, 255, 255, 0.3);
  border-width: 1px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 10;
}

.legend-number {
  @apply w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-info {
  @apply flex-1;
}

.legend-label {
  @apply font-medium text-sm;
}

.legend-confidence {
  @apply text-xs opacity-80;
}

.no-results {
  @apply text-center py-8 text-white/60;
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s ease-in-out;
}

/* Element Plus scrollbar styling */
:deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb) {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

:deep(.el-scrollbar__bar.is-vertical .el-scrollbar__thumb:hover) {
  background: rgba(255, 255, 255, 0.5);
}
</style>
