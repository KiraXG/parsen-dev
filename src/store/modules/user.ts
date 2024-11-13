import { defineStore } from 'pinia'

// 导入接口
import { userLogin } from '@/api/user'

// 导入定义的数据类型
import type { loginForm } from '@/api/user/type'
import type { userState } from './type'

// 引入操作本地存储工具的方法
import { SET_TOKEN, GET_TOKEN } from '@/utils/token.ts'

let useUserStore = defineStore('User', {
    // 存储数据的地方
    state: (): userState => {
        return {
            token: GET_TOKEN()
        }
    },
    // 处理逻辑的地方
    actions: {
        // 用户登录的方法
        async userLoginFunc(data: loginForm) {
            let result = await userLogin(data)
            if (result.code == 200) {
                // 存储用户的token
                this.token = result.data.token as string
                SET_TOKEN(result.data.token as string)
                return '登陆成功!'
            } else {
                return Promise.reject(new Error(result.data.message))
            }
        }
    },
    // 计算属性
    getters: {}
})

export default useUserStore
