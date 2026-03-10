import { createApp } from 'vue'

// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css' // unocss reset
import 'virtual:uno.css'
import 'virtual:unocss-devtools'

import i18n from './plugins/i18n'

import './styles/main.css'

import App from './App.vue'

const app = createApp(App)

app.use(i18n)

app.mount('#app')
