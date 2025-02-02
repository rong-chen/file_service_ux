import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
// https://vite.dev/config/
export default defineConfig(({mode})=>{
 const env = loadEnv(mode, process.cwd());
 return {
   plugins: [vue(),],
   server: {
     proxy: {
       // 将 /api 请求代理到目标服务器
       [env.VITE_BASE_API]: {
         target: `${env.VITE_BASE_PATH}:${env.VITE_SERVER_PORT}`, // 目标地址
         changeOrigin: true,          // 修改请求头中的 Origin
         rewrite: (path) => path.replace(/^\/api/, ''), // 可选，重写路径
       },
     },
   },
   resolve: {
     alias: {
       '@': path.resolve(__dirname, 'src'), // 设置 @ 指向 src 目录
     },
   },
 }
})
