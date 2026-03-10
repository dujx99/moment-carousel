declare module '*.yml' {
	const content: Record<string, unknown>
	export default content
}

declare module 'vue-i18n' {
	export interface DefineLocaleMessage {
		welcome: string
		settings: {
			imageSettings: string
			musicSettings: string
			bigImageCarousel: string
			smallImageDisplay: string
			smallImageCarousel: string
			musicPlayback: string
			volume: string
			on: string
			off: string
			playing: string
			paused: string
		}
	}
}

declare module 'vue-i18n/dist/vue-i18n' {
	export interface I18nAvailableLocales {
		'zh-CN': {}
		en: {}
	}
}
