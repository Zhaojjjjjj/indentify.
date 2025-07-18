export interface DetectionResult {
  label: string
  score: number
  box: {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
  }
}

export interface ProcessedDetectionResult {
  id: string
  label: string
  score: number
  color: string
  verticalOffset: number
  box: {
    xmin: number
    ymin: number
    xmax: number
    ymax: number
  }
}

export interface ImageData {
  src: string
  width: number
  height: number
}

export interface UploadedData {
  image: ImageData
  results: ProcessedDetectionResult[]
}

export interface LabelMap {
  [key: string]: string
}

export interface BlackHoleProps {
  strokeColor?: string
  numberOfLines?: number
  numberOfDiscs?: number
  particleRGBColor?: [number, number, number]
  class?: string
}

export interface WorkerMessage {
  status: string
  data?: any
  output?: DetectionResult[]
  message?: string
}