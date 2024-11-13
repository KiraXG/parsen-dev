import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // src文件夹别名配置
    alias: {
      "@": path.resolve("./src")
    }
  }
})
