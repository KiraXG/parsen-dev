// 引入仓库
import { createPinia } from 'pinia'
// pinia持久化存储插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 创建仓库
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

export default pinia
