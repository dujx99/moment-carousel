<template>
	<div class="carousel-container">
		<WaveBackground />

		<div class="welcome-header">
			<button class="heart-btn" @click="openSettings">❤️</button>
			<button class="lang-btn" @click="toggleLocale">
				{{ locale === 'zh-CN' ? '中' : 'EN' }}
			</button>
			<div class="welcome-text">
				<h1>{{ t('welcome') }}</h1>
			</div>
		</div>

		<CarouselViewer
			:photos="photos"
			:current-index="currentIndex"
			@prev="prev"
			@next="next"
			@pause="pauseAuto"
			@resume="resumeAuto"
		/>

		<CarouselDots
			v-if="showSideImages"
			:photos="photos"
			:current-index="currentIndex"
			:auto-scroll="autoSlideDots"
		/>

		<BackgroundMusic ref="musicPlayer" :musics="musics" :volume="musicVolume" />

		<SettingsModal :is-open="showSettings" @close="closeSettings">
			<div class="settings-content-inner">
				<div class="setting-item">
					<h3>{{ t('settings_imageSettings') }}</h3>
					<div class="setting-row">
						<label>{{ t('settings_bigImageCarousel') }}</label>
						<button
							:class="['toggle-btn', { active: autoSlide }]"
							@click="toggleAutoSlide"
						>
							{{ autoSlide ? t('settings_on') : t('settings_off') }}
						</button>
					</div>
					<div class="setting-row">
						<label>{{ t('settings_smallImageDisplay') }}</label>
						<button
							:class="['toggle-btn', { active: showSideImages }]"
							@click="toggleSideImages"
						>
							{{ showSideImages ? t('settings_on') : t('settings_off') }}
						</button>
					</div>
					<div v-if="showSideImages" class="setting-row">
						<label>{{ t('settings_smallImageCarousel') }}</label>
						<button
							:class="['toggle-btn', { active: autoSlideDots }]"
							@click="toggleAutoSlideDots"
						>
							{{ autoSlideDots ? t('settings_on') : t('settings_off') }}
						</button>
					</div>
				</div>

				<div class="setting-item">
					<h3>{{ t('settings_musicSettings') }}</h3>
					<div class="setting-row">
						<label>{{ t('settings_musicPlayback') }}</label>
						<button
							:class="['toggle-btn', { active: isMusicPlaying }]"
							@click="toggleMusic"
						>
							{{
								isMusicPlaying ? t('settings_playing') : t('settings_paused')
							}}
						</button>
					</div>
					<div class="setting-row">
						<label for="music-volume">{{ t('settings_volume') }}</label>
						<input
							id="music-volume"
							type="range"
							min="0"
							max="1"
							step="0.1"
							:value="musicVolume"
							@input="updateVolume"
						/>
						<span class="volume-value"
							>{{ Math.round(musicVolume * 100) }}%</span
						>
					</div>
				</div>
			</div>
		</SettingsModal>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { photos as photoPaths } from '@/config/photos'
import { musics as musicPaths } from '@/config/musics'
import SettingsModal from '@/components/SettingsModal.vue'
import BackgroundMusic from '@/components/BackgroundMusic.vue'
import { t, locale } from '@/plugins/i18n'

const photos = computed(() =>
	photoPaths.map((src, index) => ({
		src,
		alt: `Photo ${index + 1}`,
	})),
)

const currentIndex = ref(0)
let slideTimer: ReturnType<typeof setInterval> | null = null
const showSettings = ref(false)

const autoSlide = ref(true)
const autoSlideDots = ref(true)
const showSideImages = ref(true)

const musics = musicPaths
const musicVolume = ref(0.5)
const musicPlayer = ref<InstanceType<typeof BackgroundMusic> | null>(null)

function next() {
	currentIndex.value = (currentIndex.value + 1) % photos.value.length
}
function prev() {
	currentIndex.value =
		(currentIndex.value - 1 + photos.value.length) % photos.value.length
}

function startAuto() {
	if (slideTimer) return
	slideTimer = setInterval(next, 3000)
}
function pauseAuto() {
	if (slideTimer) {
		clearInterval(slideTimer)
		slideTimer = null
	}
}
function resumeAuto() {
	if (autoSlide.value) {
		startAuto()
	}
}

function openSettings() {
	showSettings.value = true
}

function closeSettings() {
	showSettings.value = false
}

function toggleLocale() {
	locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
}

function toggleAutoSlide() {
	autoSlide.value = !autoSlide.value
}

function toggleSideImages() {
	showSideImages.value = !showSideImages.value
}

function toggleAutoSlideDots() {
	autoSlideDots.value = !autoSlideDots.value
}

watch(autoSlide, (newVal) => {
	if (newVal) {
		startAuto()
	} else {
		pauseAuto()
	}
})

function updateVolume(event: Event) {
	const target = event.target as HTMLInputElement
	musicVolume.value = Number.parseFloat(target.value)
}

function toggleMusic() {
	if (musicPlayer.value) {
		musicPlayer.value.togglePlay()
	}
}

const isMusicPlaying = computed(() => musicPlayer.value?.isPlaying ?? false)

onMounted(() => {
	if (autoSlide.value) {
		startAuto()
	}
	if (musicPlayer.value) {
		musicPlayer.value.play()
	}
})

onUnmounted(() => {
	pauseAuto()
	if (musicPlayer.value) {
		musicPlayer.value.pause()
	}
})
</script>

<style scoped>
.carousel-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 0;
	box-sizing: border-box;
	position: relative;
	overflow: hidden;
}

/* WaveBackground 是第一个子元素，其余都压在上层 */
.carousel-container > *:not(:first-child) {
	position: relative;
	z-index: 10;
	flex-shrink: 0;
}

/* 顶部欢迎区域 */
.welcome-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	padding: 10px 0;
	background-color: rgb(238, 223, 211);
	position: relative;
}

.heart-btn,
.lang-btn {
	background: none;
	border: none;
	cursor: pointer;
	padding: 5px;
	border-radius: 50%;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
}

.heart-btn {
	left: 20px;
	font-size: 1.8rem;
}

.lang-btn {
	right: 20px;
	font-size: 0.9rem;
	background: rgba(90, 26, 0, 0.1);
	color: #5a1a00;
	padding: 8px 12px;
	border-radius: 6px;
}

.heart-btn:hover {
	transform: scale(1.15);
}

.heart-btn:active {
	transform: scale(1.05);
}

.lang-btn:hover {
	background: rgba(90, 26, 0, 0.2);
}

.avatar-placeholder {
	height: 100%;
	background: linear-gradient(135deg, #f4e4c1 0%, #e8d4b0 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.welcome-text {
	color: #5a1a00;
	text-align: center;
}

.welcome-text h1 {
	font-size: clamp(1.2rem, 2.5vh, 2rem);
	font-weight: 300;
	letter-spacing: 0.15em;
	margin: 0;
}

.carousel-container :deep(.carousel-stage) {
	flex-shrink: 1;
	flex-grow: 1;
	min-height: 0;
	width: 100%;
	align-self: stretch;
}

.settings-content-inner {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.setting-item h3 {
	margin: 0 0 12px 0;
	font-size: 1.05rem;
	color: #5a1a00;
	border-bottom: 1px solid rgba(90, 26, 0, 0.15);
	padding-bottom: 6px;
}

.setting-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 10px;
}

.setting-row label {
	color: #5a1a00;
	font-size: 0.95rem;
	min-width: 100px;
}

.setting-row input[type='range'] {
	flex: 1;
	height: 6px;
	border-radius: 3px;
	background: rgba(90, 26, 0, 0.15);
	outline: none;
	-webkit-appearance: none;
	appearance: none;
}

.setting-row input[type='range']::-webkit-slider-thumb {
	-webkit-appearance: none;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: #5a1a00;
	cursor: pointer;
	transition: transform 0.2s ease;
}

.setting-row input[type='range']::-webkit-slider-thumb:hover {
	transform: scale(1.1);
}

.volume-value {
	min-width: 45px;
	text-align: right;
	color: #5a1a00;
	font-size: 0.9rem;
}

.toggle-btn {
	padding: 8px 20px;
	border: 1px solid rgba(90, 26, 0, 0.3);
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.5);
	color: #5a1a00;
	font-size: 0.9rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.toggle-btn:hover {
	background: rgba(90, 26, 0, 0.1);
}

.toggle-btn.active {
	background: rgba(90, 26, 0, 0.85);
	color: #fff;
	border-color: #5a1a00;
}

.action-btn {
	padding: 10px 24px;
	border: none;
	border-radius: 6px;
	background: #5a1a00;
	color: #fff;
	font-size: 0.95rem;
	cursor: pointer;
	transition: all 0.2s ease;
	width: 100%;
}

.action-btn:hover {
	background: rgba(90, 26, 0, 0.85);
	transform: translateY(-1px);
}

.action-btn:active {
	transform: translateY(0);
}
</style>
