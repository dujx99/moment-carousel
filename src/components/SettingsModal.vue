<template>
	<Teleport to="body">
		<Transition name="modal-fade">
			<div
				v-if="isOpen"
				class="settings-modal-overlay"
				@click="handleOverlayClick"
			>
				<div class="settings-modal" @click.stop>
					<button
						class="close-btn"
						:aria-label="t('settings_title')"
						@click="close"
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
					<div class="settings-content">
						<h2>{{ t('settings_title') }}</h2>
						<slot></slot>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { t } from '@/plugins/i18n'

defineProps<{
	isOpen: boolean
}>()

const emit = defineEmits<{
	close: []
}>()

function close() {
	emit('close')
}

function handleOverlayClick() {
	close()
}
</script>

<style scoped>
/* 弹窗遮罩层 */
.settings-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	will-change: opacity;
}

/* 设置弹窗 - 3:2 比例 */
.settings-modal {
	position: relative;
	width: 90%;
	max-width: 600px;
	aspect-ratio: 3 / 2;
	max-height: none;
	overflow-y: auto;
	border-radius: 20px;
	/* 使用 7.jpg 作为背景 */
	background: url('/images/7.jpg') center/cover no-repeat;
	/* 添加半透明遮罩层 */
	backdrop-filter: blur(10px);
	will-change: transform, opacity;
}

/* 背景遮罩层，用于降低背景图透明度 */
.settings-modal::before {
	content: '';
	position: absolute;
	inset: 0;
	background: rgba(255, 255, 255, 0.85);
	border-radius: 20px;
	z-index: 0;
}

/* 设置内容 */
.settings-content {
	position: relative;
	z-index: 1;
	padding: 24px 30px;
	display: flex;
	flex-direction: column;
	gap: 20px;
	height: 100%;
	overflow-y: auto;
}

.settings-content h2 {
	margin: 0 0 8px 0;
	font-size: 1.4rem;
	color: #5a1a00;
	text-align: center;
	flex-shrink: 0;
}

/* 关闭按钮 */
.close-btn {
	position: absolute;
	top: 15px;
	right: 15px;
	width: 36px;
	height: 36px;
	border: none;
	background: rgba(90, 26, 0, 0.1);
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #5a1a00;
	transition: all 0.2s ease;
	z-index: 2;
	will-change: transform;
}

.close-btn:hover {
	background: rgba(90, 26, 0, 0.2);
	transform: scale(1.1);
}

.close-btn svg {
	width: 20px;
	height: 20px;
}

/* 弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: opacity 0.3s ease;
}

.modal-fade-enter-active .settings-modal,
.modal-fade-leave-active .settings-modal {
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}

.modal-fade-enter-from .settings-modal,
.modal-fade-leave-to .settings-modal {
	transform: scale(0.9) translateY(-20px);
	opacity: 0;
}
</style>
