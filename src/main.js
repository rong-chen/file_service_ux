import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from "pinia";
import 'element-plus/dist/index.css'
import {router} from "@/router/index.js";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/theme-chalk/dark/css-vars.css'
// 引入阿里图标库
import "@/assets/font/iconfont.css"

const pinia = createPinia()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
window.addEventListener("unhandledrejection", (event) => {
    console.error("未处理的 Promise 错误：", event.reason);
});
app.use(pinia)
app.use(ElementPlus,{
    locale: zhCn,
})
app.use(router)
app.mount('#app')
