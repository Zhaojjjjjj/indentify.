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

  /**
   * Resets the progress state for fresh initialization
   */
  const resetProgress = () => {
    if (fakeProgressTimer) {
      clearInterval(fakeProgressTimer)
      fakeProgressTimer = null
    }
    currentPercent = 0
    readyFlag = false
    modelReady.value = false
  }
  
  let resolveDetection: ((value: DetectionResult[]) => void) | null = null
  let currentPercent = 0
  let fakeProgressTimer: NodeJS.Timeout | null = null
  let readyFlag = false

  /**
   * Updates the model loading progress - now only handles model ready state
   * @param p - Progress percentage (0-100)
   */
  const updateProgress = (p: number) => {
    // Only update to 100% when model is fully ready
    if (p >= 100 && readyFlag) {
      currentPercent = 100
      if (fakeProgressTimer) {
        clearInterval(fakeProgressTimer)
        fakeProgressTimer = null
      }
    }
    // Ignore real progress in other cases, rely completely on fake progress
  }

  /**
   * Starts fake progress animation - completely based on fake progress
   * Always starts from 0 and grows randomly
   */
  const startFakeProgress = () => {
    // Always reset to 0 for consistent experience
    currentPercent = 0
    
    if (fakeProgressTimer) clearInterval(fakeProgressTimer)
    
    // Update initial 0%
    updateModelStatus('detection.initializingModel', { percent: 0 })
    
    fakeProgressTimer = setInterval(() => {
      // If model is ready, quickly jump to 100%
      if (readyFlag) {
        currentPercent = 100
        if (fakeProgressTimer) {
          clearInterval(fakeProgressTimer)
          fakeProgressTimer = null
        }
        return
      }
      
      // If not at 99% yet, continue growing
      if (currentPercent < 99) {
        // Randomly increase 1%-5% per second
        const increment = Math.random() * 4 + 1 // 1-5%
        currentPercent = Math.min(currentPercent + increment, 99)
        updateModelStatus('detection.initializingModel', { percent: Math.floor(currentPercent) })
      }
      // Stop at 99% and wait for model loading completion
    }, 1000) // Update every 1 second
  }

  // Initialize Web Worker for AI model processing
  const worker = new Worker('/worker.js', { type: 'module' })
  
  // Initialize detection state - always reset for consistent experience
  resetProgress()
  startFakeProgress() // Start fake progress from 0

  /**
   * Handles messages from the Web Worker
   * @param event - Worker message event
   */
  const handleWorkerMessage = (event: MessageEvent<WorkerMessage>) => {
    const { status, data, output, message } = event.data

    switch (status) {
      case 'progress':
        // 忽略真实进度，只依赖假进度
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
