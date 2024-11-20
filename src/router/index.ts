// 引入createRouter
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoutes } from './routes'
import useUserStore from '@/store/modules/user'

const scrollRouter: any = {}
// 创建路由器
const router = createRouter({
    history: createWebHistory(), // history模式
    routes: [...constantRoutes],
    // 滚动行为
    scrollBehavior(to, from, savedPosition) {
        let el = document.querySelector('.container') as any
        // 记录跳转前的滚动条高度
        scrollRouter[from.path] = el.scrollTop || 0
        // console.log('*************');
        // console.log('to:---', to.path, ': ', scrollRouter[to.path]);
        // console.log('from:---', from.path, ': ', scrollRouter[from.path]);
        // console.log('scrollRouter: ', scrollRouter);
        if (el) {
            // 跳转过去之后把跳转前的滚动条高度赋给当前页面
            el.scrollTop = scrollRouter[to.path]
        }
    }
})

// 黑名单
const blackList = ['/404', '/login', '/layout']

const handleToParams = (to: any) => {
    const route = {
        fullPath: to.fullPath,
        meta: to.meta,
        name: to.name,
        params: to.params,
        path: to.path,
        query: to.query
    }
    return route
}

function handleRouteInEditableTabs(to: any, store: any) {
    //判断当前路由的标题是否已经在editableTabs里,如果不在则动态添加tab页
    const indexInEditableTabs = store.editableTabs.findIndex(
        (item: any) => item.title === to.meta.title
    )
    //当前路由的标题已经在editableTabs里
    if (indexInEditableTabs !== -1) {
        //判断tabRouterList是否已经存在相同的路由
        const indexInTabRouterList = store.tabRouterList.findIndex(
            (item: any) => item.name === to.name
        )
        //当前路由的name已经在tabRouterList里面
        if (indexInTabRouterList !== -1) {
            //根据当前路由名称找到对应的历史路由
            let result = store.tabRouterList.find((item: any) => item.name === to.name)
            //在name相同但是路由的query参数不一样,则替换为这个最新的(将对象转为string字符串比较,即可判断2个对象属性与值是否完全一样)
            let queryMatched = JSON.stringify(result.query) === JSON.stringify(to.query)
            //如果为false,则替换当前路由参数
            if (!queryMatched) {
                //若存在，则从原始数组中移除该对象
                store.tabRouterList = store.tabRouterList.filter(
                    (item: any) => item.name !== to.name
                )
                //重新添加这个新路由
                store.tabRouterList.push(handleToParams(to))
            }
        } else {
            //点击菜单栏时,如果不在则添加该路由
            store.tabRouterList.push(handleToParams(to))
        }
    } else {
        //判断该路由是否在黑名单里面,不在则动态添加tab页
        if (!blackList.includes(to.path)) {
            //如果不在editableTabs里面,那么就在editableTabs里面添加这个tab页
            store.editableTabs.push({
                title: to.meta.title,
                name: to.path,
                iconClass: to.meta.icon
            })
            //点击页面中的某个按钮进行页面跳转的时候,如果不在则添加该路由里面部分字段
            store.tabRouterList.push(handleToParams(to))
        }
    }
}

//路由前置守卫
router.beforeEach((to, from, next) => {
    // console.log(scrollRouter);
    //如果没有匹配到路由,则跳转到404页面F
    if (to.matched.length === 0) {
        next('/404')
    } else {
        //使用pinia里面的全局状态属性
        const store: any = useUserStore()
        //更改tab标签绑定值，选中选项卡的name
        store.updateState(['editableTabsValue', to.path])
        //更改当前激活的菜单
        store.updateState(['activeMenu', to.path])
        //动态添加tab页及tab页切换时参数也跟着切换
        handleRouteInEditableTabs(to, store)
        next()
    }
})

export default router
