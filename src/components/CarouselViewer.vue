<template>
	<div
		class="carousel-stage"
		@mouseenter="emit('pause')"
		@mouseleave="emit('resume')"
	>
		<div
			v-for="item in visibleCards"
			:key="item.key"
			class="card"
			:class="[item.pos, item.animClass]"
			:style="item.pos === 'current' ? getCardStyle(item.photo) : {}"
			:data-aspect-ratio="
				item.pos === 'current' ? getAspectRatio(item.photo) : ''
			"
			@click="
				item.pos === 'prev'
					? emit('prev')
					: item.pos === 'next'
						? emit('next')
						: undefined
			"
		>
			<div
				class="card-bg"
				:style="{ backgroundImage: `url(${item.photo.src})` }"
			/>
			<img
				:src="item.photo.src"
				:alt="item.photo.alt"
				class="card-img"
				:style="item.pos === 'current' ? getImageStyle(item.photo) : {}"
			/>
		</div>

		<!-- 箭头 -->
		<button
			:aria-label="t('carousel_prev')"
			class="arrow arrow-left"
			@click="emit('prev')"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polyline points="15 18 9 12 15 6" />
			</svg>
		</button>
		<button
			:aria-label="t('carousel_next')"
			class="arrow arrow-right"
			@click="emit('next')"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { t } from '@/plugins/i18n'

interface Photo {
	src: string
	alt: string
	width?: number
	height?: number
}

const props = defineProps<{
	photos: Photo[]
	currentIndex: number
}>()

const imageDimensions = ref<Map<string, { width: number; height: number }>>(
	new Map(),
)

const getImageDimensions = (
	src: string,
): { width: number; height: number } | null => {
	return imageDimensions.value.get(src) || null
}

const loadImageDimensions = (src: string) => {
	if (imageDimensions.value.has(src)) return

	const img = new Image()
	img.onload = () => {
		imageDimensions.value.set(src, {
			width: img.naturalWidth,
			height: img.naturalHeight,
		})
	}
	img.src = src
}

watch(
	() => props.photos,
	(photos) => {
		photos.forEach((photo) => loadImageDimensions(photo.src))
	},
	{ immediate: true },
)

const getCardStyle = (photo: Photo) => {
	const dimensions = getImageDimensions(photo.src)
	if (!dimensions) return {}

	const { width, height } = dimensions
	const aspectRatio = width / height

	if (aspectRatio < 1) {
		return {
			backgroundImage: `url(${photo.src})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		}
	}

	return {}
}

const getAspectRatio = (photo: Photo) => {
	const dimensions = getImageDimensions(photo.src)
	if (!dimensions) return 'unknown'

	const { width, height } = dimensions
	const aspectRatio = width / height

	if (aspectRatio < 1) return 'portrait'
	if (aspectRatio > 1) return 'landscape'
	return 'square'
}

const getImageStyle = (photo: Photo) => {
	const dimensions = getImageDimensions(photo.src)
	if (!dimensions) return {}

	const { width, height } = dimensions

	const maxWidth = window.innerWidth * 0.6
	const maxHeight = window.innerHeight * 0.8

	let displayWidth = width
	let displayHeight = height

	if (width > maxWidth || height > maxHeight) {
		const widthRatio = maxWidth / width
		const heightRatio = maxHeight / height
		const scaleRatio = Math.min(widthRatio, heightRatio)

		displayWidth = width * scaleRatio
		displayHeight = height * scaleRatio
	}

	return {
		width: `${displayWidth}px`,
		height: `${displayHeight}px`,
	}
}

const emit = defineEmits<{
	prev: []
	next: []
	pause: []
	resume: []
}>()

const n = computed(() => props.photos.length)

function photoAt(i: number): Photo {
	return props.photos[((i % n.value) + n.value) % n.value]
}

const direction = ref<1 | -1>(1)
const prevIndex = ref(props.currentIndex)
const isTransitioning = ref(false)
let transitionTimer: ReturnType<typeof setTimeout> | null = null

watch(
	() => props.currentIndex,
	(newVal, oldVal) => {
		const diff = newVal - oldVal
		const half = n.value / 2
		if (diff > 0 && diff < half) direction.value = 1
		else if (diff < 0 && -diff < half) direction.value = -1
		else if (diff >= half) direction.value = -1
		else direction.value = 1

		prevIndex.value = oldVal
		isTransitioning.value = true
		if (transitionTimer) clearTimeout(transitionTimer)
		transitionTimer = setTimeout(() => {
			isTransitioning.value = false
		}, 700)
	},
)

const visibleCards = computed(() => {
	const ci = props.currentIndex
	const pi = prevIndex.value
	const dir = direction.value

	type CardPos = 'prev' | 'current' | 'next' | 'leaving'
	const cards: {
		key: string
		pos: CardPos
		photo: Photo
		animClass: string
	}[] = [
		{
			key: `prev-${ci}`,
			pos: 'prev',
			photo: photoAt(ci - 1),
			animClass: isTransitioning.value ? 'side-in' : '',
		},
		{
			key: `current-${ci}`,
			pos: 'current',
			photo: photoAt(ci),
			animClass: isTransitioning.value
				? dir === 1
					? 'enter-from-right'
					: 'enter-from-left'
				: '',
		},
		{
			key: `next-${ci}`,
			pos: 'next',
			photo: photoAt(ci + 1),
			animClass: isTransitioning.value ? 'side-in' : '',
		},
	]

	if (isTransitioning.value && pi !== ci) {
		cards.push({
			key: `leaving-${pi}`,
			pos: 'leaving',
			photo: photoAt(pi),
			animClass: dir === 1 ? 'leave-to-left' : 'leave-to-right',
		})
	}

	return cards
})
</script>

<style scoped>
.carousel-stage {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	perspective: 1400px;
}

/* ── 卡片基础 ── */
.card {
	position: absolute;
	border-radius: 14px;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: default;
	will-change: transform, opacity;
	transition:
		transform 0.65s cubic-bezier(0.4, 0, 0.2, 1),
		opacity 0.65s cubic-bezier(0.4, 0, 0.2, 1),
		box-shadow 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.card.current {
	width: auto;
	height: auto;
	max-width: 60vw;
	max-height: 80vh;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translateX(0) scale(1) rotateY(0deg);
	opacity: 1;
	z-index: 2;
	box-shadow: 0 24px 80px rgba(120, 40, 0, 0.55);
}

.card.prev,
.card.next {
	width: min(38vw, calc(56vh * 1.6));
	height: min(56vh, calc(38vw / 0.6));
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0.55;
	z-index: 1;
	cursor: pointer;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card.prev {
	transform: translateX(-62%);
}

.card.next {
	transform: translateX(62%);
}

.card.prev:hover {
	opacity: 0.72;
}
.card.next:hover {
	opacity: 0.72;
}

/* leaving 继承 current 的尺寸，z-index 低于新主图，从后方淡出 */
.card.leaving {
	width: auto;
	height: auto;
	max-width: 60vw;
	max-height: 80vh;
	z-index: 1;
	pointer-events: none;
	transition: none;
}

.card.current.enter-from-right {
	animation: enterFromRight 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.card.current.enter-from-left {
	animation: enterFromLeft 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes enterFromRight {
	from {
		transform: translateX(45%) scale(0.86) rotateY(-22deg);
		opacity: 0.1;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}
	to {
		transform: translateX(0) scale(1) rotateY(0deg);
		opacity: 1;
		box-shadow: 0 24px 80px rgba(120, 40, 0, 0.55);
	}
}

@keyframes enterFromLeft {
	from {
		transform: translateX(-45%) scale(0.86) rotateY(22deg);
		opacity: 0.1;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}
	to {
		transform: translateX(0) scale(1) rotateY(0deg);
		opacity: 1;
		box-shadow: 0 24px 80px rgba(120, 40, 0, 0.55);
	}
}

/* ────────── 退场动画 ────────── */

/* 旧主图向左飞出（向前翻页） */
.card.leaving.leave-to-left {
	animation: leaveToLeft 0.65s cubic-bezier(0.4, 0, 1, 1) both;
}

.card.leaving.leave-to-right {
	animation: leaveToRight 0.65s cubic-bezier(0.4, 0, 1, 1) both;
}

@keyframes leaveToLeft {
	from {
		transform: translateX(0) scale(1) rotateY(0deg);
		opacity: 0.9;
	}
	35% {
		opacity: 0.15;
	}
	to {
		transform: translateX(-40%) scale(0.88) rotateY(16deg);
		opacity: 0;
	}
}

@keyframes leaveToRight {
	from {
		transform: translateX(0) scale(1) rotateY(0deg);
		opacity: 0.9;
	}
	35% {
		opacity: 0.15;
	}
	to {
		transform: translateX(40%) scale(0.88) rotateY(-16deg);
		opacity: 0;
	}
}

/* ────────── 侧图跟随动画 ────────── */
.card.prev.side-in,
.card.next.side-in {
	animation: sideSlide 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes sideSlide {
	from {
		opacity: 0.25;
	}
	to {
		opacity: 0.55;
	}
}

.card-bg {
	position: absolute;
	inset: -10px;
	background-size: cover;
	background-position: center;
	filter: blur(18px) brightness(0.5) saturate(1.3);
	z-index: 0;
}

.card-img {
	position: relative;
	z-index: 1;
	max-width: 60vw;
	max-height: 80vh;
	width: auto;
	height: auto;
	display: block;
	border-radius: 12px;
	transition: border-radius 0.3s ease;
}

.card.current .card-img {
	width: auto;
	height: auto;
	max-width: 60vw;
	max-height: 80vh;
	object-fit: contain;
}

.card.prev .card-img,
.card.next .card-img {
	border-radius: 10px;
}

.card.current[data-aspect-ratio='portrait'] {
	position: relative;
}

.card.current[data-aspect-ratio='portrait']::before,
.card.current[data-aspect-ratio='portrait']::after {
	content: '';
	position: absolute;
	top: 0;
	bottom: 0;
	width: 15%;
	background-size: cover;
	background-position: center;
	filter: blur(15px) brightness(0.6) saturate(1.2);
	opacity: 0.8;
	z-index: 0;
}

.card.current[data-aspect-ratio='portrait']::before {
	left: -10%;
	background-image: inherit;
	transform: scale(1.1);
}

.card.current[data-aspect-ratio='portrait']::after {
	right: -10%;
	background-image: inherit;
	transform: scale(1.1);
}

/* ── 箭头 ── */
.arrow {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	background: rgba(255, 255, 255, 0.18);
	backdrop-filter: blur(8px);
	color: #fff;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition:
		background 0.2s,
		transform 0.2s;
	z-index: 20;
}

.arrow:hover {
	background: rgba(255, 255, 255, 0.32);
	transform: translateY(-50%) scale(1.08);
}

.arrow svg {
	width: 20px;
	height: 20px;
}

.arrow-left {
	left: 12px;
}
.arrow-right {
	right: 12px;
}
</style>
