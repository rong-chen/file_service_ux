import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),],
  server: {
    proxy: {
      // 将 /api 请求代理到目标服务器
      '/api': {
        target: 'http://127.0.0.1:8888', // 目标地址
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
})
