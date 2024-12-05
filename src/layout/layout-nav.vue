<!--通用布局头部内容-->
<template>
    <el-tabs
        v-model="userStore.editableTabsValue"
        type="border-card"
        closable
        @tab-remove="handleTabRemove"
        @tab-click="handleTabClick"
        v-if="userStore.editableTabs.length !== 0"
    >
        <el-tab-pane
            v-for="item in userStore.editableTabs"
            :key="item.name"
            :name="item.name"
            :label="item.title"
        >
            <!-- 右键菜单开始：自定义标签页显示名称，保证每个标签页都能实现右键菜单 -->
            <template #label>
                <el-dropdown
                    trigger="contextmenu"
                    :id="item.name"
                    @visible-change="handleChange($event, item.name)"
                    ref="dropdownRef"
                >
                    <span
                        class="tab-title"
                        :class="userStore.editableTabsValue === item.name ? 'label' : ''"
                    >
                        {{ item.title }}
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item
                                @click="closeCurrent(item.name)"
                                v-if="showCur(item.name)"
                            >
                                <el-icon> <Close /> </el-icon>关闭当前标签页
                            </el-dropdown-item>
                            <el-dropdown-item
                                @click="closeLeft(item.name)"
                                v-if="showLeft(item.name)"
                            >
                                <el-icon> <DArrowLeft /> </el-icon>关闭左侧标签页
                            </el-dropdown-item>
                            <el-dropdown-item
                                v-if="showRight(item.name)"
                                @click="closeRight(item.name)"
                            >
                                <el-icon> <DArrowRight /> </el-icon>关闭右侧标签页
                            </el-dropdown-item>
                            <el-dropdown-item
                                @click="closeOther(item.name)"
                                v-if="userStore.editableTabs.length > 1"
                            >
                                <el-icon> <Operation /> </el-icon>关闭其他标签页
                            </el-dropdown-item>
                            <el-dropdown-item @click="closeAll()">
                                <el-icon> <Minus /> </el-icon>关闭全部标签页
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
            <!-- 右键菜单结束 -->
            <!-- 点击路由展示的内容 -->
        </el-tab-pane>
    </el-tabs>
</template>

<script setup lang="ts">
// 引入全局状态里面的关于菜单栏列表数据和相关方法
import useUserStore from '@/store/modules/user'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const userStore: any = useUserStore()
const router = useRouter()
const route = useRoute()

// 首页过滤
const editableHome = userStore.editableTabs.filter((item: any) => item.name === '/home')
const tabHome = userStore.tabRouterList.filter((item: any) => item.path === '/home')

// 触发右键菜单标签页为首页时，不展示【关闭当前标签页】
const showCur = (name: any) => {
    return name === '/home' ? false : true
}
// 触发右键菜单标签页为第二个时（首页不可关闭），不展示【关闭左侧标签页】
const showLeft = (name: any) => {
    const index = userStore.editableTabs.findIndex((item: any) => name === item.name)
    return index > 1
}

// 触发右键菜单标签页为最后一个时，不展示【关闭右侧标签页】
const showRight = (name: any) => {
    const index = userStore.editableTabs.findIndex((item: any) => name === item.name)
    return index !== userStore.editableTabs.length - 1
}

// 右键菜单ref
const dropdownRef = ref()

// 在触发右键菜单后，关闭其他tab页上的右键菜单
const handleChange = (visible: any, name: any) => {
    if (!visible) return
    dropdownRef.value.forEach((item: any) => {
        if (item.id === name) return
        item.handleClose()
    })
}

// 关闭当前tab页
const closeCurrent = (targetName: any) => {
    handleTabRemove(targetName)
}

// 关闭左侧tab页
const closeLeft = (targetName: any) => {
    // 查找当前点击的tab页所在位置
    let currentIndex = userStore.editableTabs.findIndex((item: any) => item.name === targetName)
    // 查找当前激活标签页index
    const activeIndex = userStore.editableTabs.findIndex(
        (item: any) => item.name === userStore.editableTabsValue
    )
    // 关闭左侧tab页
    const rightEditableTabs = userStore.editableTabs.slice(currentIndex)
    userStore.editableTabs = [editableHome[0], ...rightEditableTabs]
    // 删除对应的左侧历史路由
    const rightTabs = userStore.editableTabs.slice(currentIndex)
    userStore.tabRouterList = [tabHome[0], ...rightTabs]
    // 如果当前关闭点击的tab页包含激活的tab页,则将激活tab页重置为当前点击的tab
    if (activeIndex < currentIndex) {
        // 将当前激活的tab页改为当前点击的
        userStore.updateState(['editableTabsValue', targetName])
        // 将激活菜单改为当前点击的
        userStore.updateState(['activeMenu', targetName])
        // 路由跳转到当前点击的tab页
        // 查询当前点击的tab页缓存路由参数
        let result: any = userStore.tabRouterList.find((item: any) => item.path === targetName)
        // 路由跳转且带上对应tab页的参数
        router.push({ path: targetName, query: result?.query })
    }
}

// 关闭右侧tab页
const closeRight = (targetName: any) => {
    // 查找当前点击的tab页所在位置
    let currentIndex = userStore.editableTabs.findIndex((item: any) => item.name === targetName)
    const activeIndex = userStore.editableTabs.findIndex(
        (item: any) => item.name === userStore.editableTabsValue
    )
    // 关闭右侧tab页
    userStore.editableTabs.splice(currentIndex + 1)
    // 删除对应的右侧历史路由
    userStore.tabRouterList.splice(currentIndex + 1)
    // 如果当前关闭点击的tab页包含激活的tab页,则将激活tab页重置为当前点击的tab
    if (activeIndex > currentIndex) {
        userStore.updateState(['editableTabsValue', targetName])
        userStore.updateState(['activeMenu', targetName])
        let result: any = userStore.tabRouterList.find((item: any) => item.path === targetName)
        router.push({ path: targetName, query: result?.query })
    }
}

// 关闭其他tab页
const closeOther = (targetName: any) => {
    // 查找当前点击的tab页所在位置
    let currentIndex = userStore.editableTabs.findIndex((item: any) => item.name === targetName)
    // 关闭其他标签页
    userStore.editableTabs =
        currentIndex !== 0
            ? [editableHome[0], userStore.editableTabs[currentIndex]]
            : [...editableHome]
    // 删除除当前点击外的历史路由
    userStore.tabRouterList =
        currentIndex !== 0 ? [tabHome[0], userStore.tabRouterList[currentIndex]] : [...tabHome]
    // 如果当前点击的不等于当前激活的
    if (targetName !== userStore.editableTabsValue) {
        userStore.updateState(['editableTabsValue', targetName])
        userStore.updateState(['activeMenu', targetName])
        let result: any = userStore.tabRouterList.find((item: any) => item.path === targetName)
        router.push({ path: targetName, query: result?.query })
    }
}

// 关闭全部tab页
const closeAll = () => {
    // 只留首页
    userStore.editableTabs = [...editableHome]
    userStore.tabRouterList = [...tabHome]
    userStore.updateState(['editableTabsValue', '/home'])
    userStore.updateState(['activeMenu', '/home'])
    router.push('/home')
}

// 处理tab标签x按钮的移除
function handleTabRemove(targetName: any) {
    // 如果editableTabs列表不为空数组
    if (userStore.editableTabs.length > 0) {
        // 如果当前所在的tab页路由地址与移除的tab页名一样,则移到前面一个tab页且路由跳转
        if (route.path === targetName) {
            let tabs: any = userStore.editableTabs
            tabs.forEach((tab: any, index: any) => {
                if (tab.name === targetName) {
                    // 获取当前tab的后一个或者前一个
                    let nextTab = tabs[index + 1] || tabs[index - 1]
                    // 如果有值就移到它上面，没有就是最后一个跳转到首页
                    if (nextTab) {
                        // 根据name属性进行查询当前tab页的缓存路由参数
                        let result: any = userStore.tabRouterList.find(
                            (item: any) => item.path === nextTab.name
                        )
                        // 路由跳转且带上对应tab页的参数
                        router.push({ path: nextTab.name, query: result?.query })
                    } else {
                        // 更改tab标签绑定值，选中选项卡的name
                        userStore.updateState(['editableTabsValue', '/home'])
                        // 更改当前激活的菜单
                        userStore.updateState(['activeMenu', '/home'])
                        // 当删除的是最后一个tab页的时候,跳转到首页
                        router.push('/home')
                    }
                }
            })
            // 从editableTabs中移除当前tab标签
            userStore.removeTab(targetName)
        } else {
            userStore.removeTab(targetName)
        }
    }
}

// tab标签被选中时触发的事件
function handleTabClick(tab: any) {
    userStore.updateState(['activeMenu', tab.props.name])
    userStore.updateState(['editableTabsValue', tab.props.name])
    // 判断当前url地址和即将跳转的是否一致，不一致进行跳转，防止跳转多次
    if (tab.props.name !== route.path) {
        // 根据name属性进行查询
        let result: any = userStore.tabRouterList.find((item: any) => item.path === tab.props.name)
        // 路由跳转且带上对应tab页的参数
        router.push({ path: tab.props.name, query: result?.query })
    }
}
</script>

<style lang="scss" scoped>
.tab-title {
    color: #909399;
}
.tab-title:hover {
    color: #409eff;
}
// tab标签页里面字体设置
.label {
    color: #409eff; // 激活标签页高亮
}

::v-deep(.el-tabs) {
    width: 100%;
}

::v-deep(.el-tabs__content) {
    height: 0;
    padding: 0;
}

::v-deep(.el-tabs__header) {
    background: #f8f8f8;
    border-bottom: none;
}
</style>
