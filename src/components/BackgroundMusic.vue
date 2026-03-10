<template>
	<div class="background-music-player">
		<audio
			ref="audioRef"
			:loop="false"
			:volume="volume"
			@ended="handleEnded"
			@error="handleError"
		>
			<source :src="currentMusic" type="audio/mpeg" />
		</audio>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const props = withDefaults(
	defineProps<{
		musics: string[]
		loop?: boolean
		volume?: number
	}>(),
	{
		loop: true,
		volume: 0.5,
	},
)

const audioRef = ref<HTMLAudioElement | null>(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const initialized = ref(false)

const currentMusic = computed(() => props.musics[currentIndex.value])

// 初始化时随机选择一首歌曲
function initializeRandomIndex() {
	if (!initialized.value && props.musics.length > 0) {
		currentIndex.value = Math.floor(Math.random() * props.musics.length)
		initialized.value = true
	}
}

// 播放
function play() {
	if (audioRef.value) {
		audioRef.value.play()
		isPlaying.value = true
	}
}

// 暂停
function pause() {
	if (audioRef.value) {
		audioRef.value.pause()
		isPlaying.value = false
	}
}

// 切换播放/暂停
function togglePlay() {
	if (isPlaying.value) {
		pause()
	} else {
		play()
	}
}

// 播放下一首
function playNext() {
	if (props.musics.length > 1) {
		currentIndex.value = (currentIndex.value + 1) % props.musics.length
	} else if (!props.loop) {
		pause()
		return
	}
}

// 播放上一首
function playPrev() {
	if (props.musics.length > 1) {
		currentIndex.value =
			(currentIndex.value - 1 + props.musics.length) % props.musics.length
	}
}

// 音频播放结束
function handleEnded() {
	playNext()
}

// 音频加载错误
function handleError() {
	console.error('背景音乐加载失败:', currentMusic.value)
	if (props.musics.length > 1) {
		setTimeout(() => {
			playNext()
		}, 1000)
	}
}

// 暴露方法给父组件
defineExpose({
	play,
	pause,
	togglePlay,
	playNext,
	playPrev,
	isPlaying,
	currentMusic,
	currentIndex,
})

// 组件挂载时初始化随机索引
onMounted(() => {
	initializeRandomIndex()
})

// 监听当前音乐变化，自动加载新歌曲
watch(currentMusic, () => {
	if (audioRef.value && isPlaying.value) {
		audioRef.value.load()
		audioRef.value.play()
	}
})

// 监听音量变化
watch(
	() => props.volume,
	(newVolume) => {
		if (audioRef.value) {
			audioRef.value.volume = newVolume
		}
	},
)
</script>

<style scoped>
.background-music-player {
	display: none;
}
</style>
