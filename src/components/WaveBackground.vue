<template>
	<canvas ref="bgCanvas" class="bg-canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const bgCanvas = ref<HTMLCanvasElement | null>(null)
let rafId = 0

interface WaveLayer {
	color: string
	amplitude: number
	period: number
	speed: number
	yRatio: number
	phase: number
	blur: number
}

const waveLayers: WaveLayer[] = [
	{
		color: 'rgba(210,30,30,0.35)',
		amplitude: 120,
		period: 0.002,
		speed: 0.4,
		yRatio: 0.52,
		phase: 0,
		blur: 18,
	},
	{
		color: 'rgba(235,80,20,0.3)',
		amplitude: 100,
		period: 0.0026,
		speed: 0.55,
		yRatio: 0.5,
		phase: 1.5,
		blur: 14,
	},
	{
		color: 'rgba(200,180,140,0.35)',
		amplitude: 130,
		period: 0.003,
		speed: 0.7,
		yRatio: 0.48,
		phase: 3.0,
		blur: 12,
	},
	{
		color: 'rgba(220,50,80,0.25)',
		amplitude: 70,
		period: 0.0038,
		speed: 0.9,
		yRatio: 0.5,
		phase: 0.8,
		blur: 10,
	},
	{
		color: 'rgba(220,200,180,0.25)',
		amplitude: 80,
		period: 0.0046,
		speed: 1.1,
		yRatio: 0.49,
		phase: 2.2,
		blur: 8,
	},
]

function drawWave(
	ctx: CanvasRenderingContext2D,
	w: number,
	h: number,
	layer: WaveLayer,
	t: number,
) {
	const swingOffset =
		layer.amplitude * 0.5 * Math.sin(t * layer.speed + layer.phase)
	const centerY = layer.yRatio * h + swingOffset

	const points: { x: number; y: number }[] = []
	for (let x = 0; x <= w; x += 3) {
		const y =
			centerY + layer.amplitude * Math.sin(x * layer.period + layer.phase)
		points.push({ x, y })
	}

	const thickness = layer.amplitude * 0.55

	ctx.save()
	ctx.filter = `blur(${layer.blur}px)`

	ctx.beginPath()
	ctx.moveTo(points[0].x, points[0].y - thickness)
	for (const p of points) ctx.lineTo(p.x, p.y - thickness)
	for (let i = points.length - 1; i >= 0; i--)
		ctx.lineTo(points[i].x, points[i].y + thickness)
	ctx.closePath()

	const grad = ctx.createLinearGradient(
		0,
		centerY - thickness,
		0,
		centerY + thickness,
	)
	const transparent = layer.color.replace(/[\d.]+\)$/, '0)')
	grad.addColorStop(0, transparent)
	grad.addColorStop(0.35, layer.color)
	grad.addColorStop(0.65, layer.color)
	grad.addColorStop(1, transparent)
	ctx.fillStyle = grad
	ctx.fill()
	ctx.restore()
}

function start() {
	const canvas = bgCanvas.value
	if (!canvas) return
	const ctx = canvas.getContext('2d')!

	function resize() {
		canvas!.width = window.innerWidth
		canvas!.height = window.innerHeight
	}
	resize()
	window.addEventListener('resize', resize)

	let startTime = 0
	function frame(ts: number) {
		if (!startTime) startTime = ts
		const t = (ts - startTime) / 1000 // 秒

		const w = canvas!.width
		const h = canvas!.height

		ctx.fillStyle = '#fff8f0'
		ctx.fillRect(0, 0, w, h)

		const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4)
		topGrad.addColorStop(0, 'rgba(245,235,220,0.12)')
		topGrad.addColorStop(1, 'rgba(245,235,220,0)')
		ctx.fillStyle = topGrad
		ctx.fillRect(0, 0, w, h)

		for (const layer of waveLayers) {
			drawWave(ctx, w, h, layer, t)
		}

		rafId = requestAnimationFrame(frame)
	}
	frame(0)
}

function stop() {
	cancelAnimationFrame(rafId)
}

onMounted(start)
onUnmounted(stop)
</script>

<style scoped>
.bg-canvas {
	position: fixed;
	inset: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
	pointer-events: none;
}
</style>
