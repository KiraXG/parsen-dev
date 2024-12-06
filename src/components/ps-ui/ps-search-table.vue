<template>
    <!-- 搜索栏 -->
    <ps-search
        v-if="hasSearch"
        :labelWidth="labelWidth"
        :searchFields="searchFields"
        @search.native="search"
        @reset.native="reset"
    ></ps-search>
    <div class="card table-main" v-loading="loading" element-loading-text="正在加载数据，请稍等...">
        <!-- 表格上方区域 -->
        <div class="table-header">
            <div class="header-button-lf">
                <slot name="tableHeader"></slot>
                <el-button v-if="showRefresh" icon="Refresh" @click="refreshTable">
                    刷新
                </el-button>
            </div>
        </div>
        <!-- 表格主体 -->
        <el-table
            v-bind="$attrs"
            :data="curPageTableData"
            :row-key="rowKey"
            :border="border"
            :stripe="stripe"
            :highlight-current-row="highlightCurrentRow"
            :default-expand-all="defaultExpandAll"
            v-loading="tableLoading"
            element-loading-text="正在加载数据，请稍等..."
        >
            <slot></slot>
            <template v-for="item in fieldLists" :key="item">
                <el-table-column
                    v-if="item.isShow ?? true"
                    :label="item.label"
                    :prop="item.prop"
                    :fixed="item.fixed"
                    :align="item.align ?? 'center'"
                    :sortable="item.sortable"
                    :width="item.width"
                    :min-width="item.minWidth"
                    :showOverflowTooltip="item.showOverflowTooltip ?? item.prop !== 'operation'"
                >
                    <!-- table-cell -->
                    <template #default="scope">
                        <slot
                            :name="item.prop"
                            :row="scope.row"
                            :column="scope.column"
                            :scope="scope"
                        >
                            {{ scope.row[item.prop] || '- -' }}
                        </slot>
                    </template>
                    <!-- table-header -->
                    <template #header="scope">
                        {{ item.headerRender ? item.headerRender(scope) : item.label }}
                    </template>
                </el-table-column>
            </template>
            <template #append>
                <slot name="append"></slot>
            </template>
            <!-- 无数据 -->
            <template #empty>
                <div class="table-empty">
                    <slot name="empty">
                        <div>暂无数据</div>
                    </slot>
                </div>
            </template>
        </el-table>
        <!-- 分页组件 -->
        <slot name="pagination">
            <ps-pagination
                v-if="hasPagination"
                :total="total"
                :pageConfig="_pageConfig"
                :handle-size-change="handleSizeChange"
                :handle-current-change="handleCurrentChange"
            />
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
    // 列表
    fieldLists: {
        type: Array as any,
        default: []
    },
    // 表格数据
    tableData: {
        type: Array as any,
        default: []
    },
    // 行数据的 Key，用来优化 Table 的渲染
    rowKey: {
        type: String,
        default: 'id'
    },
    // 搜索栏
    hasSearch: {
        type: Boolean,
        default: true
    },
    // 搜索label宽度
    labelWidth: {
        type: Number,
        default: 80
    },
    // 分页器
    hasPagination: {
        type: Boolean,
        default: true
    },
    // 分页数据
    pageConfig: {
        type: Object,
        default: () => ({
            pageNum: 1,
            pageSize: 10
        })
    },
    // 树形结构是否默认展开
    defaultExpandAll: {
        type: Boolean,
        default: false
    },
    // 加载样式
    loading: {
        type: Boolean,
        default: false
    },
    // 刷新按钮
    showRefresh: {
        type: Boolean,
        default: false
    },
    // 表格边框
    border: {
        type: Boolean,
        default: false
    },
    // 是否为斑马纹
    stripe: {
        type: Boolean,
        default: true
    },
    // 点击行 高亮
    highlightCurrentRow: {
        type: Boolean,
        default: true
    }
})

// 定义 emit 方法
const emit = defineEmits<{
    getCurTableData: [{ curTableData: object }]
}>()

/* -------------------- 搜索 -------------------- */
// 筛选出带搜索的表单
const searchFields = props.fieldLists.filter((item: any) => item.search)
// 当前搜索参数
const curSearchParams: any = ref({})
// 搜索加载样式
const tableLoading = ref(false)

// 搜索
const search = (val: any) => {
    tableLoading.value = true
    curSearchParams.value = val.searchParams.value
    // 筛选数据
    curTableData.value = _tableData.value
    for (let i in curSearchParams.value) {
        if (curSearchParams.value[i]) {
            curTableData.value = curTableData.value.filter((item: any) => {
                return item[i].includes(curSearchParams.value[i])
            })
        }
    }
    emit('getCurTableData', { curTableData })
    setTimeout(() => {
        tableLoading.value = false
    }, 500)
}

// 重置
const reset = () => {
    curSearchParams.value = {}
    curTableData.value = _tableData.value
    emit('getCurTableData', { curTableData })
}
/* -------------------- 表格按钮 -------------------- */

// 刷新表格数据
const refreshTable = () => {}

/* -------------------- 表格 -------------------- */
// #region ********* 处理表格数据 **********
// 复制一份tableData
const _tableData = computed(() => props.tableData)

// 当前勾选后获得的以及筛选后的表格数据总数
const curTableData: any = ref([])

// 监听勾选的数量
watch(
    _tableData,
    (val) => {
        curTableData.value = val
    },
    { deep: true }
)

// 当前表格数据总量
const total = computed(() => curTableData.value.length)

// 计算当前页展示的数据
const curPageTableData = computed(() => {
    return curTableData.value.slice(
        (_pageConfig.pageNum - 1) * _pageConfig.pageSize,
        _pageConfig.pageNum * _pageConfig.pageSize
    )
})

// #endregion ********* 处理表格数据 **********

/* -------------------- 分页 -------------------- */
// #region ********* start 处理分页 **********
// 分页配置
const _pageConfig = reactive(Object.assign({}, props.pageConfig))

// 当前页数改变时触发
const handleCurrentChange = (val: any) => {
    _pageConfig.pageNum = val
}

// "条/页" 改变时触发
const handleSizeChange = (val: any) => {
    _pageConfig.pageSize = val
}
// #endregion ********* end 分页 **********
</script>

<style lang="scss" scoped></style>
