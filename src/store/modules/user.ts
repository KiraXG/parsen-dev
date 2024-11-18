import { defineStore } from 'pinia'

// 导入接口
import { userLogin } from '@/api/user'

// 导入定义的数据类型
import type { loginForm, companyType } from '@/api/user/type'
import type { userState } from './type'

// 引入操作本地存储工具的方法
import { SET_TOKEN, GET_TOKEN } from '@/utils/token.ts'
import { SET_USERINFO, GET_USERINFO } from '@/utils/userInfo.ts'

// 引入路由列表
import { constantRoutes } from '@/router/routes'

import { ElMessage } from 'element-plus'

const useUserStore = defineStore('User', {
    // 存储数据的地方
    state: (): userState => {
        return {
            token: GET_TOKEN(),
            userInfo: GET_USERINFO(),
            menuList: constantRoutes
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
            SET_TOKEN(res.access_token)
            SET_USERINFO(res.company as companyType)
        }
    },
    // 计算属性
    getters: {}
})

export default useUserStore
