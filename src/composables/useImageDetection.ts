import { ref } from 'vue'
import type { DetectionResult, ProcessedDetectionResult, ImageData, UploadedData, WorkerMessage } from '../types'
import labelMap from '../utils/labelMap'

export const useImageDetection = () => {
  const modelStatus = ref('正在初始化工作线程...')
  const modelReady = ref(false)
  
  let resolveDetection: ((value: DetectionResult[]) => void) | null = null
  let currentPercent = 0
  let fakeProgressTimer: NodeJS.Timeout | null = null
  let readyFlag = false

  const updateProgress = (p: number) => {
    if (readyFlag) return
    p = Math.floor(p)
    if (p > 99) p = 99
    if (p > currentPercent) {
      currentPercent = p
      modelStatus.value = `初始化模型... ${currentPercent}%`
    }
  }

  const startFakeProgress = (fromPercent: number) => {
    if (fakeProgressTimer) clearInterval(fakeProgressTimer)
    currentPercent = fromPercent
    fakeProgressTimer = setInterval(() => {
      if (readyFlag) {
        clearInterval(fakeProgressTimer!)
        fakeProgressTimer = null
        return
      }
      if (currentPercent < 99) {
        const increment = Math.floor(Math.random() * 3) + 1
        currentPercent = Math.min(99, currentPercent + increment)
        modelStatus.value = `初始化模型... ${currentPercent}%`
      }
    }, 1000)
  }

  // 初始化Worker
  const worker = new Worker('/worker.js', { type: 'module' })
  
  // 初始化状态
  readyFlag = false
  modelReady.value = false
  modelStatus.value = '初始化模型... 0%'
  currentPercent = 0
  startFakeProgress(0)

  const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
    const { status, data, output, message } = event.data

    switch (status) {
      case 'progress':
        modelStatus.value = '正在加载模型'
        if (data?.progress !== undefined) {
          updateProgress(Math.round(data.progress * 100))
        }
        break
        
      case 'ready':
        readyFlag = true
        if (fakeProgressTimer) {
          clearInterval(fakeProgressTimer)
          fakeProgressTimer = null
        }
        currentPercent = 100
        modelStatus.value = '模型已就绪'
        modelReady.value = true
        break
        
      case 'complete':
        if (resolveDetection) {
          resolveDetection(output || [])
          resolveDetection = null
        }
        break
        
      case 'error':
        modelStatus.value = `模型加载失败: ${message}`
        console.error('Worker error:', message)
        break
    }
  }

  // 设置 Worker 消息处理
  worker.onmessage = handleWorkerMessage

  const detect = async (imageFile: File): Promise<UploadedData | null> => {
     if (!modelReady.value) {
       return Promise.reject(new Error('模型尚未就绪，无法进行分析。'))
     }
 
     return new Promise((resolve) => {
       const reader = new FileReader()
       reader.onload = (e) => {
         const imageSrc = e.target?.result as string
         
         resolveDetection = (results: DetectionResult[]) => {
             const processedResults: ProcessedDetectionResult[] = results.map((result, index) => ({
               id: `detection-${Date.now()}-${index}`,
               label: labelMap[result.label] || result.label,
               score: result.score,
               color: `hsl(${Math.random() * 360}, 70%, 50%)`,
               verticalOffset: 0,
               box: result.box
             }))
             
             const uploadedData: UploadedData = {
               image: {
                 src: imageSrc,
                 width: 0, // Will be set by the component
                 height: 0 // Will be set by the component
               },
               results: processedResults
             }
             
             resolve(uploadedData)
           }
         
         worker.postMessage({ type: 'detect', data: { imgSrc: imageSrc } })
       }
       
       reader.readAsDataURL(imageFile)
     })
   }

  return {
    modelStatus,
    modelReady,
    detect,
  }
}

// 创建全局实例
const globalDetection = useImageDetection()

export const { modelStatus, modelReady, detect } = globalDetection