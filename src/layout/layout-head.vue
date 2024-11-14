<template>
    <div class="head-container">
        <div class="head-left">导航</div>
        <div class="head-right">用户信息</div>
    </div>
</template>

<script setup lang="ts"></script>

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
        padding: 20px;
    }
    .head-right {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }
}
</style>
