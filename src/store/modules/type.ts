import type { companyType } from '@/api/user/type'
import type { RouteRecordRaw } from 'vue-router'
// userStore里state的数据类型
export interface userState {
    token: string
    userInfo: companyType
    menuList: RouteRecordRaw[]
}

// settingStore里state的数据类型
export interface settingState {
    isCollapse: boolean
}
