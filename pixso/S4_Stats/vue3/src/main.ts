import './assets/styles/font.css';
import './assets/styles/global.css'
import { createApp } from 'vue'
import './styles.css'
import './assets/styles/font.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')


declare global {
  interface Window {
    app: any;
  }
}
