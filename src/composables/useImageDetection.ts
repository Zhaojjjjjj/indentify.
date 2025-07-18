import { ref, computed, watch } from 'vue'
import type { DetectionResult, ProcessedDetectionResult, ImageData, UploadedData, WorkerMessage } from '../types'
import labelMap from '../utils/labelMap'
import i18n from '../i18n'

export const useImageDetection = () => {
  const t = (key: string, params?: any) => i18n.global.t(key, params)
  const modelStatus = ref(t('detection.initializingWorker'))
  const modelReady = ref(false)
  
  // Store current status key and params for language switching updates
  let currentStatusKey = 'detection.initializingWorker'
  let currentStatusParams: any = undefined
  
  /**
   * Updates the model status with reactive translation
   * @param key - Translation key
   * @param params - Translation parameters
   */
  const updateModelStatus = (key: string, params?: any) => {
    currentStatusKey = key
    currentStatusParams = params
    modelStatus.value = t(key, params)
  }
  
  // Watch for language changes and update status accordingly
  watch(() => i18n.global.locale.value, () => {
    updateModelStatus(currentStatusKey, currentStatusParams)
  })
  
  let resolveDetection: ((value: DetectionResult[]) => void) | null = null
  let currentPercent = 0
  let fakeProgressTimer: NodeJS.Timeout | null = null
  let readyFlag = false

  /**
   * Updates the model loading progress
   * @param p - Progress percentage (0-100)
   */
  const updateProgress = (p: number) => {
    if (readyFlag) return
    p = Math.floor(p)
    if (p > 99) p = 99
    if (p > currentPercent) {
      currentPercent = p
      updateModelStatus('detection.initializingModel', { percent: currentPercent })
    }
  }

  /**
   * Starts fake progress animation for better UX
   * @param fromPercent - Starting percentage
   */
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
        updateModelStatus('detection.initializingModel', { percent: currentPercent })
      }
    }, 1000)
  }

  // Initialize Web Worker for AI model processing
  const worker = new Worker('/worker.js', { type: 'module' })
  
  // Initialize detection state
  readyFlag = false
  modelReady.value = false
  updateModelStatus('detection.initializingModel', { percent: 0 })
  currentPercent = 0
  startFakeProgress(0)

  /**
   * Handles messages from the Web Worker
   * @param event - Worker message event
   */
  const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
    const { status, data, output, message } = event.data

    switch (status) {
      case 'progress':
        updateModelStatus('detection.loadingModel')
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
        updateModelStatus('detection.modelReady')
        modelReady.value = true
        break
        
      case 'complete':
        if (resolveDetection) {
          resolveDetection(output || [])
          resolveDetection = null
        }
        break
        
      case 'error':
        updateModelStatus('detection.modelLoadFailed', { message })
        console.error('Worker error:', message)
        break
    }
  }

  // Set up Worker message handling
  worker.onmessage = handleWorkerMessage

  /**
   * Detects objects in the provided image file
   * @param imageFile - Image file to analyze
   * @returns Promise resolving to uploaded data with detection results
   */
  const detect = async (imageFile: File): Promise<UploadedData | null> => {
     if (!modelReady.value) {
       return Promise.reject(new Error(t('detection.modelNotReady')))
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

// Create global detection instance
const globalDetection = useImageDetection()

export const { modelStatus, modelReady, detect } = globalDetection
