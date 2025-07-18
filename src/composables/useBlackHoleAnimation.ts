import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Disc {
  p: number
  x: number
  y: number
  w: number
  h: number
}

interface Point {
  x: number
  y: number
}

interface Particle {
  x: number
  sx: number
  dx: number
  y: number
  vy: number
  p: number
  r: number
  c: string
}

interface Clip {
  disc?: Disc
  i?: number
  path?: Path2D
}

interface State {
  discs: Disc[]
  lines: Point[][]
  particles: Particle[]
  clip: Clip
  startDisc: Disc
  endDisc: Disc
  rect: { width: number; height: number }
  render: { width: number; height: number; dpi: number }
  particleArea: {
    sw?: number
    ew?: number
    h?: number
    sx?: number
    ex?: number
  }
  linesCanvas?: HTMLCanvasElement
}

interface BlackHoleProps {
  strokeColor?: string
  numberOfLines?: number
  numberOfDiscs?: number
  particleRGBColor?: [number, number, number]
}

export const useBlackHoleAnimation = (props: BlackHoleProps) => {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const animationFrameIdRef = ref<number>(0)
  const stateRef = ref<State>({
    discs: [],
    lines: [],
    particles: [],
    clip: {},
    startDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    endDisc: { p: 0, x: 0, y: 0, w: 0, h: 0 },
    rect: { width: 0, height: 0 },
    render: { width: 0, height: 0, dpi: 1 },
    particleArea: {},
  })

  const linear = (p: number) => p

  const easeInExpo = (p: number) => (p === 0 ? 0 : Math.pow(2, 10 * (p - 1)))

  const tweenValue = (
    start: number,
    end: number,
    p: number,
    ease: 'inExpo' | null = null
  ) => {
    const delta = end - start
    const easeFn = ease === 'inExpo' ? easeInExpo : linear
    return start + delta * easeFn(p)
  }

  const tweenDisc = (disc: Disc) => {
    const { startDisc, endDisc } = stateRef.value
    disc.x = tweenValue(startDisc.x, endDisc.x, disc.p)
    disc.y = tweenValue(startDisc.y, endDisc.y, disc.p, 'inExpo')
    disc.w = tweenValue(startDisc.w, endDisc.w, disc.p)
    disc.h = tweenValue(startDisc.h, endDisc.h, disc.p)
  }

  const setSize = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    stateRef.value.rect = { width: rect.width, height: rect.height }
    stateRef.value.render = {
      width: rect.width,
      height: rect.height,
      dpi: window.devicePixelRatio || 1,
    }
    canvas.width = stateRef.value.render.width * stateRef.value.render.dpi
    canvas.height = stateRef.value.render.height * stateRef.value.render.dpi
  }

  const setDiscs = () => {
    const { width, height } = stateRef.value.rect
    if (width <= 0 || height <= 0) return

    stateRef.value.discs = []
    stateRef.value.startDisc = {
      p: 0,
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7,
    }
    stateRef.value.endDisc = {
      p: 0,
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0,
    }

    let prevBottom = height
    stateRef.value.clip = {}

    for (let i = 0; i < (props.numberOfDiscs || 50); i++) {
      const p = i / (props.numberOfDiscs || 50)
      const disc = { p, x: 0, y: 0, w: 0, h: 0 }
      tweenDisc(disc)
      const bottom = disc.y + disc.h
      if (bottom <= prevBottom) {
        stateRef.value.clip = { disc: { ...disc }, i }
      }
      prevBottom = bottom
      stateRef.value.discs.push(disc)
    }

    if (stateRef.value.clip.disc) {
      const clipPath = new Path2D()
      const disc = stateRef.value.clip.disc
      clipPath.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2)
      clipPath.rect(disc.x - disc.w, 0, disc.w * 2, disc.y)
      stateRef.value.clip.path = clipPath
    }
  }

  const setLines = () => {
    const { width, height } = stateRef.value.rect
    if (width <= 0 || height <= 0) return

    stateRef.value.lines = []
    const linesAngle = (Math.PI * 2) / (props.numberOfLines || 50)
    for (let i = 0; i < (props.numberOfLines || 50); i++) {
      stateRef.value.lines.push([])
    }

    stateRef.value.discs.forEach((disc: Disc) => {
      for (let i = 0; i < (props.numberOfLines || 50); i++) {
        const angle = i * linesAngle
        const p = {
          x: disc.x + Math.cos(angle) * disc.w,
          y: disc.y + Math.sin(angle) * disc.h,
        }
        stateRef.value.lines[i].push(p)
      }
    })

    const offCanvas = document.createElement('canvas')
    offCanvas.width = Math.max(1, width)
    offCanvas.height = Math.max(1, height)

    const ctx = offCanvas.getContext('2d')
    if (!ctx || !stateRef.value.clip.path) {
      stateRef.value.linesCanvas = undefined
      return
    }

    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height)

    stateRef.value.lines.forEach((line: Point[]) => {
      ctx.save()
      let lineIsIn = false
      line.forEach((p1: Point, j: number) => {
        if (j === 0) return
        const p0 = line[j - 1]
        if (
          !lineIsIn &&
          (ctx.isPointInPath(stateRef.value.clip.path!, p1.x, p1.y) ||
            ctx.isPointInStroke(stateRef.value.clip.path!, p1.x, p1.y))
        ) {
          lineIsIn = true
        } else if (lineIsIn) {
          ctx.clip(stateRef.value.clip.path!)
        }
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.strokeStyle = props.strokeColor || '#737373'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.closePath()
      })
      ctx.restore()
    })
    stateRef.value.linesCanvas = offCanvas
  }

  const initParticle = (start: boolean = false): Particle => {
    const sx =
      (stateRef.value.particleArea.sx || 0) +
      (stateRef.value.particleArea.sw || 0) * Math.random()
    const ex =
      (stateRef.value.particleArea.ex || 0) +
      (stateRef.value.particleArea.ew || 0) * Math.random()
    const dx = ex - sx
    const y = start
      ? (stateRef.value.particleArea.h || 0) * Math.random()
      : stateRef.value.particleArea.h || 0
    const r = 0.5 + Math.random() * 4
    const vy = 0.5 + Math.random()
    const [r1, g1, b1] = props.particleRGBColor || [255, 255, 255]
    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      p: 0,
      r,
      c: `rgba(${r1}, ${g1}, ${b1}, ${Math.random()})`,
    }
  }

  const setParticles = () => {
    const { width, height } = stateRef.value.rect
    stateRef.value.particles = []
    const disc = stateRef.value.clip.disc
    if (!disc) return
    stateRef.value.particleArea = {
      sw: disc.w * 0.5,
      ew: disc.w * 2,
      h: height * 0.85,
    }
    stateRef.value.particleArea.sx =
      (width - (stateRef.value.particleArea.sw || 0)) / 2
    stateRef.value.particleArea.ex =
      (width - (stateRef.value.particleArea.ew || 0)) / 2
    const totalParticles = 100
    for (let i = 0; i < totalParticles; i++) {
      stateRef.value.particles.push(initParticle(true))
    }
  }

  const drawDiscs = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = props.strokeColor || '#737373'
    ctx.lineWidth = 2
    const outerDisc = stateRef.value.startDisc
    ctx.beginPath()
    ctx.ellipse(outerDisc.x, outerDisc.y, outerDisc.w, outerDisc.h, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.closePath()
    stateRef.value.discs.forEach((disc: Disc, i: number) => {
      if (i % 5 !== 0) return
      if (disc.w < (stateRef.value.clip.disc?.w || 0) - 5) {
        ctx.save()
        ctx.clip(stateRef.value.clip.path!)
      }
      ctx.beginPath()
      ctx.ellipse(disc.x, disc.y, disc.w, disc.h, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.closePath()
      if (disc.w < (stateRef.value.clip.disc?.w || 0) - 5) {
        ctx.restore()
      }
    })
  }

  const drawLines = (ctx: CanvasRenderingContext2D) => {
    if (
      stateRef.value.linesCanvas &&
      stateRef.value.linesCanvas.width > 0 &&
      stateRef.value.linesCanvas.height > 0
    ) {
      ctx.drawImage(stateRef.value.linesCanvas, 0, 0)
    }
  }

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.clip(stateRef.value.clip.path!)
    stateRef.value.particles.forEach((particle: Particle) => {
      ctx.fillStyle = particle.c
      ctx.beginPath()
      ctx.rect(particle.x, particle.y, particle.r, particle.r)
      ctx.closePath()
      ctx.fill()
    })
    ctx.restore()
  }

  const moveDiscs = () => {
    stateRef.value.discs.forEach((disc: Disc) => {
      disc.p = (disc.p + 0.001) % 1
      tweenDisc(disc)
    })
  }

  const moveParticles = () => {
    stateRef.value.particles.forEach((particle: Particle, idx: number) => {
      particle.p = 1 - particle.y / (stateRef.value.particleArea.h || 1)
      particle.x = particle.sx + particle.dx * particle.p
      particle.y -= particle.vy
      if (particle.y < 0) {
        stateRef.value.particles[idx] = initParticle()
      }
    })
  }

  const tick = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(stateRef.value.render.dpi, stateRef.value.render.dpi)
    moveDiscs()
    moveParticles()
    drawDiscs(ctx)
    drawLines(ctx)
    drawParticles(ctx)
    ctx.restore()
    animationFrameIdRef.value = requestAnimationFrame(tick)
  }

  const init = () => {
    setSize()
    setDiscs()
    setLines()
    setParticles()
  }

  const handleResize = () => {
    setSize()
    setDiscs()
    setLines()
    setParticles()
  }

  const startAnimation = () => {
    nextTick(() => {
      setSize()
      init()
      tick()
      window.addEventListener('resize', handleResize)
    })
  }

  const stopAnimation = () => {
    window.removeEventListener('resize', handleResize)
    cancelAnimationFrame(animationFrameIdRef.value)
  }

  onMounted(() => {
    startAnimation()
  })

  onBeforeUnmount(() => {
    stopAnimation()
  })

  return {
    canvasRef,
    startAnimation,
    stopAnimation,
  }
}