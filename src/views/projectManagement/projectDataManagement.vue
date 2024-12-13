<template>
    <div
        class="projectDataManagement-container"
        v-loading="loading"
        element-loading-text="正在加载数据，请稍等..."
    >
        <div class="projectDataManagement-left">
            <el-input
                class="filter-input"
                v-model="filterText"
                clearable
                placeholder="请输入关键字过滤"
            ></el-input>
            <company-tree
                ref="companyTree"
                class="companyTree"
                :filterText="filterText"
                :showCheckbox="false"
                @dataLoading="dataLoading"
                @getTreeNodeClick="getTreeNodeClick"
            ></company-tree>
        </div>
        <div class="projectDataManagement-right">
            <ps-search-table
                rowKey="node_id"
                :border="true"
                :labelWidth="100"
                :fieldLists="fieldLists"
                :tableData="_tableData"
            >
                <template #tableHeader>
                    <el-button icon="CirclePlus" type="primary" @click="handleAdd">{{
                        curProject.company_name
                            ? `在『 ${curProject.company_name} 』里添加工程`
                            : '请先点击左侧项目'
                    }}</el-button>
                </template>
                <template #operation="{ row }">
                    <el-button type="primary" link icon="Edit" size="small" @click="handleEdit(row)"
                        >编辑</el-button
                    ><el-popconfirm
                        placement="top"
                        confirm-button-text="是"
                        cancel-button-text="否"
                        icon="InfoFilled"
                        icon-color="#626AEF"
                        title="确定要删除吗？"
                        @confirm="handleDelete(row)"
                    >
                        <template #reference>
                            <span style="margin-left: 12px">
                                <el-button type="danger" link icon="Delete" size="small"
                                    >删除</el-button
                                ></span
                            >
                        </template>
                    </el-popconfirm>
                </template>
            </ps-search-table>
            <project-dialog
                :formFields="formFields"
                :openDialog="openDialog"
                :dialogHeader="dialogHeader"
                :rowData="rowData"
                :curProject="curProject"
                :curCheckData="curCheckData"
                :mode="mode"
                @confirm="confirm"
                @close="closeDialog"
            ></project-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import CompanyTree from '@/components/company-tree/index.vue'
import useUserStore from '@/store/modules/user'
import ProjectDialog from './project-dialog.vue'
import { deleteProject } from '@/api/projectManagement'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const userStore = useUserStore()
// 子组件
const companyTree: any = ref(null) // 包含子组件暴露的方法

// #region ********** start 左侧树方法 **********
const curCheckData: any = ref([]) // 当前点击节点的数据列表
const curProject: any = ref({}) // 当前点击的节点数据
const filterText: any = ref('') // 筛选数据

// 加载样式
const dataLoading = (params: any) => {
    loading.value = params.loading.value
}

// 点击树节点时传过来的数据
const getTreeNodeClick = (params: any) => {
    curProject.value = params.project
    curCheckData.value = params.projectList
    getTableData(curCheckData)
}
// #endregion ********** end 左侧树方法 **********

// #region ********** start 处理表格数据 **********
const tableData: any = ref([])
// 给表格传数据
const getTableData = (data: any) => {
    tableData.value = data.value
}
const _tableData = computed(() => tableData.value)

// 表格column
const fieldLists = reactive([
    {
        label: '所属公司',
        prop: 'company_name',
        minWidth: 120
    },
    {
        label: '项目名称',
        prop: 'project_name',
        search: {
            type: 'input',
            span: 1
        },
        minWidth: 200
    },
    {
        label: '项目说明',
        prop: 'project_desc',
        search: {
            type: 'input',
            span: 1
        },
        sortable: true,
        minWidth: 170
    },
    {
        label: '操作',
        prop: 'operation',
        type: 'operation',
        fixed: 'right',
        minWidth: 180
    }
])
// #endregion ********** end 处理表格数据 **********

// #region ********** start 处理表弹窗表单数据 **********
const dialogHeader: any = ref('') // 弹窗标题
const mode: any = ref('add') // 弹窗类型
const rowData: any = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗

// 当前form表单 column
const formFields: any = reactive([
    {
        label: '工程名称',
        prop: 'project_name',
        type: 'input',
        rules: [{ required: true, message: '请输入工程名称' }]
    },
    {
        label: '工程描述',
        prop: 'project_desc',
        type: 'input'
    }
])

// 新建
const handleAdd = () => {
    if (!JSON.stringify(curProject.value.company_name)) {
        ElMessage.error('请先点击左侧树目录！')
        return
    }
    dialogHeader.value = '新建'
    mode.value = 'add'
    openDialog.value = true
}

// 编辑
const handleEdit = (row: any) => {
    dialogHeader.value = '编辑'
    mode.value = 'edit'
    rowData.value = row
    openDialog.value = true
}

// 删除
const handleDelete = (row: any) => {
    const params = {
        access_token: userStore.token,
        project_id: row.project_id
    }
    deleteProject(params).then(() => {
        if (companyTree.value) companyTree.value.companyTreeNodeClick(curProject.value)
        ElMessage.success('删除成功')
    })
}

// 提交成功后重置参数
const confirm = () => {
    if (companyTree.value) companyTree.value.companyTreeNodeClick(curProject.value)
    closeDialog()
}

// 关闭弹窗
const closeDialog = () => {
    mode.value = 'add'
    openDialog.value = false
    dialogHeader.value = ''
    rowData.value = {}
}
// #endregion ********** end 处理表弹窗表单数据 **********
</script>

<style lang="scss" scoped>
.projectDataManagement-container {
    width: 100%;
    height: 100%;
    display: flex;

    .projectDataManagement-left {
        flex: 0 0 250px;
        margin-right: 5px;
        display: flex;
        flex-direction: column;

        .filter-input {
            flex: 0 0 36px;
            margin-bottom: 5px;
        }

        .companyTree {
            flex: 1;
            padding: 5px 0 5px 0;
            border: 1px rgba(0, 0, 0, 0.1) solid;
            border-radius: 5px;
        }

        .warning-button {
            width: 100%;
            margin: 5px 0;
            flex: 0 0 36px;
        }

        .alarm-preview {
            flex: 0 0 280px;
            padding: 0;
        }
    }

    .projectDataManagement-right {
        flex: 1;
        width: 80%;
        height: calc(100% - 85px);
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
