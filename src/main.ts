import { createApp } from 'vue'

/* -----引入插件----- */
// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入pinia
import pinia from './store'

// 引入axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// 引入路由器
import router from '@/router'

// svg插件所需要的配置代码
import 'virtual:svg-icons-register'

// 全局组件
import globalComponents from '@/components/index.ts'

// 引入样式
import '@/style/index.scss'
import App from '@/App.vue'

const app = createApp(App)

/* -----安装插件----- */
app.use(ElementPlus)
app.use(pinia)
app.use(VueAxios, axios)
app.use(router)
app.use(globalComponents)

app.mount('#app')
