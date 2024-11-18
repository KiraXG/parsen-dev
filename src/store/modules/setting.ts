import { defineStore } from 'pinia'
import type { settingState } from './type'

const useSettingStore = defineStore('Setting', {
    state: (): settingState => {
        return {
            isCollapse: false // 菜单是否收起
        }
    },
    actions: {
        menuCol() {
            this.isCollapse = !this.isCollapse
        }
    },
    getters: {
        menuIcon(state) {
            // 菜单图标
            return state.isCollapse ? 'Fold' : 'Expand'
        },
        content(state) {
            // 按钮提示
            return state.isCollapse ? '展开菜单' : '收起菜单'
        }
    }
})

export default useSettingStore
