<template>
    <div style="height: calc(100% - 140px)">
        <ps-search-table
            rowKey="node_id"
            :border="true"
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
                {{ row.last_date ? formatDate(row.last_date, 'YYYY-MM-DD HH:mm:ss') : '- -' }}
            </template>
        </ps-search-table>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { formatDate } from '@/utils'
import { getSimInfo, companySim, allSimUpdate } from '@/api/SIMCardList'

const userStore = useUserStore()

// 获取SIM卡列表
const getSIMData = async () => {
    if (userStore.userInfo.company_id == '1') {
        const res: any = await getSimInfo()
        setTableData(res.sim_data)
    } else {
        const params = {
            company_id: userStore.userInfo.company_id
        }
        const res: any = await companySim(params)
        setTableData(res.sim_data)
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
            iccid: item.iccid,
            imei: item.imei,
            project: item.project_name,
            cpmpany: item.company_name,
            activate_time: item.activate_time,
            expiry_date: item.expiry_date,
            status: item.status,
            residue_flow: item.residue_flow,
            network_type: item.network_type,
            last_date: formatDate(item.last_date, 'YYYY-MM-DD HH:mm:ss')
        })
    })
    let str = `iccid,imei,项目名称,所属公司,激活时间,到期时间,状态,本月剩余流量,网络类型,上传时间\n`
    // 增加  为了不让表格显示科学计数法或者其他格式
    for (let i = 0; i < listData.length; i++) {
        for (const key in listData[i]) {
            str += `${listData[i][key] + '\t'},`
        }
        str += '\n'
    }
    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(str)
    // 通过创建a标签实现
    const link = document.createElement('a')
    link.href = uri
    // 对下载的文件命名
    link.download = 'sim卡信息.csv'
    link.click()
}

// 全部更新
const allUpdate = async () => {
    const res: any = await allSimUpdate()
    if (res.result == '1') {
        ElMessage({
            type: 'success',
            message: '更新成功'
        })
        getSIMData()
    } else {
        ElMessage({
            type: 'error',
            message: '更新失败'
        })
    }
}

// 表格column
const fieldLists = reactive([
    {
        label: 'imei',
        prop: 'imei',
        search: {
            type: 'input',
            span: 1
        },
        sortable: true,
        minWidth: 160
    },
    {
        label: 'iccid',
        prop: 'iccid',
        search: {
            type: 'input',
            span: 1
        },
        sortable: true,
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
        minWidth: 80
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
        minWidth: 100
    },
    {
        label: '剩余流量(MB)',
        prop: 'residue_flow',
        minWidth: 80
    },
    {
        label: '上传时间',
        prop: 'last_date',
        minWidth: 160
    }
])
</script>

<style lang="scss" scoped></style>
