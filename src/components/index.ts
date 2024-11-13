// 引入组件
import SvgIcon from './svg-icon.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 整合到一个对象中
const allGlobalComponents = {
    SvgIcon
}

// 对外暴露插件对象
export default {
    install(app) {
        // 自定义组件
        Object.keys(allGlobalComponents).forEach((key) => {
            app.component(key, allGlobalComponents[key])
        })
        // element-icon
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component)
        }
    }
}
