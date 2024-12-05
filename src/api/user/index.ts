import ajax from '@/utils/ajax'
import type { loginForm, loginResData } from './type'

// 登录
export const userLogin = (params: loginForm) =>
    ajax.post<any, loginResData>('/CompanyLogin', params)
