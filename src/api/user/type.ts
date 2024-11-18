// 登录接口发送的数据类型
export interface loginForm {
    account: string
    password: string
}

// ---------------------------------------------
// 登录接口返回的数据类型
export interface companyType {
    account?: string
    company_full_name?: string
    company_id?: string
    company_name?: string
    manage_company?: string
    manage_node?: string
    tel?: string
}

export interface loginResData {
    access_token: string
    result: string
    msg?: string
    company?: companyType
    err_msg?: string
}

// ---------------------------------------------
// 定义服务器返回的用户数据类型
interface userInfo {
    userId: string
    userRealName: string
    addr: string
    account: string
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
