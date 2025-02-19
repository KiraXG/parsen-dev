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
            ref="ps_table"
            :tableData="tableData"
            :fieldLists="fieldLists"
            :border="true"
            :hasSelection="true"
            rowKey="alarmRowId"
            @getSelectedData="getSelectedData"
        >
            <template #tableHeader>
                <el-button type="primary" @click="clearAlarm">取消选中报警</el-button>
            </template>
            <template #detail="{ row }">
                <el-form label-position="left" inline style="padding-left: 20px">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="报警状态：">
                                <span>{{ row.alarmType }}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="参量类型：">
                                <span>{{ row.paramType }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="imei号：">
                                <span>{{ row.imei }}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="公司名称：">
                                <span>{{ row.company_name }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="项目名称：">
                                <span>{{ row.project_name }}</span>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="仪表名称：">
                                <span>{{ row.node_name }}</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </template>
        </ps-search-table>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cleanNodeAlarmFlag } from '@/api/realTimeData'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const props = defineProps({
    // 打开弹窗
    openDialog: {
        type: Boolean,
        default: false
    },
    // 弹窗标题
    dialogHeader: {
        type: String,
        default: '最新报警'
    },
    // form 表单 column
    formFields: {
        type: Array,
        default: []
    },
    // 当前行数据
    alarmTableData: {
        type: Object,
        default: () => {}
    }
})

const userStore = useUserStore()

const fieldLists = [
    {
        label: '详情',
        prop: 'detail',
        tableCellType: 'expand',
        fixed: true,
        minWidth: 50
    },
    {
        label: '日期',
        prop: 'curDate',
        minWidth: 120
    },
    {
        label: '工位号',
        prop: 'group',
        minWidth: 120
    },
    {
        label: '当前测量值',
        prop: 'curValue',
        minWidth: 100
    }
]

const tableData: any = ref([])
const open = () => {
    tableData.value = computed(() => props.alarmTableData).value
}

// 定义 emit 方法
const emit = defineEmits<{
    refresh: [] // 取消后刷新页面
    close: [] // 关闭弹窗
}>()

// 选中的数据
const selectedData: any = ref([])
const ps_table: any = ref(null)
const getSelectedData = (params: any) => {
    selectedData.value = params.selectedData.value
}

// 取消选中报警
const clearAlarm = () => {
    if (!selectedData.value.length) {
        ElMessage.error('请选择要取消报警的数据！')
        return
    }
    let i: any
    for (i of selectedData.value) {
        try {
            const params = {
                access_token: userStore.token,
                node_id: i.node_id,
                clean_alarm_pop: '1',
                clean_alarm_notice: '1'
            }
            cleanNodeAlarmFlag(params)
                .then(() => {
                    // 从表格中抹去
                    const hasIndex = tableData.value.filter((j: any) => i.node_id === j.node_id)
                    for (let m of hasIndex) {
                        const index = tableData.value.findIndex(
                            (j: any) => m.alarmRowId === j.alarmRowId
                        )
                        tableData.value.splice(index, 1)
                    }
                    ps_table.value.handleClearSelectedData()

                    emit('refresh')
                    ElMessage.success('取消成功')
                })
                .catch((e) => {
                    console.log(e)
                })
        } catch (e) {
            ElMessage.error('操作失败，请联系管理员')
        } finally {
        }
    }
}

// 关闭弹窗
const close = () => {
    emit('close')
    tableData.value = []
    selectedData.value = []
}
</script>

<style lang="scss" scoped>
::v-deep(.el-form-item__label) {
    color: #909399;
}
</style>
