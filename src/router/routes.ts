export const constantRoutes = [
    {
        // 未输入路径名重定向至login页面
        path: '/',
        name: 'defaultPage',
        redirect: '/login'
    },
    {
        // 未匹配到任何路由跳转到404页面
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        name: 'Any'
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/index.vue'), // 组件按需加载
        meta: {
            keepAlive: true // 需要缓存
        }
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/404/index.vue'),
        meta: {
            keepAlive: false // 不需要缓存
        }
    },
    {
        path: '/home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
            keepAlive: true
        }
    }
]
