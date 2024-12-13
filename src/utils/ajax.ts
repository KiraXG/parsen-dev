// 进行axios的二次封装
import axios from 'axios'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import router from '@/router'

// 使用axios对象的create方法，创建axios实例
const ajax = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API, // 基础路径会带上/api
    timeout: 300000, // 超时时间设置
    headers: {
        Accept: '*/*',
        'Access-Control-Allow-Origin': '*'
    }
})

// request实例添加请求与响应拦截器
ajax.interceptors.request.use(
    (config: any) => {
        if (config.url === '/CompanyLogin') {
            config.headers['Content-Type'] = 'text/json;charset=UTF-8'
        } else {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
        }
        // 获取用户相关的小仓库:获取仓库内部token，登录成功以后携带给服务器
        const userStore = useUserStore()
        if (userStore.token) {
            config.headers.token = userStore.token
        }
        // config配置对象，headers属性请求头，经常给服务器端携带公共参数
        // 返回配置对象
        return config
    },
    (error: any) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
ajax.interceptors.response.use(
    (response: any) => {
        // 返回200也分正确和错误信息
        // result为1时正确，0为有错误参数
        if (response.data.result == '0') {
            if (response.data.err_msg.includes('重新登录')) router.replace('/login')
            // 出错时在提示并在控制台输出错误信息
            ElMessage.error(response.data.err_msg || '操作失败')
            console.error('Error:', response)
            return Promise.reject(response.data.err_msg)
        } else {
            return response.data
        }
        // 成功回调
    },
    (error: any) => {
        // 失败回调： 处理http网络错误
        // 定义一个变量：存储网络错误信息
        let message = ''
        let status = error.response ? error.response.status : 0
        // console.log(status)
        // 不同状态码返回不同的信息
        switch (status) {
            case 401:
                message = 'token已过期'
                break
            case 403:
                message = '无权访问'
                break
            case 404:
                message = '请求地址错误'
                break
            case 500:
                message = '服务器出现问题'
                break
            default:
                message = '网络出现问题'
                break
        }
        // 消息提示
        ElMessage.error(message)

        return Promise.reject(error)
    }
)

// 对外暴露
export default ajax
