<template>
    <div class="layout-container">
        <!-- 左侧菜单栏 -->
        <div class="layout-left">
            <layout-side></layout-side>
        </div>
        <!-- 右侧内容展示区 -->
        <div class="layout-right">
            <layout-head></layout-head>
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
    display: flex;
    .layout-right {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
}
</style>
