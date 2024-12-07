<template>
    <div style="height: calc(100% - 140px)">
        <ps-search-table
            :border="true"
            :loading="loading"
            :fieldLists="fieldLists"
            :tableData="_tableData"
            :labelWidth="100"
        >
            <!-- 新建 -->
            <template #tableHeader>
                <el-button type="primary" @click="handleAdd">新建</el-button>
            </template>
            <!-- 管仪表 -->
            <template #manage_node="{ row }">
                <el-tag :type="row.manage_node == 1 ? 'success' : 'danger'">{{
                    row.manage_node == 1 ? '是' : '否'
                }}</el-tag>
            </template>
            <!-- 管用户 -->
            <template #manage_company="{ row }">
                <el-tag :type="row.manage_company == 1 ? 'success' : 'danger'">{{
                    row.manage_company == 1 ? '是' : '否'
                }}</el-tag>
            </template>
            <template #operation="{ row }">
                <!-- 编辑 -->
                <el-button type="primary" icon="Edit" size="small" @click="handleEdit(row)"
                    >编辑</el-button
                >
                <!-- 删除 -->
                <el-popconfirm
                    confirm-button-text="是"
                    cancel-button-text="否"
                    icon="InfoFilled"
                    icon-color="#626AEF"
                    title="确定要删除吗？"
                    @confirm="handleDelete(row)"
                >
                    <template #reference>
                        <span style="margin-left: 12px">
                            <el-button type="danger" icon="Delete" size="small">删除</el-button>
                        </span>
                    </template>
                </el-popconfirm>
            </template>
        </ps-search-table>
        <company-dialog
            :formFields="formFields"
            :openDialog="openDialog"
            :dialogHeader="dialogHeader"
            :rowData="rowData"
            :mode="mode"
            @confirm="confirm"
            @close="closeDialog"
        ></company-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import useUserStore from '@/store/modules/user'
import { getCompanyList, removeCompany } from '@/api/companyManagement'
import CompanyDialog from './dialog.vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// #region ********** start 处理表格数据 **********
const loading: any = ref(false) // 加载
const getTableData = async () => {
    loading.value = true
    const params = {
        access_token: userStore.token,
        company_id: userStore.userInfo.company_id
    }
    getCompanyList(params)
        .then((res: any) => {
            setTableData(res.company_list)
        })
        .finally(() => {
            loading.value = false
        })
}

getTableData()

const tableData: any = ref([])
// 给表格传数据
const setTableData = (data: any) => {
    tableData.value = data
}
const _tableData = computed(() => tableData.value)

// 表格column
const fieldLists = reactive([
    {
        label: '账号名称',
        prop: 'account',
        fixed: true,
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 120
    },
    {
        label: '公司简称',
        prop: 'company_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 140
    },
    {
        label: '公司全称',
        prop: 'company_full_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 180
    },
    {
        label: '密码',
        prop: 'password',
        sortable: true,
        minWidth: 150
    },
    {
        label: '绑定电话',
        prop: 'tel',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 140
    },
    {
        label: '管仪表',
        prop: 'manage_node',
        minWidth: 80
    },
    {
        label: '管用户',
        prop: 'manage_company',
        minWidth: 80
    },
    {
        label: '操作',
        prop: 'operation',
        type: 'operation',
        fixed: 'right',
        minWidth: 170
    }
])
// #endregion ********** end 处理表格数据 **********

// #region ********** start 处理表弹窗表单数据 **********
const dialogHeader = ref('') // 弹窗标题
const mode = ref('add') // 弹窗类型
const rowData = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗

// 当前form表单 column
const formFields: any = ref([])

// 新建表单 column
const addFormFields = [
    {
        label: '公司账号',
        prop: 'account',
        type: 'input',
        rules: [{ required: true, message: '请输入公司账号' }]
    },
    {
        label: '登录密码',
        prop: 'password',
        type: 'input',
        rules: [{ required: true, message: '请输入登录密码' }]
    },
    {
        label: '公司全称',
        prop: 'company_full_name',
        type: 'input',
        rules: [{ required: true, message: '请输入公司全称' }]
    },
    {
        label: '公司简称',
        prop: 'company_name',
        type: 'input',
        rules: [{ required: true, message: '请输入公司简称' }]
    },
    {
        label: '绑定手机号',
        prop: 'tel',
        type: 'input'
    }
]

// 编辑表单 column
const editFormFields = [
    {
        label: '登录账号',
        prop: 'account',
        type: 'input',
        rules: [{ required: true, message: '请输入登录账号' }]
    },
    {
        label: '公司全称',
        prop: 'company_full_name',
        type: 'input',
        rules: [{ required: true, message: '请输入公司全称' }]
    },
    {
        label: '公司简称',
        prop: 'company_name',
        type: 'input',
        rules: [{ required: true, message: '请输入公司简称' }]
    },
    {
        label: '绑定手机号',
        prop: 'tel',
        type: 'input'
    },
    {
        label: '管理用户',
        prop: 'manage_company',
        type: 'select',
        options: [
            { label: '可以', value: '1' },
            { label: '不可以', value: '0' }
        ]
    },
    {
        label: '管理仪表',
        prop: 'manage_node',
        type: 'select',
        options: [
            { label: '可以', value: '1' },
            { label: '不可以', value: '0' }
        ]
    }
]

// 新建
const handleAdd = () => {
    formFields.value = addFormFields
    dialogHeader.value = '新建'
    mode.value = 'add'
    openDialog.value = true
}

// 编辑
const handleEdit = (row: any) => {
    formFields.value = editFormFields
    dialogHeader.value = '编辑'
    mode.value = 'edit'
    rowData.value = row
    openDialog.value = true
}

// 删除
const handleDelete = (row: any) => {
    const params = {
        access_token: userStore.token,
        company_id: row.company_id
    }
    removeCompany(params).then(() => {
        getTableData()
        ElMessage.success('删除成功')
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
// #endregion ********** end 处理表弹窗表单数据 **********
</script>

<style lang="scss" scoped></style>
