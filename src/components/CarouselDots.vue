<template>
	<div class="film-strip-outer">
		<div ref="stripEl" class="film-strip">
			<div v-for="(item, i) in displayList" :key="i" class="film-cell">
				<img :src="item.src" :alt="item.alt" draggable="false" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Photo {
	src: string
	alt: string
}

const props = defineProps<{
	photos: Photo[]
	currentIndex: number
	autoScroll?: boolean
}>()

const autoScroll = computed(() => props.autoScroll ?? true)

const displayList = computed(() => {
	const repeatCount = Math.max(4, Math.ceil(80 / props.photos.length))
	const result: Photo[] = []
	for (let r = 0; r < repeatCount; r++) {
		result.push(...props.photos)
	}
	return result
})

const stripEl = ref<HTMLElement | null>(null)
let rafId = 0
let offset = 0
const SPEED = 0.6

function loop() {
	const el = stripEl.value
	if (!el) return
	offset += SPEED
	const repeatCount = Math.max(4, Math.ceil(80 / props.photos.length))
	const singleGroupWidth = el.scrollWidth / repeatCount
	if (offset >= singleGroupWidth) {
		offset = offset % singleGroupWidth
	}
	el.style.transform = `translateX(-${offset}px)`
	rafId = requestAnimationFrame(loop)
}

function startScroll() {
	if (!rafId) {
		loop()
	}
}

function stopScroll() {
	if (rafId) {
		cancelAnimationFrame(rafId)
		rafId = 0
	}
}

watch(autoScroll, (newVal) => {
	if (newVal) {
		startScroll()
	} else {
		stopScroll()
	}
})

onMounted(() => {
	if (autoScroll.value) {
		loop()
	}
})

onUnmounted(() => {
	cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.film-strip-outer {
	width: 100%;
	padding: 5px 0;
	overflow: hidden;
	mask-image: linear-gradient(
		to right,
		transparent 0%,
		black 6%,
		black 94%,
		transparent 100%
	);
	-webkit-mask-image: linear-gradient(
		to right,
		transparent 0%,
		black 6%,
		black 94%,
		transparent 100%
	);
}

.film-strip {
	display: flex;
	gap: 6px;
	will-change: transform;
	width: max-content;
}

.film-cell {
	flex-shrink: 0;
	width: auto;
	height: clamp(50px, min(6vw, 8vh), 100px);
	border-radius: 5px;
	overflow: hidden;
	cursor: default;
	border: 1px solid rgba(200, 140, 40, 0.15);
	display: flex;
	align-items: center;
	justify-content: center;
}

.film-cell img {
	height: 100%;
	width: auto;
	object-fit: contain;
	display: block;
	pointer-events: none;
	max-width: clamp(80px, min(10vw, 14vh), 180px);
}
</style>
