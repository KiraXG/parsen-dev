<template>
    <div class="side-container">
        <!-- 顶部图标及名称 -->
        <div class="side-head">
            <img src="@/assets/images/ps.png" width="20px" alt="" />
            <div class="side-head-title">远程监控系统</div>
        </div>
        <el-scrollbar class="side-menu">
            <!-- 
                router:
                    是否启用 vue-router 模式;
                    启用该模式会在激活导航时以 index 作为 path 进行路由跳转;
                    使用 default-active 来设置加载时的激活项
            -->
            <el-menu
                router
                default-active="/home"
                background-color="rgb(79, 165, 250)"
                text-color="#fff"
                active-text-color="#313131"
            >
                <LayoutSideMenu :menuList="menuList"></LayoutSideMenu>
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script setup lang="ts">
import LayoutSideMenu from './layout-side-menu.vue'
import useUserStore from '@/store/modules/user'
// 过滤菜单
let menuList = useUserStore().menuList.filter((item) => item.name === 'layout')[0]?.children
console.log(menuList)
</script>

<style lang="scss" scoped>
.side-container {
    width: 250px;
    height: 100%;
    background-color: rgb(79, 165, 250);
    .side-head {
        width: 100%;
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
    .side-menu {
        height: calc(100% - 50px);
    }
}
</style>
