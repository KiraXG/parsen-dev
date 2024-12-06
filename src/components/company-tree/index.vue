<template>
    <ps-tree
        :loading="treeLoading"
        :filterText="filterText"
        :treeData="treeData"
        :showCheckbox="showCheckbox"
        :filterNodeMethod="filterCompanyTreeFunc"
        :handleNodeClick="companyTreeNodeClick"
        :handleCheckboxClick="companyTreeNodeCheck"
    >
        <!-- 图标 -->
        <template #icon="{ icon }">
            <el-icon :size="16">
                <component
                    :is="icon.type === 'c' ? 'House' : 'Grid'"
                    :color="icon.type === 'c' ? '#146e00' : '#007dff'"
                />
            </el-icon>
        </template>
        <!-- 名称 -->
        <template #label="{ label }">
            <span
                :style="{ color: label.type === 'c' ? '#146e00' : '#007dff', fontSize: '16px' }"
                >{{ label.type === 'c' ? label.company_name : label.project_name }}</span
            >
        </template>
    </ps-tree>
</template>

<script setup lang="ts">
import {
    getCompanyTree,
    getCompanyProjects,
    getProjectsNodes,
    getCompanysProjects
} from '@/api/home'
import { ref, reactive } from 'vue'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

const props = defineProps({
    filterText: {
        type: String,
        default: ''
    },
    // 	节点是否可被选择
    showCheckbox: {
        type: Boolean,
        default: true
    }
})

// 定义emit方法
const emit = defineEmits<{
    getTreeData: [{ treeData: object[]; companyCount: number; itemCount: number }]
    getNodeClickData: [{ checkData: object; curCheckData: object[]; alarmCount: number }]
    dataLoading: [{ loading: object }]
    getTreeNodeClick: [{ project: object }]
}>()

// #region ********** start 处理左侧树列表数据 **********
const treeData: any = ref([]) // 树数据

// echarts 图表用到的数据
const companyCount: any = ref(0) // 公司总数
const itemCount: any = ref(0) // 项目总数
const alarmCount: any = ref(0) // 仪表总数

// 组装树
const treeLoading = ref(false)
const getTreeData = async () => {
    treeLoading.value = true
    // 请求接口获取数据
    const params = {
        access_token: userStore.token,
        company_id: userStore.userInfo.company_id
    }
    const res: any = await getCompanyTree(params)
    if (!res.company_tree) return
    // 深拷贝
    const resTree: any = reactive([JSON.parse(JSON.stringify(res.company_tree))])
    // 组装树
    assembleTree(resTree)
    console.log(resTree)
    treeData.value = resTree
    treeLoading.value = false
}

// 递归遍历
const assembleTree = (tree: any) => {
    if (tree.length) {
        tree.forEach((item: any) => {
            item.type = 'c'
            item.id = item.company_id
            companyCount.value += 1
            if (props.showCheckbox) {
                addProjectsToCompany(item)
            }
            if (item.children) assembleTree(item.children)
        })
    }
}

// 将查询到的数据添加到数组中
const addProjectsToCompany = async (child: any) => {
    const data = {
        access_token: userStore.token,
        company_id: child.company_id
    }
    const res: any = await getCompanyProjects(data)
    for (let item of res.project_list) {
        const projectNode = {
            ...item,
            id: 'c_' + child.company_id + '_p_' + item.project_id, //为了工程ID与公司ID不重复,工程ID加上 p_ 前缀
            company_name: child.company_name,
            label: item.project_name,
            type: 'p'
        }
        child.children.push(projectNode)
        itemCount.value += 1
        emit('getTreeData', { treeData, companyCount, itemCount })
    }
}

getTreeData()
// #endregion ********** end 获取左侧树列表数据 **********

// #region  ********** start 点击多选框的方法 **********
// 点击节点后请求到的数据{ id: list }
const checkData: any = reactive({})
// 整合点击节点后请求到的数据[ list ]
const curCheckData: any = ref([])
// 请求过的节点[id]
const nodeChecked: any = ref([])

// 请求数据时图表加载样式
const loading = ref(false)
const companyTreeNodeCheck = async (_company: any, check: any) => {
    loading.value = true
    emit('dataLoading', { loading })
    // 过滤类型为p的节点 [list]
    const curCompanyChecked = check.checkedNodes.filter((item: any) => item.type === 'p')
    // console.log('当前点击类型为p的节点', curCompanyChecked)
    // 当前点击的p节点id [id]
    const curNodeCheckId = curCompanyChecked.map((item: any) => item.id)
    // console.log('当前点击的p节点id', curNodeCheckId)

    // 找出未请求过的节点 [id]
    const noRequestedNode = curNodeCheckId.filter((item: any) => !nodeChecked.value.includes(item))
    // console.log('找出未请求过的节点', noRequestedNode)

    // 未请求的节点去请求
    const filterCompanyChecked = curCompanyChecked.filter((item: any) =>
        noRequestedNode.includes(item.id)
    )
    // console.log('未请求的节点去请求', filterCompanyChecked)
    for (let item of filterCompanyChecked) {
        // 请求接口
        const params = {
            access_token: userStore.token,
            project_list: JSON.stringify([item])
        }
        const res: any = await getProjectsNodes(params)
        // 推送到点击过的合集里
        checkData[item.id] = res.node_list
    }
    // console.log('每个节点请求到的数据{ id: list }', checkData)
    // 未请求过的节点id推送到合集中
    nodeChecked.value.push(...noRequestedNode)
    // console.log('节点id合集', nodeChecked.value)
    // 当前点击的仪表总数
    alarmCount.value = 0
    curCheckData.value = []
    for (let item of curNodeCheckId) {
        curCheckData.value.push(...checkData[item])
        alarmCount.value += checkData[item].length
    }
    console.log('当前点击project列表', curCheckData.value)
    loading.value = false
    emit('dataLoading', { loading })
    emit('getNodeClickData', { checkData, curCheckData, alarmCount })
}
// #endregion ********** end 点击多选框的方法 **********

// 对树节点进行筛选时执行的方法
const filterCompanyTreeFunc = (value: any, data: any) => {
    if (!value) return true
    let t1 = false
    if (data.company_name != null) {
        t1 = data.company_name.indexOf(value) !== -1
    }
    let t2 = false
    if (data.project_name != null) {
        t2 = data.project_name.indexOf(value) !== -1
    }
    return t1 || t2
}

// 当节点被点击的时候触发
const companyTreeNodeClick = async (project: any) => {
    if (project.type === 'p') {
        emit('getTreeNodeClick', { project })
    }
    if (!props.showCheckbox) {
        loading.value = true
        emit('dataLoading', { loading })
        const params = {
            access_token: userStore.token,
            company_list: JSON.stringify([project])
        }
        getCompanysProjects(params).then((res: any) => {
            loading.value = false
            emit('getTreeNodeClick', { project: res.project_list })
            emit('dataLoading', { loading })
        })
    }
}
</script>

<style lang="scss" scoped></style>
