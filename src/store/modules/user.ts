import { defineStore } from 'pinia'

let useUserStore = defineStore('User', {
    // 存储数据的地方
    state: () => {
        return {
            token: ''
        }
    },
    // 处理逻辑的地方
    actions: {},
    // 计算属性
    getters: {}
})

export default useUserStore
