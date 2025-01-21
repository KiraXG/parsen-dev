<template>
    <div class="ps-search-table">
        <!-- 搜索栏 -->
        <ps-search
            class="card table-search"
            v-if="hasSearch"
            :labelWidth="labelWidth"
            :searchFields="searchFields"
            @search.native="search"
            @reset.native="reset"
        ></ps-search>
        <div class="card table-main">
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
            <div class="table-selected" v-if="hasSelection">
                <div>
                    已选择：<span class="selected-detail">{{ selectedData.length }}</span
                    >&nbsp;条数据
                </div>
                <el-button
                    style="margin-left: 10px"
                    link
                    type="primary"
                    @click="handleClearSelectedData"
                    >清空选择</el-button
                >
            </div>
            <el-table
                ref="ps_table"
                v-bind="$attrs"
                :data="curPageTableData"
                :row-key="rowKey"
                :border="border"
                :stripe="stripe"
                :highlight-current-row="highlightCurrentRow"
                :default-expand-all="defaultExpandAll"
                @selection-change="handleSelectionChange"
                @sort-change="handleSortChange"
                v-loading="tableLoading"
                element-loading-text="正在加载数据，请稍等..."
            >
                <slot></slot>
                <el-table-column
                    fixed
                    :align="'center'"
                    :reserve-selection="true"
                    type="selection"
                    v-if="hasSelection"
                    width="40"
                />
                <el-table-column type="index" :align="'center'" v-if="hasIndex" width="50" />
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
                        :filters="item.filters"
                        :filter-method="item.filterMethod"
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
                                {{
                                    scope.row[item.prop] === 0
                                        ? 0
                                        : scope.row[item.prop]
                                          ? scope.row[item.prop]
                                          : '- -'
                                }}
                            </slot>
                        </template>
                        <!-- table-header -->
                        <template #header="scope">
                            <el-popover
                                v-if="item.hasFilter"
                                :visible="headerPopover[scope.column.property]"
                                ref="popover"
                                placement="bottom"
                                title="查询条件"
                                width="auto"
                                trigger="click"
                            >
                                <div v-if="item.filterType.includes('date')">
                                    <el-date-picker
                                        v-if="item.filterType === 'date'"
                                        v-model="filterParams[scope.column.property]"
                                        type="date"
                                        value-format="YYYY-MM-DD"
                                        clearable
                                    />
                                    <el-date-picker
                                        v-else-if="item.filterType === 'daterange'"
                                        v-model="filterParams[scope.column.property]"
                                        type="daterange"
                                        value-format="YYYY-MM-DD"
                                        range-separator="至"
                                        start-placeholder="请选择开始日期"
                                        end-placeholder="请选择结束日期"
                                        :shortcuts="item.shortcuts || []"
                                        clearable
                                    />
                                    <el-date-picker
                                        v-else-if="item.filterType === 'datetime'"
                                        v-model="filterParams[scope.column.property]"
                                        type="datetime"
                                        value-format="YYYY-MM-DD HH:mm:ss"
                                        clearable
                                    />
                                    <el-date-picker
                                        v-else-if="item.filterType === 'datetimerange'"
                                        v-model="filterParams[scope.column.property]"
                                        type="datetimerange"
                                        value-format="YYYY-MM-DD HH:mm:ss"
                                        range-separator="至"
                                        start-placeholder="请选择开始日期"
                                        end-placeholder="请选择结束日期"
                                        :shortcuts="item.shortcuts || []"
                                        clearable
                                    />
                                    <div class="date-picker-tip" style="color: #909399">
                                        <el-icon><InfoFilled /></el-icon>日期选择器<span
                                            style="color: #67c23a"
                                            >左侧有预设时间</span
                                        >，以今天时间为分界限
                                    </div>
                                    <div class="date-picker-tip" style="color: #909399">
                                        <el-icon><InfoFilled /></el-icon>可直接在输入框内<span
                                            style="color: #67c23a"
                                        >
                                            “按照(2001-01-01{{
                                                item.filterType.includes('time') ? ' 00:00:00' : ''
                                            }})的格式” </span
                                        >输入日期
                                    </div>
                                </div>

                                <el-input v-else></el-input>
                                <div class="popover-container">
                                    <el-button
                                        size="small"
                                        type="danger"
                                        link
                                        @click="closePopover(scope.column.property)"
                                        >关闭</el-button
                                    >
                                    <el-button
                                        size="small"
                                        type="info"
                                        link
                                        @click="resetFilter(scope.column.property)"
                                        >重置</el-button
                                    >
                                    <el-button
                                        size="small"
                                        type="primary"
                                        link
                                        @click="
                                            search({
                                                [scope.column.property]:
                                                    filterParams[scope.column.property]
                                            })
                                        "
                                        >查询</el-button
                                    >
                                </div>
                                <template #reference>
                                    <el-button
                                        link
                                        @click.stop="closePopover(scope.column.property)"
                                        ><span
                                            :style="{
                                                color: realFilterParams[scope.column.property]
                                                    ? '#409eff'
                                                    : '#303133',
                                                fontWeight: 'bold',
                                                fontSize: '15px'
                                            }"
                                            >{{
                                                item.headerRender
                                                    ? item.headerRender(scope)
                                                    : item.label
                                            }}</span
                                        ><el-icon><ArrowDown /></el-icon
                                    ></el-button>
                                </template>
                            </el-popover>
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
                <div style="display: flex; justify-content: flex-end">
                    <div
                        style="margin: 29px 29px 0 0; width: 20px; height: 20px"
                        v-loading="loading"
                    ></div>
                    <ps-pagination
                        v-if="hasPagination"
                        :total="total"
                        :pageConfig="_pageConfig"
                        :handle-size-change="handleSizeChange"
                        :handle-current-change="handleCurrentChange"
                    />
                </div>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { TableInstance } from 'element-plus'
import { dayjs } from 'element-plus'
import { startDateTime, endDateTime } from '@/utils'
import { useRouter } from 'vue-router'

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
    // 是否多选
    hasSelection: {
        type: Boolean,
        default: false
    },
    // 是否有序号
    hasIndex: {
        type: Boolean,
        default: false
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

// dom ref
const ps_table = ref<TableInstance>()

// 定义 emit 方法
const emit = defineEmits<{
    getCurTableData: [{ curTableData: object }]
    getSelectedData: [{ selectedData: object }]
}>()

/* -------------------- 搜索 -------------------- */
// 搜索加载样式
const tableLoading = ref(false)

// 筛选出带搜索的表单
const searchFields = props.fieldLists.filter((item: any) => item.search)
// 当前搜索参数
const curSearchParams: any = ref({})
// search栏搜索参数
const searchParams: any = ref({})

// 表头过滤参数
const filterParams: any = ref({})
// 真正参与查询的表头过滤参数
const realFilterParams: any = ref({})

// 重置表头过滤参数
const resetFilter = (property?: any) => {
    delete realFilterParams.value[property]
    delete curSearchParams.value[property]
    closePopover()
    search(curSearchParams)
}

// popover是否可见
const headerPopover: any = ref({})
const closePopover = (property?: any) => {
    if (!property) {
        // 不传的话就关闭全部的popover
        for (let i in headerPopover.value) {
            headerPopover.value[i] = false
        }
    } else {
        // 传哪个就把其他的popover设为关闭，点击后值自我取反
        headerPopover.value[property] = !headerPopover.value[property]
        for (let i in headerPopover.value) {
            if (i !== property) headerPopover.value[i] = false
        }
    }
}

// 路由名称
const $router = useRouter()
const routerName: any = $router.currentRoute.value.name

// 搜索
const search = (val?: any) => {
    closePopover()
    tableLoading.value = true
    if (val && val.searchParams) {
        // search栏搜索参数
        searchParams.value = val.searchParams.value
        // 整合search栏搜索参数 + 真正参与查询的表头过滤参数
        curSearchParams.value = Object.assign(searchParams.value, realFilterParams.value)
    } else if (val && val.value) {
        // 表头过滤重置时传来的缓存的search栏搜索参数
        curSearchParams.value = val.value
    } else {
        // 将真正参与查询的表头过滤参数单独放在一个对象中
        realFilterParams.value = Object.assign(realFilterParams.value, val)
        // 整合search栏搜索参数 + 真正参与查询的表头过滤参数
        curSearchParams.value = Object.assign(searchParams.value, realFilterParams.value)
    }
    // 存储搜索数据
    sessionStorage.setItem(`${routerName}_search`, JSON.stringify(curSearchParams.value))
    // 筛选数据
    curTableData.value = _tableData.value
    for (let i in curSearchParams.value) {
        if (curSearchParams.value[i]) {
            // 判断是不是日期范围
            if (
                Array.isArray(curSearchParams.value[i]) &&
                dayjs(curSearchParams.value[i][0]).isValid()
            ) {
                curTableData.value = curTableData.value.filter((item: any) => {
                    return new Date(item[i]) >= startDateTime(curSearchParams.value[i][0])
                })
                curTableData.value = curTableData.value.filter((item: any) => {
                    return new Date(item[i]) <= endDateTime(curSearchParams.value[i][1])
                })
            } else {
                curTableData.value = curTableData.value.filter((item: any) => {
                    return item[i] && item[i].includes(curSearchParams.value[i])
                })
            }
        }
    }
    setTimeout(() => {
        tableLoading.value = false
    }, 500)
}

// 重置
const reset = () => {
    tableLoading.value = false
    curSearchParams.value = {}
    searchParams.value = {}
    filterParams.value = {}
    realFilterParams.value = {}
    headerPopover.value = {}
    curTableData.value = _tableData.value
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

// 监听当前表格数量
watch(
    curTableData,
    () => {
        emit('getCurTableData', { curTableData })
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

// 处理多选框
const selectedData: any = ref([])
const handleSelectionChange = (data: any) => {
    selectedData.value = data
    emit('getSelectedData', { selectedData })
}

// 处理表格排序
const handleSortChange = (data: any) => {
    function sortFinal(prop: any) {
        if (data.prop.includes('date') || data.prop.includes('time')) {
            return function (a: any, b: any) {
                let f: any = new Date(a[prop])
                let s: any = new Date(b[prop])
                return data.order === 'ascending' ? f - s : s - f
            }
        } else {
            return function (a: any, b: any) {
                return data.order === 'ascending' ? a - b : b - a
            }
        }
    }
    const sortTable: any = reactive([])
    const hasOrderValue: any = curTableData.value.filter((i: any) => i[data.prop])
    const noOrderValue: any = curTableData.value.filter((i: any) => !i[data.prop])
    sortTable.push(...hasOrderValue.sort(sortFinal(data.prop)), ...noOrderValue)
    curTableData.value = sortTable
}

// 清空已选择数据
const handleClearSelectedData = () => {
    selectedData.value = []
    emit('getSelectedData', { selectedData })
    handleSetSelectedData()
}

// 处理表格中的选择事件
const handleSetSelectedData = (rows?: any, ignoreSelectable?: boolean) => {
    if (rows) {
        rows.forEach((row: any) => {
            ps_table.value!.toggleRowSelection(row, undefined, ignoreSelectable)
        })
    } else {
        ps_table.value!.clearSelection()
    }
}

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

// 向父组件暴露方法
defineExpose({
    search
})
</script>

<style lang="scss" scoped>
.date-picker-tip {
    margin-top: 5px;
    display: flex;
    align-items: center;
}
.popover-container {
    margin-top: 5px;
    display: flex;
    justify-content: flex-end;
}
</style>
