<template>
    <div class="main-container">
        <!-- 点击路由展示的内容 -->
        <router-view></router-view>
    </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.main-container {
    width: 100%;
    height: 100%;
    overflow: scroll;
    overflow-x: hidden;
}
</style>
