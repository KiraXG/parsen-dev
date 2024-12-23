<template>
    <ps-search-table
        rowKey="node_id"
        :border="true"
        :loading="loading"
        :fieldLists="fieldLists"
        :tableData="tableData"
        @getCurTableData="getCurTableData"
    >
        <!-- 表格上方按钮 -->
        <template #tableHeader>
            <el-button type="primary" @click="allUpdate">全部更新</el-button>
            <el-button @click="outputList">导出</el-button>
        </template>
        <!-- 上传时间 -->
        <template #last_date="{ row }">
            {{ row.last_date ? formatDate(row.last_date) : '- -' }}
        </template>
    </ps-search-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { formatDate, exportExcel } from '@/utils'
import { getSimInfo, companySim, allSimUpdate } from '@/api/SIMCardList'

const userStore = useUserStore()
const loading: any = ref(false) // 加载

// 获取SIM卡列表
const getSIMData = () => {
    loading.value = true
    if (userStore.userInfo.company_id == '1') {
        // 管理员
        getSimInfo()
            .then((res: any) => {
                setTableData(res.result)
            })
            .finally(() => {
                loading.value = false
            })
    } else {
        // 个人
        const params = {
            company_id: userStore.userInfo.company_id
        }
        companySim(params)
            .then((res: any) => {
                setTableData(res.sim_data)
            })
            .finally(() => {
                loading.value = false
            })
    }
}
getSIMData()

// 给表格传数据
const tableData: any = ref([])
const setTableData = (data: any) => {
    tableData.value = data
}

// 获取当前筛选过后的数据
const curTableData = ref([])
const getCurTableData = (params: any) => {
    curTableData.value = params.curTableData.value
}

// 导出按钮
const outputList = () => {
    const listData: any = []
    curTableData.value.forEach((item: any) => {
        listData.push({
            imei: item.imei || '',
            iccid: item.iccid || '',
            project_name: item.project_name || '',
            company_name: item.company_name || '',
            status: item.status || '',
            network_type: item.network_type || '',
            activate_time: item.activate_time || '',
            expiry_date: item.expiry_date || '',
            residue_flow: item.residue_flow || '',
            last_date: formatDate(item.last_date)
        })
    })
    const fileName = `SIM卡列表_${formatDate(new Date())}`
    const excelCellWidth = [8, 9, 8, 6, 3, 3, 5, 5, 5, 9]
    exportExcel(fileName, listData, fieldLists, excelCellWidth)
}

// 全部更新
const allUpdate = async () => {
    const res: any = await allSimUpdate()
    if (res.result == '1') {
        ElMessage.success('更新成功')
        getSIMData()
    } else {
        ElMessage.error('更新失败')
    }
}

// 预设时间
const shortcutsBefore = [
    {
        text: '【今天之前】',
        value: () => {
            return
        }
    },
    {
        text: '1个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            return [start, end]
        }
    },
    {
        text: '3个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            return [start, end]
        }
    },
    {
        text: '6个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 6)
            return [start, end]
        }
    },
    {
        text: '一年内',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 12)
            return [start, end]
        }
    }
]
const shortcutsAfter = [
    {
        text: '【今天之后】',
        value: () => {
            return
        }
    },
    {
        text: '1个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            end.setMonth(start.getMonth() + 1)
            return [start, end]
        }
    },
    {
        text: '3个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            end.setMonth(start.getMonth() + 3)
            return [start, end]
        }
    },
    {
        text: '6个月内',
        value: () => {
            const end = new Date()
            const start = new Date()
            end.setMonth(start.getMonth() + 6)
            return [start, end]
        }
    },
    {
        text: '一年内',
        value: () => {
            const end = new Date()
            const start = new Date()
            end.setMonth(start.getMonth() + 12)
            return [start, end]
        }
    }
]

// 表格column
const fieldLists = ref([
    {
        label: 'imei',
        prop: 'imei',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 160
    },
    {
        label: 'iccid',
        prop: 'iccid',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 200
    },
    {
        label: '项目',
        prop: 'project_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 120
    },
    {
        label: '公司',
        prop: 'company_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 100
    },
    {
        label: '状态',
        prop: 'status',
        minWidth: 80
    },
    {
        label: '类型',
        prop: 'network_type',
        minWidth: 80
    },
    {
        label: '激活日',
        prop: 'activate_time',
        minWidth: 100
    },
    {
        label: '到期日',
        prop: 'expiry_date',
        hasFilter: true,
        filterType: 'daterange',
        shortcuts: shortcutsAfter,
        sortable: 'custom',
        minWidth: 115
    },
    {
        label: '剩余流量(MB)',
        prop: 'residue_flow',
        minWidth: 80
    },
    {
        label: '上传时间',
        prop: 'last_date',
        hasFilter: true,
        filterType: 'daterange',
        shortcuts: shortcutsBefore,
        sortable: 'custom',
        minWidth: 160
    }
])
</script>

<style lang="scss" scoped></style>
