<template>
    <el-scrollbar
        class="ps-tree"
        v-loading="loading"
        element-loading-text="正在加载数据，请稍等..."
    >
        <el-tree
            ref="treeRef"
            class="filter-tree"
            :node-key="nodeKey"
            :data="treeData"
            :empty-text="emptyText"
            :default-expand-all="defaultExpandAll"
            :show-checkbox="showCheckbox"
            :filter-node-method="filterNodeMethod"
            :props="defaultProps"
            @node-click="handleNodeClick"
            @node-expand="handleNodeExpand"
            @node-collapse="handleNodeCollapse"
            @check="handleCheckboxClick"
        >
            <template #default="scope">
                <div class="tree-label">
                    <!-- 图标插槽 -->
                    <slot name="icon" :icon="scope.data"></slot>
                    <!-- 展示文本插槽 -->
                    <el-tooltip
                        effect="dark"
                        :content="
                            scope.data.label || scope.data[defaultProps.label] || scope.node.label
                        "
                        placement="top-start"
                    >
                        <slot name="label" :label="scope.data">
                            <span>{{
                                scope.data.label ||
                                scope.data[defaultProps.label] ||
                                scope.node.label
                            }}</span>
                        </slot>
                    </el-tooltip>
                </div>
            </template>
        </el-tree>
    </el-scrollbar>
</template>

<script setup lang="ts">
const props = defineProps({
    // 每个树节点用来作为唯一标识的属性
    nodeKey: {
        type: String,
        default: 'id'
    },
    // 每个树节点用来作为唯一标识的属性
    tooltipContent: {
        type: String,
        default: ''
    },
    filterText: {
        type: String,
        default: ''
    },
    //
    defaultProps: {
        type: Object,
        default: () => ({
            label: 'company_name'
        })
    },
    // 展示数据
    treeData: {
        type: Array,
        default: []
    },
    // 内容为空的时候展示的文本
    emptyText: {
        type: String,
        default: '数据为空'
    },
    // 加载样式
    loading: {
        type: Boolean,
        default: false
    },
    // 是否默认展开所有节点
    defaultExpandAll: {
        type: Boolean,
        default: true
    },
    // 	节点是否可被选择
    showCheckbox: {
        type: Boolean,
        default: true
    },
    // 对树节点进行筛选时执行的方法，返回 false 则表示这个节点会被隐藏
    filterNodeMethod: {
        type: Function as any,
        default: () => {}
    },
    // 当节点被点击的时候触发
    handleNodeClick: {
        type: Function as any,
        default: () => {}
    },
    // 节点被展开时触发的事件
    handleNodeExpand: {
        type: Function as any,
        default: () => {}
    },
    // 节点被关闭时触发的事件
    handleNodeCollapse: {
        type: Function as any,
        default: () => {}
    },
    // 点击节点复选框之后触发
    handleCheckboxClick: {
        type: Function as any,
        default: () => {}
    }
})

import { ElTree } from 'element-plus'
import { computed, ref, watch } from 'vue'

// 关键字筛选
const _filterText = computed(() => props.filterText)
const treeRef = ref<InstanceType<typeof ElTree>>()

watch(_filterText, (val) => {
    treeRef.value!.filter(val)
})
</script>

<style lang="scss" scoped>
.ps-tree {
    width: 100%;
    height: 100%;
    .tree-label {
        display: flex;
        align-items: center;
    }
}
</style>
