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
</script>

<style lang="scss" scoped>
.layout-container {
    width: 100%;
    height: 100%;
    background-color: azure;
    .layout-main {
        width: 100%;
        height: calc(100% - 50px);
        display: flex;
    }
}
</style>
