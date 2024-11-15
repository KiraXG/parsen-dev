import { defineStore } from 'pinia'

// 导入接口
import { userLogin } from '@/api/user'

// 导入定义的数据类型
import type { loginForm } from '@/api/user/type'
import type { userState } from './type'

// 引入操作本地存储工具的方法
import { SET_TOKEN, GET_TOKEN } from '@/utils/token.ts'

// 引入路由列表
import { constantRoutes } from '@/router/routes'

let useUserStore = defineStore('User', {
    // 存储数据的地方
    state: (): userState => {
        return {
            token: GET_TOKEN(),
            menuList: constantRoutes
        }
    },
    // 处理逻辑的地方
    actions: {
        // 用户登录的方法
        async userLoginFunc(data: loginForm) {
            let res = await userLogin(data)
            // 存储用户的token
            this.token = res.access_token
            SET_TOKEN(res.access_token)
        }
    },
    // 计算属性
    getters: {}
})

export default useUserStore
