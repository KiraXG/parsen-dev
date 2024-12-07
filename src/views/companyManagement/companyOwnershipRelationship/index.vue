<template>
    <div style="height: 100%">
        <ps-search-table
            :hasSearch="false"
            :hasPagination="false"
            :loading="loading"
            :tableData="tableData"
            :fieldLists="fieldLists"
            :defaultExpandAll="true"
        >
            <!-- 操作 -->
            <template #operation="{ row }">
                <!-- 添加下属公司 -->
                <el-button type="primary" icon="CirclePlus" @click="addCompany(row)" size="small"
                    >添加下属公司</el-button
                >
                <!-- 删除归属关系 -->
                <el-popconfirm
                    confirm-button-text="是"
                    cancel-button-text="否"
                    icon="InfoFilled"
                    icon-color="#626AEF"
                    title="确定要删除吗？"
                    @confirm="deleteCompany(row)"
                >
                    <template #reference>
                        <span style="margin-left: 12px">
                            <el-button
                                v-if="!row.noDelete"
                                type="danger"
                                size="small"
                                icon="Delete"
                            >
                                删除归属关系
                            </el-button>
                        </span>
                    </template>
                </el-popconfirm>
            </template>
        </ps-search-table>
    </div>
    <company-dialog
        :openDialog="openDialog"
        :dialogHeader="dialogHeader"
        :rowData="rowData"
        @confirm="confirm"
        @close="closeDialog"
    ></company-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import CompanyDialog from './dialog.vue'
import { getCompanyTree } from '@/api/home'
import { removeOneSon } from '@/api/companyManagement'

const userStore = useUserStore()

const loading: any = ref(false) // 加载样式

// #region ********** start 处理表格数据 **********
const tableData: any = ref([]) // 表格数据
// 组装数据
const getTableData = async () => {
    loading.value = true
    // 请求接口获取数据
    const params = {
        access_token: userStore.token,
        company_id: userStore.userInfo.company_id
    }
    const res: any = await getCompanyTree(params)
    if (!res.company_tree) return
    // 深拷贝
    const resTree: any = reactive([JSON.parse(JSON.stringify(res.company_tree))])
    resTree[0].noDelete = true
    // 组装数据
    assembleTableData(resTree)
    tableData.value = resTree
    loading.value = false
}

// 递归遍历
const assembleTableData = (tree: any) => {
    if (tree.length) {
        tree.forEach((item: any) => {
            item.id = item.company_id
            if (item.children && item.children.length) {
                assembleTableData(item.children)
            } else {
                // 没有children删除关键字
                delete item.children
            }
        })
    }
}

getTableData()

// 表格column
const fieldLists = reactive([
    {
        label: '公司组织',
        prop: 'company_name',
        fixed: true,
        align: 'left',
        minWidth: 120
    },
    {
        label: '操作',
        prop: 'operation',
        type: 'operation',
        align: 'left',
        fixed: 'right',
        width: 260
    }
])
// #endregion ********** end 处理表格数据 **********

// 添加下属公司
const dialogHeader = ref('') // 弹窗标题
const rowData = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗
const addCompany = (row: any) => {
    dialogHeader.value = `为『 ${row.company_name} 』添加下属公司`
    rowData.value = row
    openDialog.value = true
}

// 删除归属关系
const deleteCompany = (row: any) => {
    const params = {
        access_token: userStore.token,
        son_id: row.company_id
    }
    removeOneSon(params).then(() => {
        getTableData()
        ElMessage.success('删除成功!')
    })
}

// 提交成功后重置参数
const confirm = () => {
    closeDialog()
    getTableData()
}

// 关闭弹窗
const closeDialog = () => {
    openDialog.value = false
    dialogHeader.value = ''
    rowData.value = {}
}
</script>

<style lang="scss" scoped></style>
