<template>
    <ps-dialog
        :openDialog="openDialog"
        :dialogHeader="dialogHeader"
        :isEdit="false"
        :isShowConfirm="false"
        width="850px"
        :dialogInnerStyle="{ height: '530px' }"
        @open="open"
        @close="close"
    >
        <ps-search-table
            tableName="alarmRecordDialog"
            :tableData="tableData"
            :fieldLists="fieldLists"
            :border="true"
            rowKey="node_id"
        >
            <template #tableHeader>
                <el-date-picker
                    type="daterange"
                    v-model="dateTimeRange"
                    :shortcuts="shortcuts"
                    range-separator="至"
                    value-format="YYYY-MM-DD"
                    start-placeholder="请选择开始日期"
                    end-placeholder="请选择结束日期"
                ></el-date-picker>
                <el-button type="primary" @click="updateData">更新</el-button>
                <el-popconfirm
                    width="230px"
                    placement="top"
                    confirm-button-text="是"
                    cancel-button-text="否"
                    icon="InfoFilled"
                    icon-color="#626AEF"
                    title="我已经知道参数异常，并希望撤销最后一次报警提示！"
                    @confirm="handleCancel()"
                >
                    <template #reference>
                        <span style="margin-left: 12px">
                            <el-button type="danger" icon="Warning">撤销最后一次报警提示</el-button>
                        </span>
                    </template>
                </el-popconfirm>
            </template>
            <template #alarm_name="{ row }">
                <div :style="{ color: row.alarm_color }">
                    {{ row.alarm_name }}
                </div>
            </template>
        </ps-search-table>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { startDateTimeText, endDateTimeText } from '@/utils'
import { UNIT_TABLE, PsColor, alarmMask, formatDate } from '@/utils'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { cleanNodeAlarmFlag } from '@/api/realTimeData'

const props = defineProps({
    // 打开弹窗
    openDialog: {
        type: Boolean,
        default: false
    },
    // 弹窗标题
    dialogHeader: {
        type: String,
        default: '新建'
    },
    // form 表单 column
    formFields: {
        type: Array,
        default: []
    },
    // 当前行数据
    rowData: {
        type: Object,
        default: () => {}
    },
    // 当前行数据
    alarmTableData: {
        type: Object,
        default: () => {}
    }
})

const userStore = useUserStore()

// 定义 emit 方法
const emit = defineEmits<{
    close: [] // 关闭弹窗
}>()

// 打开弹窗
const open = () => {
    setTableColumn()
}

// 表单
const fieldLists: any = ref([])
const beforeTable = [
    {
        label: '时间',
        prop: 'date',
        minWidth: 120
    }
]
const afterTable = [
    {
        label: '报警类型',
        prop: 'alarm_name',
        minWidth: 120
    }
]

// 设置列表
const setTableColumn = () => {
    const column: any = reactive([])
    for (let i of props.rowData.node_data.line_datas) {
        for (let j of UNIT_TABLE) {
            if (i.unit == j.type) {
                column.push({ label: j.desc, prop: i.unit })
            }
        }
    }
    fieldLists.value = [...beforeTable, ...column, ...afterTable]
}

// 日期选择
const dateTimeRange = ref([
    startDateTimeText(new Date().setDate(new Date().getDate() - 1)),
    endDateTimeText(new Date())
])

// 更新数据
const wsNode: any = ref(null)
const tableData: any = ref([]) // 表格数据
const updateData = () => {
    if (!dateTimeRange.value || !dateTimeRange.value.length) {
        ElMessage.error('请选择日期！')
        return
    }
    if (!window.WebSocket) return
    const wsUrl = 'wss://app.parsen.com.cn/ParsenHttpApiV030/com/finder/GetNodeAlarms'
    if (wsNode.value) wsNode.value.close()
    wsNode.value = new WebSocket(wsUrl)

    tableData.value = []
    // 请求接口
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id,
        start_time: dateTimeRange.value[0],
        end_time: dateTimeRange.value[1],
        page_count: 8
    }
    // 发送数据
    wsNode.value.onopen = () => {
        wsNode.value.send(JSON.stringify(params))
    }
    wsNode.value.onmessage = (event: any) => {
        let data: any = null
        try {
            data = JSON.parse(event.data)
        } catch (e) {
            console.error('websocket onmessage not json string')
            console.error(event.data)
            console.error(e)
            return
        }
        // 处理数据
        if (data) {
            tableData.value.push(...data.node_alarms)
            // 排序
            function sortFinal(date: any) {
                return function (a: any, b: any) {
                    const f: any = new Date(a[date])
                    const s: any = new Date(b[date])
                    return s - f
                }
            }
            tableData.value = tableData.value.sort(sortFinal('date'))
            tableData.value = tableData.value.map((item: any) => {
                return {
                    ...item,
                    ...getAlarmValue(item),
                    date: formatDate(item.date),
                    alarm_name: getAlarmName(item),
                    alarm_color: getAlarmColor(item)
                }
            })
        }
    }
}

// 数据转义组装
const getAlarmValue = (data: any) => {
    const columnTableData: any = {}
    for (let j of UNIT_TABLE) {
        if (data.unit == j.type) {
            columnTableData[data.unit] = `${data.value} ${j.name}`
        }
    }
    return columnTableData
}

// 报警类型
const getAlarmName = (alarm: any) => {
    if (0 == alarm.alarm_flag) {
        return '恢复正常'
    } else if ((alarmMask.LO_ALARM_2_MASK & alarm.alarm_flag) != 0) {
        return '下下限报警'
    } else if ((alarmMask.HI_ALARM_2_MASK & alarm.alarm_flag) != 0) {
        return '上上限报警'
    } else if ((alarmMask.LO_ALARM_1_MASK & alarm.alarm_flag) != 0) {
        return '下限报警'
    } else if ((alarmMask.HI_ALARM_1_MASK & alarm.alarm_flag) != 0) {
        return '上限报警'
    }
}

// 颜色
const getAlarmColor = (alarm: any) => {
    if (0 == alarm.alarm_flag) {
        return PsColor.PS_SUCCESS_GREEN
    } else if ((alarmMask.LO_ALARM_2_MASK & alarm.alarm_flag) != 0) {
        return PsColor.PS_ALARM_RED
    } else if ((alarmMask.HI_ALARM_2_MASK & alarm.alarm_flag) != 0) {
        return PsColor.PS_ALARM_RED
    } else if ((alarmMask.LO_ALARM_1_MASK & alarm.alarm_flag) != 0) {
        return PsColor.PS_WARNING_YELLOW
    } else if ((alarmMask.HI_ALARM_1_MASK & alarm.alarm_flag) != 0) {
        return PsColor.PS_WARNING_YELLOW
    }
}

// 撤销最后一次报警
const handleCancel = () => {
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id,
        clean_alarm_notice: '1'
    }
    cleanNodeAlarmFlag(params)
        .then(() => {
            ElMessage.success('撤销成功！')
        })
        .catch((e) => {
            console.log(e)
            ElMessage.error('撤销失败，请联系管理员！')
        })
}
const shortcuts = [
    {
        text: '昨天',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 1)
            return [start, end]
        }
    },
    {
        text: '三天前',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 3)
            return [start, end]
        }
    },
    {
        text: '七天前',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 7)
            return [start, end]
        }
    }
]
// 关闭弹窗
const close = () => {
    emit('close')
    tableData.value = []
    wsNode.value = null
    dateTimeRange.value = [
        startDateTimeText(new Date().setDate(new Date().getDate() - 1)),
        endDateTimeText(new Date())
    ]
}
</script>

<style lang="scss" scoped></style>
