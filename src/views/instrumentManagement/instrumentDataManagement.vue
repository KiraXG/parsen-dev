<template>
    <div class="tree-table-container instrumentDataManagement-container">
        <div class="tree-table-left instrumentDataManagement-left">
            <company-tree
                ref="companyTree"
                @dataLoading="dataLoading"
                @getTreeNodeClick="getTreeNodeClick"
                @getNodeClickData="getNodeClickData"
                @getNewNodeClickData="getNewNodeClickData"
            ></company-tree>
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
        <div class="tree-table-right instrumentDataManagement-right">
            <ps-search-table
                rowKey="node_id"
                :loading="loading"
                :border="true"
                :fieldLists="fieldLists"
                :tableData="_tableData"
            >
                <template #tableHeader>
                    <el-button icon="CirclePlus" type="primary" @click="addInstrumentToProject">{{
                        curProject.label
                            ? `在 『 ${curProject.label} 』 工程里添加仪表`
                            : '请先点击左侧项目'
                    }}</el-button>
                    <el-button icon="CirclePlus" type="primary" @click="addSIMToProject">{{
                        curProject.label
                            ? `在 『 ${curProject.label} 』 工程里添加SIM卡`
                            : '请先点击左侧项目'
                    }}</el-button>
                </template>
                <!-- 数据 -->
                <template #node_data="{ row }">
                    <div v-if="row.node_data">
                        <div class="tag-container" v-for="(item, index) in nodeData(row.node_data)">
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    margin-bottom: 5px;
                                "
                            >
                                <el-tag :key="index" :type="tagType(item)" style="height: 30px">{{
                                    item.name
                                }}</el-tag>
                                <el-button @click="changeValue(item)">{{
                                    curTableChangeValue[`${item.id}_${item.type}`] ?? 1
                                }}</el-button>
                                <el-button @click="submitChangeValue(item)">确认</el-button>
                            </div>
                        </div>
                    </div>
                </template>

                <template #operation="{ row }">
                    <div>
                        <el-button type="primary" link icon="Edit" @click="handleEdit(row)"
                            >修改信息</el-button
                        >
                        <el-popconfirm
                            confirm-button-text="是"
                            cancel-button-text="否"
                            icon="InfoFilled"
                            icon-color="#626AEF"
                            title="确定要删除吗？"
                            placement="top"
                            @confirm="handleDelete(row)"
                        >
                            <template #reference>
                                <span>
                                    <el-button type="danger" icon="Delete" link>删除仪表</el-button>
                                </span>
                            </template>
                        </el-popconfirm>
                    </div>
                    <div>
                        <el-button type="danger" icon="Odometer" link @click="offsetAndZero(row)"
                            >对表调零</el-button
                        >
                        <el-button
                            type="danger"
                            icon="EditPen"
                            link
                            @click="updateImei(row)"
                            style="margin-left: 0"
                            >替换更新</el-button
                        >
                    </div>
                </template>
            </ps-search-table>
            <instrument-dialog
                :formFields="formFields"
                :openDialog="openDialog"
                :dialogHeader="dialogHeader"
                :rowData="rowData"
                :curProject="curProject"
                :curCheckData="curCheckData"
                :mode="mode"
                @confirm="confirm"
                @close="closeDialog"
            ></instrument-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import CompanyTree from '@/components/company-tree/index.vue'
import { UNIT_TABLE, tagTypes } from '@/utils'
import { deleteNode, showControl } from '@/api/instrumentManagement'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import InstrumentDialog from './instrument-dialog.vue'
import useSettingStore from '@/store/modules/setting'
import { dragControllerDiv } from '@/utils'

const loading = ref(false)
const userStore = useUserStore()

// #region ********** start 左侧树方法 **********
const curCheckData: any = ref([]) // 当前点击节点的project总数
const curCheckNodeData: any = ref({}) // 当前点击节点的project
const curProject: any = ref({}) // 当前点击节点的project名称

// 路由名称
const $router = useRouter()
const routerName: any = $router.currentRoute.value.name
// 点击树的多选框传过来的数据
const getNodeClickData = (params: any) => {
    // 存储已选择的节点
    if (params.saveData) localStorage.setItem(routerName, JSON.stringify(params.saveData.value))
    curCheckData.value = params.curCheckData.value
    curProject.value = params.project
    setTableData(curCheckData)
}

// 拖拽改变容器大小
const settingStore = useSettingStore()
watch(
    settingStore,
    (val) => {
        dragControllerDiv(
            'instrumentDataManagement-left',
            'instrumentDataManagement-right',
            'instrumentDataManagement-container',
            val.isCollapse
        )
    },
    { deep: true }
)

const companyTree: any = ref(null) // 包含子组件暴露的方法
onMounted(() => {
    dragControllerDiv(
        'instrumentDataManagement-left',
        'instrumentDataManagement-right',
        'instrumentDataManagement-container',
        settingStore.isCollapse
    )
    // 刷新后将已存储的节点再赋值回去
    if (localStorage.getItem(routerName)) {
        companyTree.value.setTreeSelectNode(routerName)
    }
})

// 更新后树的多选框传过来的数据
const getNewNodeClickData = (params: any) => {
    curCheckData.value = params.curCheckData.value
    setTableData(curCheckData)
}

// 加载样式
const dataLoading = (params: any) => {
    loading.value = params.loading.value
}

// 点击树节点时传过来的数据
const getTreeNodeClick = (params: any) => {
    curCheckNodeData.value = params.projectList
    curProject.value = params.project
}
// #endregion ********** end 左侧树方法 **********

// #region ********** start 处理表弹窗表单数据 **********
const dialogHeader: any = ref('') // 弹窗标题
const mode: any = ref('add_instrument') // 弹窗类型
const rowData: any = ref({}) // 点击当前行的数据
const openDialog: any = ref(false) // 打开弹窗

// 当前form表单 column
const formFields: any = ref([])
// 添加仪表 form
const instrumentField = reactive([
    {
        label: '仪表名称',
        prop: 'node_name',
        type: 'input',
        rules: [
            { required: true, message: '请输入仪表名称' },
            { min: 3, max: 15, message: '请输入3-15个字符' }
        ]
    },
    {
        label: 'IMEI号',
        prop: 'imei',
        type: 'input',
        placeholder: '多台sim卡号以英文逗号分隔',
        rules: [
            { required: true, message: '请输入IMEI号' },
            { min: 15, message: '请输入至少15个字符' }
        ]
    },
    {
        label: '工位号',
        prop: 'group',
        type: 'input'
    }
])

// 添加SIM form
const SIMField = reactive([
    {
        label: 'SIM',
        prop: 'sim',
        type: 'input',
        placeholder: '多台sim卡号以英文逗号分隔',
        rules: [
            { required: true, message: '请输入仪表名称' },
            { min: 3, max: 15, message: '请输入3-15个字符' }
        ]
    },
    {
        label: 'IMEI',
        prop: 'imei',
        type: 'input',
        placeholder: '多台imei以英文逗号分隔',
        rules: [
            { required: true, message: '请输入IMEI号' },
            { min: 15, message: '请输入至少15个字符' }
        ]
    }
])

// 添加SIM form
const editField = reactive([
    {
        label: '仪表名称',
        prop: 'node_name',
        type: 'input'
    },
    {
        label: 'IMEI号',
        prop: 'imei',
        type: 'input'
    },
    {
        label: '工位号',
        prop: 'group',
        type: 'input'
    },
    {
        label: '采样周期',
        prop: 'sample_gap',
        type: 'input'
    },
    {
        label: '上传周期',
        prop: 'send_gap',
        type: 'input'
    },
    {
        label: '报警手机',
        prop: 'node_tel',
        type: 'input',
        tooltip: '仅限中国'
    }
])

// 更新imei form
const imeiField = reactive([
    {
        label: '旧imei',
        prop: 'imei',
        type: 'input',
        disabled: true
    },
    {
        label: '新imei',
        prop: 'Nimei',
        type: 'input',
        rules: [
            { required: true, message: '请输入IMEI号' },
            { min: 15, message: '请输入至少15个字符' }
        ]
    }
])

// 添加仪表
const addInstrumentToProject = () => {
    if (!curProject.value.label) {
        ElMessage.error('请先点击左侧项目！')
        return
    }
    formFields.value = instrumentField
    mode.value = 'add_instrument'
    dialogHeader.value = `在 『 ${curProject.value.label} 』 工程里添加仪表`
    openDialog.value = true
}

// 添加SIM卡
const addSIMToProject = () => {
    if (!curProject.value.label) {
        ElMessage.error('请先点击左侧项目！')
        return
    }
    formFields.value = SIMField
    mode.value = 'add_SIM'
    dialogHeader.value = `在 『 ${curProject.value.label} 』 工程里添加SIM卡`
    openDialog.value = true
}

// 修改信息
const handleEdit = (row: any) => {
    formFields.value = editField
    mode.value = 'edit'
    rowData.value = row
    dialogHeader.value = `修改『 ${rowData.value.node_name} 』信息`
    openDialog.value = true
}

// 对表调零
const offsetAndZero = (row: any) => {
    formFields.value = []
    mode.value = 'offsetAndZero'
    rowData.value = row
    dialogHeader.value = `远程控制，仪表名称:『 ${rowData.value.node_name} 』`
    openDialog.value = true
}

// 替换更新
const updateImei = (row: any) => {
    formFields.value = imeiField
    mode.value = 'update_imei'
    rowData.value = row
    dialogHeader.value = `更新 『 ${rowData.value.node_name} 』 工程里的IMEI号`
    openDialog.value = true
}

// 删除仪表
const handleDelete = (row: any) => {
    const params = {
        access_token: userStore.token,
        node_id: row.node_id
    }
    deleteNode(params).then(() => {
        if (companyTree.value) companyTree.value.updateCheckData(curProject.value)
        ElMessage.success('删除成功')
    })
}

// 提交成功后重置参数
const confirm = () => {
    if (companyTree.value) companyTree.value.updateCheckData(curProject.value)
    closeDialog()
}

// 关闭弹窗
const closeDialog = () => {
    mode.value = 'add_instrument'
    openDialog.value = false
    dialogHeader.value = ''
    rowData.value = {}
}
// #endregion ********** end 处理表弹窗表单数据 **********

// #region ********** start 处理表格数据 **********
const tableData: any = ref([])
// 给表格传数据
const setTableData = (data: any) => {
    tableData.value = data.value
}
const _tableData = computed(() => tableData.value)

// 表格column
const fieldLists = reactive([
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
        minWidth: 170
    },
    {
        label: '工位号',
        prop: 'group',
        minWidth: 100
    },
    {
        label: '显示',
        prop: 'node_data',
        minWidth: 200
    },
    {
        label: '操作',
        prop: 'operation',
        type: 'operation',
        fixed: 'right',
        minWidth: 190
    }
])

/* 表格——内容 */
// tag内容
const nodeData = (data: any) => {
    const tagContent = []
    for (let i of data.line_datas) {
        for (let j of UNIT_TABLE) {
            if (i.unit == j.type) {
                tagContent.push({ name: j.desc, type: i.node_line, id: i.node_id, value: 1 })
            }
        }
    }
    return tagContent
}

// 处理点击内容按钮
const curTableChangeValue: any = reactive({})
const changeValue = (item: any) => {
    curTableChangeValue[`${item.id}_${item.type}`] =
        curTableChangeValue[`${item.id}_${item.type}`] === 0 ? 1 : 0
}

// 表格确认按钮
const submitChangeValue = (item: any) => {
    const params = {
        access_token: userStore.token,
        Id: item.id,
        Line: item.type,
        Show: curTableChangeValue[`${item.id}_${item.type}`]
    }
    showControl(params).then((res: any) => {
        if (res.result == '1') {
            ElMessage.success('修改成功!')
        } else {
            ElMessage.error('修改失败!')
        }
    })
}

// tag渲染
const tagType = (item: any) => {
    return tagTypes[item.type]
}

// #endregion ********** end 处理表格数据 **********
</script>

<style lang="scss" scoped>
.tag-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
