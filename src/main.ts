import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './styles/main.scss'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const toastOptions = {
  timeout: 3000,
  position: 'top-right' as const,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)
app.mount('#app')
