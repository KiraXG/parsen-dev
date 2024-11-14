import type { RouteRecordRaw } from 'vue-router'
// uerStore里state的数据类型
export interface userState {
    token: string | null
    menuList: RouteRecordRaw[]
}
