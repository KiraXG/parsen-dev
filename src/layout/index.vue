<template>
    <div class="layout-container">
        <!-- 顶部 -->
        <layout-head></layout-head>
        <div class="layout-main">
            <!-- 左侧菜单栏 -->
            <layout-side></layout-side>
            <!-- 右侧内容展示区 -->
            <layout-main></layout-main>
        </div>
    </div>
</template>

<script setup lang="ts">
import LayoutHead from './layout-head.vue'
import LayoutSide from './layout-side.vue'
import LayoutMain from './layout-main.vue'
import useCompanyTreeStore from '@/store/modules/company-tree'

// 加载树数据
const companyTreeStore = useCompanyTreeStore()
const initTreeData = () => {
    companyTreeStore.getTreeData()
}
initTreeData()
</script>

<style lang="scss" scoped>
.layout-container {
    width: 100%;
    height: 100%;
    .layout-main {
        width: 100%;
        height: calc(100% - 50px); // 减去layout-head(50px)高度
        display: flex;
        overflow: auto;
    }
}
</style>
