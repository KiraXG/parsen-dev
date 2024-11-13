// 登录接口发送的数据类型
export interface loginForm {
    username: string
    password: string
}

// ---------------------------------------------
// 登录接口返回的数据类型
interface dataType {
    message?: string
    token?: string
}

export interface loginResData {
    code: number
    data: dataType
}

// ---------------------------------------------
// 定义服务器返回的用户数据类型
interface userInfo {
    userId: string
    userRealName: string
    addr: string
    username: string
    password: string
    token: string
    roles: string[]
}

interface user {
    checkUser: userInfo
}

export interface userResData {
    code: number
    data: user
}
