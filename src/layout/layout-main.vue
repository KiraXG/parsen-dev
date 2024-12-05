<template>
    <div class="main-container">
        <!-- 顶部nav导航页 -->
        <layout-nav></layout-nav>
        <div class="container">
            <!-- vue3.0 路由视图配置 -->
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import LayoutNav from './layout-nav.vue'
</script>

<style lang="scss" scoped>
.main-container {
    width: 100%;
    height: calc(100% - 20px); // 减去上下外边距
    margin: 10px;
    overflow: auto;
    box-sizing: border-box;
    border-radius: 4px;
    box-shadow:
        0 2px 4px 0 rgba(0, 0, 0, 0.12),
        0 0 6px 0 rgba(0, 0, 0, 0.04);
    .container {
        width: 100%;
        height: calc(100% - 40px); // 减去layout-nav(40px)
        padding: 5px;
        border: 1px solid #e0e0e0;
        border-top: none;
        overflow: hidden;
        box-sizing: border-box;
    }
}
</style>
