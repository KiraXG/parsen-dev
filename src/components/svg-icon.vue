<template>
    <svg :style="{ width, height }">
        <use :xlink:href="prefix + name" :fill="fill"></use>
    </svg>
</template>

<script setup lang="ts">
defineProps({
    // icon前缀
    prefix: {
        type: String,
        default: '#icon-'
    },
    // 名称
    name: {
        type: String,
        default: ''
    },
    // 填充颜色
    fill: {
        type: String,
        default: 'red'
    },
    // 高度
    width: {
        type: String,
        default: '24px'
    },
    // 宽度
    height: {
        type: String,
        default: '24px'
    }
})
</script>

<style lang="scss" scoped></style>
