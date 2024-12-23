<template>
    <div class="tree-table-container realTimeData-container">
        <div class="tree-table-left realTimeData-left">
            <company-tree
                ref="companyTree"
                @dataLoading="dataLoading"
                @getNodeClickData="getNodeClickData"
            ></company-tree>
            <el-button class="warning-button" @click="showDialogFunc">详细报警信息</el-button>
            <div id="alarm-preview" class="card alarm-preview"></div>
        </div>
        <div class="resize">
            <el-tooltip
                class="box-item"
                effect="dark"
                content="按住拖动改变左右区域的大小"
                placement="right"
            >
                <div class="drag-container"></div>
            </el-tooltip>
        </div>
        <div class="tree-table-right realTimeData-right">
            <ps-search-table
                rowKey="node_id"
                :loading="loading"
                :border="true"
                :fieldLists="fieldLists"
                :tableData="_tableData"
            >
                <template #tableHeader>
                    <el-button type="primary" @click="outputList">导出</el-button>
                </template>
                <!-- 仪表名称 -->
                <template #node_name="{ row }">
                    <div v-if="includeNodeName(row.node_name)" class="withPic">
                        <img :src="getImage(row.node_name)" class="picInline" />
                        <span>{{ row.node_name }}</span>
                    </div>
                    <div v-else>
                        <span>{{ row.node_name }}</span>
                    </div>
                </template>
                <!-- 数据 -->
                <template #node_data="{ row }">
                    <div v-if="row.node_data">
                        <div>
                            时间：{{
                                row.node_data?.date
                                    ? formatDate(row.node_data.date, 'YYYY-MM-DD HH:mm')
                                    : '- -'
                            }}
                        </div>
                        <div class="tag-container">
                            <el-tag
                                v-for="(item, index) in translateUnitDesp(row.node_data)"
                                :key="index"
                                :type="tagType(item)"
                                style="margin-bottom: 5px"
                                >{{ item.name }}</el-tag
                            >
                        </div>
                    </div>
                </template>

                <template #operation="{ row }">
                    <el-button
                        type="primary"
                        link
                        icon="DocumentChecked"
                        @click="showInstrumentDetail(row)"
                        >仪表详情</el-button
                    >
                    <el-button
                        type="danger"
                        icon="Calendar"
                        link
                        @click="showAlarmRecord(row)"
                        style="margin-left: 6px"
                        >报警记录</el-button
                    >
                </template>
            </ps-search-table>
        </div>
    </div>
    <realTimeData-detail-dialog
        :openDialog="openDialog"
        :dialogHeader="dialogHeader"
        :rowData="rowData"
        @close="closeDialog"
    >
    </realTimeData-detail-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import CompanyTree from '@/components/company-tree/index.vue'
import { alarmOption } from './realTimeData-echarts'
import { formatDate, translateUnitDesp, tagTypes, exportExcel } from '@/utils'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import RealTimeDataDetailDialog from './realTimeData-detail-dialog.vue'
import useSettingStore from '@/store/modules/setting'
import { dragControllerDiv } from '@/utils'

// #region ********** start 左侧树方法 **********
const curCheckData: any = ref([]) // 当前点击节点的project总数
const alarmCount: any = ref(0) // 仪表总数

// 路由名称
const $router = useRouter()
const routerName: any = $router.currentRoute.value.name
// 点击树的多选框传过来的数据
const getNodeClickData = (params: any) => {
    // 存储已选择的节点
    if (params.saveData) localStorage.setItem(routerName, JSON.stringify(params.saveData.value))
    curCheckData.value = params.curCheckData.value
    alarmCount.value = params.alarmCount.value
    setTableData(curCheckData)
    draw()
}

const companyTree: any = ref(null)
onMounted(() => {
    // 刷新后将已存储的节点再赋值回去
    if (localStorage.getItem(routerName)) {
        companyTree.value.setTreeSelectNode(routerName)
    }
})

// 加载样式
const loading = ref(false)
const dataLoading = (params: any) => {
    loading.value = params.loading.value
}
// #endregion ********** end 左侧树方法 **********

// #region ********** start 处理echarts图表 **********
// 初始化图表
const chartsDom: any = ref(null)
const initCharts = () => {
    const domInstance = document.getElementById('alarm-preview')
    chartsDom.value = echarts.init(domInstance)
    window.addEventListener('resize', () => {
        chartsDom.value.resize()
    })
    draw()
}

// 仪表异常
const getAlarmCount = () => {
    let number = 0
    for (let item of curCheckData.value) {
        if (item.alarm_pop != '0') number++
    }
    return number
}

// 渲染数据
const draw = () => {
    // 仪表详情
    let alarm = [
        { name: '正常', value: alarmCount.value - getAlarmCount() },
        { name: '异常', value: getAlarmCount() }
    ]
    chartsDom.value.setOption(alarmOption(alarm))
}
// #endregion ********** end 处理echarts图表 **********

// 导出按钮
const outputList = () => {
    if (!curCheckData.value.length) {
        ElMessage.error('没有可以导出的数据！')
        return
    }
    const listData: any = []
    let now: any = new Date()
    curCheckData.value.forEach((item: any) => {
        let node_data = item.node_data || ''
        listData.push({
            company_name: item.company_name || '',
            project_name: item.project_name ? item.project_name.replace(',', ':') : '',
            node_name: item.node_name || '',
            imei: item.imei || '',
            group: item.group || '',
            iccid: item.iccid || '',
            node_data:
                node_data && node_data.date
                    ? formatDate(node_data.date, 'YYYY-MM-DD HH:mm:ss')
                    : '',
            state:
                (now - +new Date(node_data.date)) / 1000 / 60 > item['send_gap'] * 3
                    ? '离线'
                    : '在线'
        })
    })
    const fileName = `实时数据_${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')}`
    const excelCellWidth = [5, 6, 8, 8, 5, 10, 4]
    exportExcel(fileName, listData, fieldLists, excelCellWidth)
}

// #region ********** start 处理表格数据 **********
const tableData: any = ref([])
// 给表格传数据
const setTableData = (data: any) => {
    tableData.value = data.value
}
const _tableData = computed(() => tableData.value)

// 表格column
const fieldLists = ref([
    {
        label: '所属公司',
        prop: 'company_name',
        fixed: true,
        minWidth: 120
    },
    {
        label: '所属工程',
        prop: 'project_name',
        minWidth: 120
    },
    {
        label: '仪表名称',
        prop: 'node_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 200
    },
    {
        label: 'IMEI号',
        prop: 'imei',
        search: {
            type: 'input',
            span: 1
        },
        sortable: true,
        minWidth: 150
    },
    {
        label: '工位号',
        prop: 'group',
        minWidth: 100
    },
    {
        label: '数据',
        prop: 'node_data',
        minWidth: 170
    },
    {
        label: '状态',
        prop: 'state',
        isShow: false
    },
    {
        label: '操作',
        prop: 'operation',
        type: 'operation',
        fixed: 'right',
        minWidth: 200
    }
])

/* 表格——仪表名称 */
// 图片渲染
const nodeName: any = reactive(['压力', '温度', '多参量', '液位'])
const images: any = reactive({
    压力: new URL('@/assets/images/pressure.png', import.meta.url).href,
    温度: new URL('@/assets/images/temp.png', import.meta.url).href,
    多参量: new URL('@/assets/images/multiple.png', import.meta.url).href,
    液位: new URL('@/assets/images/liquid.png', import.meta.url).href
})

const getImage = (node_name: any) => {
    const includesName: any = nodeName.filter((name: any) => node_name.includes(name))
    return images[includesName[0]]
}

// 检测是否包含关键字
const includeNodeName = (node_name: any) => {
    return nodeName.some((name: any) => node_name.includes(name))
}

/* 表格——数据 */

// tag渲染
const tagType = (item: any) => {
    return tagTypes[item.type]
}
// #endregion ********** end 处理表格数据 **********

// #region ********** start 处理表弹窗表单数据 **********
const dialogHeader: any = ref('') // 弹窗标题
const rowData: any = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗

// 仪表详情
const showInstrumentDetail = (row: any) => {
    console.log(row)
    if (!row.node_data) {
        ElMessage.error('没有数据可以查看！')
        return
    }
    rowData.value = row
    dialogHeader.value = `『 ${rowData.value.node_name} 』详情`
    openDialog.value = true
}

// 报警记录
const showAlarmRecord = (row: any) => {
    console.log(row)
}

// 关闭弹窗
const closeDialog = () => {
    openDialog.value = false
    dialogHeader.value = ''
}

const showDialogFunc = () => {}

// 拖拽改变容器大小
const settingStore = useSettingStore()
watch(
    settingStore,
    (val) => {
        dragControllerDiv(
            'realTimeData-left',
            'realTimeData-right',
            'realTimeData-container',
            val.isCollapse
        )
    },
    { deep: true }
)

onMounted(() => {
    dragControllerDiv(
        'realTimeData-left',
        'realTimeData-right',
        'realTimeData-container',
        settingStore.isCollapse
    )
    initCharts()
})
</script>

<style lang="scss" scoped>
.realTimeData-container {
    .realTimeData-left {
        .filter-input {
            flex: 0 0 34px;
            margin-bottom: 5px;
        }

        .warning-button {
            width: 100%;
            margin: 5px 0;
            flex: 0 0 34px;
        }

        .alarm-preview {
            flex: 0 0 280px;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .realTimeData-right {
        .withPic {
            display: flex;
            flex-direction: column;
            align-items: center;
            .picInline {
                width: 100px;
                height: 100px;
            }
        }

        .tag-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
}
</style>
