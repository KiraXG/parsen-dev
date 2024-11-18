<template>
    <div class="head-container">
        <div class="head-left">
            <!-- 顶部图标及名称 -->
            <div class="left-title">
                <img src="@/assets/images/ps.png" width="20px" alt="" />
                <div class="side-head-title">远程监控系统</div>
            </div>
            <div>导航</div>
        </div>
        <div class="head-right">
            <div class="right-userInfo">您好，{{ userInfo.company_full_name }}</div>
            <el-button type="primary" icon="SwitchButton" circle @click="logout" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import useUserStore from '@/store/modules/user'
import { useRouter } from 'vue-router'

// 通过toRef将person对象中的gender属性取出，且依然保持响应式的能力
const userInfo: any = toRef(useUserStore(), 'userInfo')

// 退出登录
const $router = useRouter()
const logout = () => {
    $router.push('/login')
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
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #409eff;
            img {
                padding-right: 10px;
            }
            .side-head-title {
                font-size: 18px;
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
