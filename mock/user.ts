function createUserList() {
    return [
        {
            userId: '123',
            userRealName: '好好好',
            addr: 'USA',
            username: 'trump',
            password: '911',
            token: '20241106',
            roles: ['平台管理员']
        },
        {
            userId: '456',
            userRealName: '坏坏坏',
            addr: 'CN',
            username: 'JinPing',
            password: '13',
            token: '2592',
            roles: ['平台管理员']
        }
    ]
}

export default [
    {
        url: '/api/user/login',
        method: 'post',
        response: ({ body }) => {
            const { username, password } = body
            const checkUser = createUserList().find(item => item.username === username && item.password === password)
            if (!checkUser) {
                return {
                    code: 201,
                    data: {
                        message: 'zz不正确'
                    }
                }
            }
            const { token } = checkUser
            return {
                code: 200, data: { token }
            }
        }
    },
    {
        url: '/api/user/info',
        method: 'get',
        response: (request) => {
            const token = request.headers.token
            const checkUser = createUserList().find(item => item.token === token)
            if (!checkUser) {
                return {
                    code: 201,
                    data: {
                        message: 'no no no'
                    }
                }
            }
            return {
                code: 200, data: { checkUser }
            }
        }
    },
]