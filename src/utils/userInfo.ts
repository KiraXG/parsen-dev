import type { companyType } from '@/api/user/type'
// 存储userToken
export const SET_USERINFO = (userInfo: companyType) => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

// 获取userToken
export const GET_USERINFO = () => {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
}
