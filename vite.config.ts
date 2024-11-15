import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig(({ command }): any => {  // command用于获取当前开发环境
  return {
    publicPath: '/', //这个路径根据自己的情况定，默认就填"/"
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
    server: {
      host: '0.0.0.0', // 指定服务器应该监听哪个IP地址。如果将此设置为 0.0.0.0 将监听所有地址，包括局域网和公网地址。
      port: '8080', // 指定开发服务器端口。如果端口已经被使用，Vite 会自动尝试下一个可用的端口，所以这可能不是开发服务器最终监听的实际端口。
      // 为开发服务器配置自定义代理规则
      proxy: {
        '/ParsenHttpApiV030': {
          target: 'https://47.107.142.55:443', //目标服务器地址
          changeOrigin: true, // 更换地址
          secure: false // 安全验证
          // rewrite: (path: string) => path.replace(/^\/fallback/, '') // 重写目标地址
        }
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
