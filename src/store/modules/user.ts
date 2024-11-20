import { defineStore } from 'pinia'

// 导入接口
import { userLogin } from '@/api/user'

// 导入定义的数据类型
import type { loginForm, companyType } from '@/api/user/type'
import type { userState } from './type'

// 引入路由列表
import { constantRoutes } from '@/router/routes'

import { ElMessage } from 'element-plus'

const useUserStore = defineStore('User', {
    // 存储数据的地方
    state: (): userState => {
        return {
            token: '', // 用户token
            userInfo: {}, // 当前用户信息
            menuList: constantRoutes, // 菜单列表
            activeMenu: '', //当前激活菜单的index
            editableTabsValue: '', //绑定值，选中选项卡的name
            editableTabs: [], //tab标签选项卡内容
            tabRouterList: [] //tab页路由地址及参数
        }
    },
    // 处理逻辑的地方
    actions: {
        // 用户登录的方法
        async userLoginFunc(data: loginForm) {
            const res = await userLogin(data)
            ElMessage.success('登录成功')
            // 存储用户的token
            this.token = res.access_token
            this.userInfo = res.company as companyType
        },
        /**
         * 修改state中数据的方法
         * @param name 需要修改的属性名
         * @param value 修改值
         */
        updateState([name, value]: [any, any]) {
            ;(this as any)[name] = value
        },
        // 动态添加tab标签,item为当前点击的菜单项
        addTab(item: any) {
            const newTab = {
                title: item.meta.title,
                name: item.path,
                iconClass: item.meta.icon
            }
            // 判断当前editableTabs中是否存在该tab标签
            if (this.editableTabs.findIndex((item: any) => item.title === newTab.title) === -1) {
                this.editableTabs.push(newTab)
                this.editableTabsValue = newTab.name
                this.activeMenu = newTab.name
            }
        },
        //移除tab标签
        removeTab(targetName: any) {
            let tabs = this.editableTabs
            let activeName = this.editableTabsValue
            if (activeName === targetName) {
                tabs.forEach((tab: any, index) => {
                    if (tab.name === targetName) {
                        let nextTab: any = tabs[index + 1] || tabs[index - 1]
                        if (nextTab) {
                            activeName = nextTab.name
                        }
                    }
                })
            }
            this.activeMenu = activeName
            this.editableTabsValue = activeName
            this.editableTabs = tabs.filter((tab: any) => tab.name !== targetName)
            this.tabRouterList = this.tabRouterList.filter((item: any) => item.path !== targetName)
        },
        // 清空store
        resetStore() {
            this.$reset()
        }
    },
    // 使用persist插件对state里面属性进行缓存
    persist: {
        storage: sessionStorage // 设值存储方式，默认localStorage
        // paths: ['activeMenu', 'editableTabsValue', 'editableTabs', 'tabRouterList'] // 不生效
    },
    // 计算属性
    getters: {}
})

export default useUserStore
