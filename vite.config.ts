import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [vue(),
  // svg插件配置
  createSvgIconsPlugin({
    iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
    symbolId: 'icon-[dir]-[name]'
  })
  ],
  resolve: {
    // src文件夹别名配置
    alias: {
      "@": path.resolve("./src")
    }
  },
  css: {
    preprocessorOptions: {
      // scss全局变量的配置
      scss: {
        javascriptEnabled: true,
        additionalData: '@import "./src/style/variable.scss";'
      }
    }
  }
})
