<template>
    <div class="tree-table-container realTimeData-container">
        <div class="tree-table-left realTimeData-left">
            <company-tree
                ref="companyTree"
                @dataLoading="dataLoading"
                @getNodeClickData="getNodeClickData"
            ></company-tree>
            <el-badge
                style="width: 100%"
                :value="alarmData.length"
                :hidden="[true, false][alarmData.length]"
                :offset="[0, 5]"
            >
                <el-button
                    class="warning-button"
                    :class="{ flashAnimation }"
                    @click="showAlarmDetail"
                    >详细报警信息</el-button
                >
            </el-badge>
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
                ref="ps_table"
                rowKey="node_id"
                :loading="loading"
                :border="true"
                :fieldLists="fieldLists"
                :tableData="_tableData"
                :pageConfig="pageConfig"
            >
                <template #tableHeader>
                    <el-button type="primary" @click="outputList">导出</el-button>
                    <div class="mutedSound">
                        静音报警声：<el-switch
                            v-model="mutedSound"
                            @change="handleMutedSound()"
                        ></el-switch>
                    </div>
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
                            时间：{{ row.node_data?.date ? formatDate(row.node_data.date) : '- -' }}
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
                    <el-badge
                        value="!!!"
                        :hidden="[true, false][row.alarm_notice]"
                        :offset="[10, 10]"
                    >
                        <el-button
                            type="danger"
                            icon="Calendar"
                            link
                            @click="showAlarmRecord(row)"
                            style="margin-left: 6px"
                            >报警记录</el-button
                        >
                    </el-badge>
                </template>
            </ps-search-table>
        </div>
    </div>
    <audio :src="audioSrc" ref="audio" muted loop></audio>
    <!-- 仪表详情 -->
    <realTimeData-detail-dialog
        :openDialog="openDialog"
        :dialogHeader="dialogHeader"
        :rowData="rowData"
        @close="closeDialog"
    ></realTimeData-detail-dialog>
    <!-- 报警记录-单行 -->
    <alarm-record-dialog
        :openDialog="openAlarmDialog"
        :dialogHeader="'最新报警'"
        :rowData="alarmRowData"
        @refresh="refresh"
        @close="closeAlarmDialog"
    ></alarm-record-dialog>
    <!-- 报警记录汇总-最新 -->
    <alarm-record-detail-dialog
        :openDialog="openAlarmDetailDialog"
        :alarmTableData="alarmData"
        @refresh="refresh"
        @close="closeAlarmDetailDialog"
    ></alarm-record-detail-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onActivated, onUnmounted } from 'vue'
import CompanyTree from '@/components/company-tree/index.vue'
import { alarmOption } from './realTimeData-echarts'
import {
    formatDate,
    translateUnit,
    translateUnitDesp,
    translateUnitDespSingle,
    tagTypes,
    exportExcel
} from '@/utils'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import RealTimeDataDetailDialog from './realTimeData-detail-dialog.vue'
import AlarmRecordDialog from './alarmRecordDialog.vue'
import AlarmRecordDetailDialog from './alarmRecordDetailDialog.vue'
import useSettingStore from '@/store/modules/setting'
import { dragControllerDiv } from '@/utils'
import emitter from '@/utils/emitter'
// import * as _ from 'lodash'

// #region ********** start 左侧树方法 **********
const curCheckData: any = ref([]) // 当前点击节点的project总数
const alarmCount: any = ref(0) // 仪表总数
const saveData: any = ref({}) // 当前点击的节点数据
const resCommand: any = ref('') // 当前点击的节点数据

// 路由名称
const $router = useRouter()
const routerName: any = $router.currentRoute.value.name

const ps_table: any = ref(null)
const pageConfig: any = ref({
    pageNum: 1,
    pageSize: 10
})
// 点击树的多选框传过来的数据
const getNodeClickData = (params: any) => {
    // 存储已选择的节点
    if (params.saveData) localStorage.setItem(routerName, JSON.stringify(params.saveData.value))
    curCheckData.value = params.curCheckData.value
    alarmCount.value = params.alarmCount.value
    saveData.value = params.saveData.value
    resCommand.value = params.resCommand
    setTableData(curCheckData)
    setAlarmData(curCheckData)
    // websocket更新数据后再搜索回到原来查询的页面
    if (sessionStorage.getItem(`${routerName}_search`)) {
        const searchParams: any = {
            searchParams: ref(JSON.parse(sessionStorage.getItem(`${routerName}_search`) as any))
        }
        setTimeout(() => {
            ps_table.value.search(searchParams)
            ps_table.value.setSearchParams(searchParams)
        })
    }
    draw()
}

const companyTree: any = ref(null)
onMounted(() => {
    // 刷新后将已存储的节点再赋值回去
    if (localStorage.getItem(routerName)) {
        setTimeout(() => {
            companyTree.value.setTreeSelectNode(routerName)
        }, 500)
    }
})

// 跳到该页面时要用
onActivated(() => {
    draw()
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
    chartsDom.value?.setOption(alarmOption(alarm))
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
            node_data: node_data && node_data.date ? formatDate(node_data.date) : '',
            state:
                (now - +new Date(node_data.date)) / 1000 / 60 > item['send_gap'] * 3
                    ? '离线'
                    : '在线'
        })
    })
    const fileName = `实时数据_${formatDate(new Date())}`
    const excelCellWidth = [5, 6, 8, 8, 5, 10, 4]
    exportExcel(fileName, listData, fieldLists, excelCellWidth)
    handleAudioPlayRepeat()
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
        search: {
            type: 'input',
            span: 1
        },
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

// #region ********** start 仪表详情弹窗 **********
const dialogHeader: any = ref('') // 弹窗标题
const rowData: any = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗

// 仪表详情
const showInstrumentDetail = (row: any) => {
    if (!row.node_data) {
        ElMessage.error('没有数据可以查看！')
        return
    }
    rowData.value = row
    dialogHeader.value = `『 ${rowData.value.node_name} 』详情`
    openDialog.value = true
    handleAudioPlayRepeat()
}

// 关闭弹窗
const closeDialog = () => {
    openDialog.value = false
    dialogHeader.value = ''
}
// #endregion ********** end 仪表详情弹窗 **********

// #region ********** start 报警记录-单行 **********
const openAlarmDialog = ref(false)
const alarmRowData = ref([])

// 打开报警记录弹窗
const showAlarmRecord = (row: any) => {
    openAlarmDialog.value = true
    alarmRowData.value = row
    handleAudioPlayRepeat()
}

// 关闭报警记录弹窗
const closeAlarmDialog = () => {
    openAlarmDialog.value = false
}
// #endregion ********** end 报警记录-单行 **********

// #region ********** start 报警记录汇总-最新 **********
// 筛选带报警标识的数据
const alarmData: any = ref([])
const beforeAlarmData: any = ref('') // 记录上一次报警数据
const setAlarmData = (data: any) => {
    const dataCopy = JSON.parse(JSON.stringify(data.value))
    const _data = dataCopy.filter((item: any) => item.alarm_pop == '1')
    beforeAlarmData.value = JSON.stringify(alarmData.value)
    alarmData.value = []
    let alarmMsg: any = {}
    for (let i of _data) {
        for (let j of i.node_data.line_datas) {
            if (j.alarm_flag !== '0' || (i.alarm_pop == '1' && j.alarm_flag == '0')) {
                const alarmFlagEx = Number(j.alarm_flag_ex)
                const alarmFlag = Number(j.line_param.alarm_flag)

                // 组装参数
                alarmMsg = { ...i }
                alarmMsg.alarmRowId = `${i.imei}${j.unit}` // 唯一标识
                alarmMsg.curValue = translateUnitDespSingle(j)
                alarmMsg.curDate = formatDate(j.date)
                alarmMsg.paramType = translateUnit(j.unit, 'desc')
                alarmMsg.alarmType = getState(alarmFlagEx, alarmFlag)

                // 存在一样的就不添加
                if (JSON.stringify(alarmData.value).includes(JSON.stringify(alarmMsg))) {
                    continue
                }

                // imei号和参数类型一样的就更新
                let index = alarmData.value.findIndex(
                    (h: any) => h.imei == alarmMsg.imei && h.paramType == alarmMsg.paramType
                )
                if (index > -1) {
                    alarmData.value.splice(index, 1, alarmMsg)
                    continue
                }
                // 新的直接添加
                alarmData.value.push(alarmMsg)
                if (alarmData.length && !mutedSound.value) {
                    audio.value.muted = false
                    audio.value.play()
                    setTimeout(() => {
                        audio.value.muted = true
                    }, 3000)
                }
            }
        }
    }
}

// 转义
const flags = {
    h_d2: 10,
    h_2: 8,
    h_1: 2,
    l_d2: 5,
    l_2: 4,
    l_1: 1
}
const getState = (alarmEx: any, alarm: any) => {
    if (0 != alarm) {
        if (alarm == flags.h_d2 || alarm == flags.h_2) {
            return '超出上限2报警'
        } else if (alarm == flags.l_d2 || alarm == flags.l_2) {
            return '低于下限2报警'
        } else if (alarm == flags.h_1) {
            return '超出上限1报警'
        } else if (alarm == flags.l_1) {
            return '低于下限1报警'
        }
    } else {
        if (alarmEx != 0) {
            return '恢复正常'
        }
    }
}

// 有报警的话就改变按钮的颜色
const audio: any = ref(null) // 音频组件
const flashAnimation: any = ref(false) // 闪烁动画
const mutedSound: any = ref(false) // 静音报警声
const audioSrc: any = new URL('@/assets/audio/alarm.mp3', import.meta.url).href
watch(
    alarmData,
    (newVal) => {
        if (newVal.length) {
            flashAnimation.value = true
            if (!mutedSound.value && JSON.stringify(newVal) !== beforeAlarmData.value) {
                audio.value.muted = false
                audio.value.play()
                setTimeout(() => {
                    audio.value.muted = true
                }, 3000)
            }
        } else {
            flashAnimation.value = false
            audio.value.muted = true
        }
    },
    { deep: true }
)

// 打开/关闭报警声
const handleMutedSound = () => {
    if (mutedSound.value) {
        audio.value.muted = true
    } else if (!mutedSound.value && alarmData.value.length) {
        audio.value.muted = false
        audio.value.play()
        setTimeout(() => {
            audio.value.muted = true
        }, 3000)
    }
}

// 点击菜单触发的音频事件
onMounted(() => {
    emitter.on('audioPlay', handleAudioPlay)
})

onUnmounted(() => {
    emitter.off('audioPlay', handleAudioPlay)
})

/* 
    因浏览器限制原因，只能通过用户主动点击操作来重新触发报警声音
*/
const menuClickFlag: any = ref(false) // 防止重复菜单点击报警
const menuClickAlarmDialogFlag: any = ref(false) // 点击菜单跳转页面后，不再通过点击详细报警弹窗按钮来重新激活报警声音
// 处理报警声
const handleAudioPlay = () => {
    menuClickAlarmDialogFlag.value = true
    if (alarmData.value.length && !mutedSound.value && !menuClickFlag.value) {
        audio.value.muted = false
        audio.value.play()
        setTimeout(() => {
            audio.value.muted = true
        }, 3000)
        menuClickFlag.value = true
    } else {
        audio.value.muted = true
    }
}

// 刷新页面重新激活报警声
const handleAudioPlayRepeat = () => {
    if (menuClickAlarmDialogFlag.value) {
        return
    } else {
        menuClickAlarmDialogFlag.value = true
    }
    if (alarmData.value.length && !mutedSound.value) {
        audio.value.muted = false
        audio.value.play()
        setTimeout(() => {
            audio.value.muted = true
        }, 3000)
    }
}

// 打开报警弹窗
const openAlarmDetailDialog: any = ref(false) // 打开弹窗
const showAlarmDetail = () => {
    openAlarmDetailDialog.value = true
    handleAudioPlayRepeat()
}

// 关闭报警弹窗
const closeAlarmDetailDialog = () => {
    openAlarmDetailDialog.value = false
}

// 取消报警后刷新列表
const refresh = () => {
    if (companyTree.value)
        companyTree.value.companyTreeNodeCheckWebsocket(
            saveData.value.project,
            saveData.value.check
        )
}
// #endregion ********** end 报警记录汇总-最新 **********

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
.flashAnimation {
    animation: flashAnimation 0.4s infinite alternate;
    @keyframes flashAnimation {
        0% {
            background-color: #fff;
        }

        100% {
            background-color: #f56c6c;
        }
    }
}
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
        .mutedSound {
            margin-left: 20px;
            align-items: center;
        }

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
