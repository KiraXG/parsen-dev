// 存储userToken
export const SET_TOKEN = (token: string) => {
    localStorage.setItem('userToken', token)
}

// 获取userToken
export const GET_TOKEN = () => {
    return localStorage.getItem('userToken')
}
