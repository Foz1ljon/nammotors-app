import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'ant-design-vue/dist/reset.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { useThemeStore } from './stores/theme'
import { useInstallPromptStore } from './stores/installPrompt'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Apply the persisted/system theme before the first paint.
useThemeStore(pinia)
useInstallPromptStore(pinia).init()

app.mount('#app')

router.isReady().then(() => {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('splash-hide')
  setTimeout(() => splash.remove(), 400)
})
