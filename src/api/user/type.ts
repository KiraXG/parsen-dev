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
