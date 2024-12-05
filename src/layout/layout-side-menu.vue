<template>
    <template v-for="item in menuList">
        <!-- 没有子级菜单 -->
        <el-menu-item v-if="!item.children" :index="item.path" @click="userStore.addTab(item)">
            <!-- 图标 -->
            <el-icon>
                <component :is="item.meta.icon" />
            </el-icon>
            <template #title>
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
            <template v-for="cItem in item.children">
                <el-menu-item
                    v-if="cItem.meta.show"
                    :index="cItem.path"
                    @click="userStore.addTab(cItem)"
                >
                    <template #title>{{ cItem.meta.title }}</template>
                </el-menu-item>
            </template>
        </el-sub-menu>
    </template>
</template>

<script setup lang="ts">
import useUserStore from '@/store/modules/user'
defineProps({
    menuList: {
        type: Array as any,
        default: []
    }
})
const userStore: any = useUserStore()
</script>

<style lang="scss" scoped></style>
