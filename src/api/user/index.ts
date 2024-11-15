import ajax from '@/utils/ajax'
import type { loginForm, loginResData, userResData } from './type'

enum API {
    LOGIN_URL = '/user/login',
    USERINFO_URL = '/user/info'
}

// 登录
export const userLogin = (params: loginForm) =>
    ajax.post<any, loginResData>('/CompanyLogin', params)

// 获取用户信息
export const userInfo = () => ajax.get<any, userResData>(API.USERINFO_URL)
