<template>
    <template v-for="(item, index) in menuList">
        <!-- 没有子级菜单 -->
        <el-menu-item v-if="!item.children" :index="item.path">
            <template #title>
                <!-- 图标 -->
                <el-icon>
                    <component :is="item.meta.icon" />
                </el-icon>
                <!-- 菜单名称 -->
                <span>{{ item.meta.title }}</span>
            </template>
        </el-menu-item>
        <!-- 有子级菜单 -->
        <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
            <template #title>
                <el-icon>
                    <component :is="item.meta.icon" />
                </el-icon>
                <span>{{ item.meta.title }}</span>
            </template>
            <el-menu-item
                v-for="(cItem, cIndex) in item.children"
                :index="cItem.path"
                style="background-color: rgb(102.2, 177.4, 255)"
            >
                <template #title>{{ cItem.meta.title }}</template>
            </el-menu-item>
        </el-sub-menu>
    </template>
</template>

<script setup lang="ts">
defineProps({
    menuList: {
        type: Array,
        default: []
    }
})
</script>

<style lang="scss" scoped></style>
