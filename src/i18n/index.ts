import { createI18n } from 'vue-i18n'

const en = {
  "app": {
    "title": "img Identify",
    "description": "AI-powered image object detection"
  },
  "upload": {
    "dragText": "Drag image here or click to upload",
    "supportText": "Support JPG, PNG format, file size no more than {size}MB",
    "analyzing": "Analyzing...",
    "analysisFailed": "Image analysis failed, please try again",
    "fileSizeError": "Upload image size cannot exceed {size}MB!"
  },
  "detection": {
    "initializingWorker": "Initializing worker thread...",
    "initializingModel": "Initializing model... {percent}%",
    "loadingModel": "Loading model",
    "modelReady": "Model ready",
    "modelLoadFailed": "Model loading failed: {message}",
    "modelNotReady": "Model not ready, unable to analyze.",
    "detecting": "Detecting objects...",
    "noResults": "No objects detected"
  },
  "language": {
    "switch": "Language",
    "english": "English",
    "chinese": "中文"
  },
  "status": {
    "ready": "Ready",
    "loading": "Loading",
    "error": "Error"
  },
  "results": {
    "detectedObjects": "Detected Objects",
    "confidence": "Confidence",
    "noResultsFound": "No objects detected in this image"
  }
}

const zh = {
  "app": {
    "title": "图像识别",
    "description": "AI驱动的图像物体检测"
  },
  "upload": {
    "dragText": "拖拽图片到此或点击上传",
    "supportText": "支持 JPG、PNG 格式，文件大小不超过 {size}MB",
    "analyzing": "分析中...",
    "analysisFailed": "图片分析失败，请重试",
    "fileSizeError": "上传图片大小不能超过 {size}MB!"
  },
  "detection": {
    "initializingWorker": "正在初始化工作线程...",
    "initializingModel": "初始化模型... {percent}%",
    "loadingModel": "正在加载模型",
    "modelReady": "模型已就绪",
    "modelLoadFailed": "模型加载失败: {message}",
    "modelNotReady": "模型尚未就绪，无法进行分析。",
    "detecting": "检测物体中...",
    "noResults": "未检测到物体"
  },
  "language": {
    "switch": "语言",
    "english": "English",
    "chinese": "中文"
  },
  "status": {
    "ready": "就绪",
    "loading": "加载中",
    "error": "错误"
  },
  "results": {
    "detectedObjects": "检测结果",
    "confidence": "置信度",
    "noResultsFound": "此图像中未检测到物体"
  }
}

const messages = {
  en,
  zh
}

const i18n = createI18n({
  legacy: false,
  locale: 'en', // Default language
  fallbackLocale: 'en',
  messages
})

export default i18n