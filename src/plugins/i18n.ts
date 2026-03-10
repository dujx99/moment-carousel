import { defu } from 'defu'
// @ts-ignore
import { createI18n } from 'vue-i18n'

const yamls = import.meta.glob('../../locales/*/**.y(a)?ml', {
	eager: true,
})

const languages = Object.entries(yamls).map(([key, value]) => {
	const yaml = key.endsWith('.yaml')
	key = key.slice(14, yaml ? -5 : -4)
	if (key.includes('/')) {
		key = key.split('/')[0]
	}
	const localeKey = key === '简体中文' ? 'zh-CN' : 'en'
	// @ts-ignore
	return { [localeKey]: value.default }
})

const messages = defu({}, ...languages)

export const i18n = createI18n({
	legacy: false,
	locale: 'zh-CN',
	fallbackLocale: 'en',
	messages,
})

export const t = i18n.global.t
export const locale = i18n.global.locale

export default i18n
