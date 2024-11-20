<template>
    <div class="side-container">
        <div class="menu-collapse">
            <el-tooltip class="box-item" effect="dark" :content="content" placement="right"
                ><el-icon @click="menuCol"><component :is="menuIcon" /></el-icon
            ></el-tooltip>
        </div>
        <el-scrollbar class="side-menu" :style="{ width: isCollapse ? '64px' : '200px' }">
            <!-- router:
                是否启用 vue-router 模式;
                启用该模式会在激活导航时以 index 作为 path 进行路由跳转;
                使用 default-active 来设置加载时的激活项 -->
            <el-menu
                router
                @select="handleSelect"
                :collapse="isCollapse"
                :default-active="userStore.activeMenu"
                background-color="rgb(79, 165, 250)"
                text-color="#fff"
                active-text-color="#313131"
            >
                <Menu :menuList="menuList"></Menu>
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import Menu from './layout-side-menu.vue'

import useUserStore from '@/store/modules/user'

import { storeToRefs } from 'pinia'
import useSettingStore from '@/store/modules/setting'

const userStore: any = useUserStore()

// 过滤菜单
const menuList = userStore.menuList.filter((item: any) => item.name === 'layout')[0]?.children

// 获取仓库里存储的数据
const settingStore = useSettingStore()
const { isCollapse, menuIcon, content } = storeToRefs(settingStore)
const menuCol = () => {
    settingStore.menuCol()
}

// 点击更新选中的tab和menu
function handleSelect(key: any) {
    userStore.updateState(['editableTabsValue', key])
    userStore.updateState(['activeMenu', key])
}
</script>

<style lang="scss" scoped>
.side-container {
    height: 100%;
    background-color: rgb(79, 165, 250);
    .menu-collapse {
        height: 28px;
        padding: 12px 0 0 22px;
        font-size: 22px;
        color: #fff;
        cursor: pointer;
    }
    .menu-collapse:hover {
        color: #313131;
    }
    .side-menu {
        height: calc(100% - 90px);
    }
}
</style>
