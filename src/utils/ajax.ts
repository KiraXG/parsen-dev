// 进行axios的二次封装
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 使用axios对象的create方法，创建axios实例
let ajax = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API, // 基础路径会带上/api
    timeout: 5000 // 超时时间设置
})

// request实例添加请求与响应拦截器
ajax.interceptors.request.use(
    (config: any) => {
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
        ElMessage.success('yes')
        // 成功回调
        return response.data
    },
    (error: any) => {
        // 失败回调： 处理http网络错误
        // 定义一个变量：存储网络错误信息
        let message = ''
        let status = error.response.status
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
        ElMessage({
            type: 'error',
            message
        })

        return Promise.reject(error)
    }
)

// 对外暴露
export default ajax
