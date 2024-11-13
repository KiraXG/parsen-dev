import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command }) => {  // command用于获取当前开发环境
  return {
    plugins: [vue(),
    // svg插件配置
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    }),
    // mock接口配置
    viteMockServe({
      mockPath: 'mock', // mock文件夹路径
      enable: command === 'serve' // 只有开发环境才开启mock
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
  }
})
