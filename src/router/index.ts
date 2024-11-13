// 引入createRouter
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
// 创建路由器
const router = createRouter({
    history: createWebHistory(), // history模式
    routes: [...constantRoutes],
    // 滚动行为
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            // savedPosition 会在你使用浏览器前进或后退按钮时候生效
            // savedPosition: 会记录滚动条的坐标，点击"后退/前进" 时的记录值(x:?,y:?)
            return savedPosition
        } else {
            return {
                left: 0,
                top: 0
            }
        }
    }
})

export default router
