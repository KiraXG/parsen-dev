<template>
    <div class="head-container">
        <div class="head-left">
            <!-- 顶部图标及名称 -->
            <div class="left-title">
                <!-- <img src="@/assets/images/ps.png" width="20px" alt="" /> -->
                <div class="side-head-title">远程监控系统</div>
            </div>
            <el-breadcrumb separator-icon="ArrowRight">
                <!-- 在 el-breadcrumb-item 上添加 :to="item.path" 属性可以实现点击面包屑跳转页面 -->
                <el-breadcrumb-item v-for="(item, index) in $route.matched.slice(1)" :key="index">
                    <el-icon v-if="item.meta.icon">
                        <component :is="item.meta.icon"></component>
                    </el-icon>
                    <span>{{ item.meta.title }}</span>
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <!-- 登录后打招呼 -->
        <div class="head-right">
            <div class="right-userInfo">您好，{{ userInfo.company_full_name }}</div>
            <el-button type="primary" icon="SwitchButton" circle @click="logout" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'

const $route: any = useRoute()
const $router: any = useRouter()

// 通过toRef将person对象中的gender属性取出，且依然保持响应式的能力
const userInfo: any = toRef(useUserStore(), 'userInfo')

// 退出登录
const logout = () => {
    $router.push('/login')
    // 清空store存储
    useUserStore().resetStore()
    setTimeout(() => {
        // 清空本地和会话存储
        localStorage.clear()
        sessionStorage.clear()
    })
}
</script>

<style lang="scss" scoped>
.head-container {
    width: 100%;
    height: 50px;
    background-color: #409eff;
    display: flex;
    justify-content: space-between;
    .head-left {
        display: flex;
        justify-content: center;
        align-items: center;
        .left-title {
            width: 200px;
            height: 50px;
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                padding-right: 10px;
            }
            .side-head-title {
                font-size: 16px;
                color: rgb(255, 255, 255);
                font-weight: 400;
            }
        }
    }
    .head-right {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        .right-userInfo {
            color: #fff;
            padding-right: 10px;
        }
    }
}
</style>
