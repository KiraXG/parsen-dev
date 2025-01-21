<template>
    <el-input
        v-if="hasFilter"
        class="filter-input"
        v-model="filterText"
        clearable
        placeholder="请输入关键字过滤"
    ></el-input>
    <ps-tree
        ref="companyTree"
        class="companyTree"
        :loading="treeLoading"
        :filterText="filterText"
        :treeData="showCheckbox ? treeData : noChildTreeData"
        :showCheckbox="showCheckbox"
        :filterNodeMethod="filterCompanyTreeFunc"
        :handleNodeClick="companyTreeNodeClick"
        :handleCheckboxClick="companyTreeNodeCheckWebsocket"
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
import {  getCompanysProjects } from '@/api/home'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import useUserStore from '@/store/modules/user'
import useCompanyTreeStore from '@/store/modules/company-tree'
import { storeToRefs } from 'pinia'

const props = defineProps({
    // 是否有过滤框
    hasFilter: {
        type: Boolean,
        default: true
    },
    // 	节点是否可被选择
    showCheckbox: {
        type: Boolean,
        default: true
    }
})

const userStore = useUserStore()
const companyTreeStore = useCompanyTreeStore()

// 解构store中的数据
const { treeData, noChildTreeData, treeLoading, companyCount, itemCount } = storeToRefs(
    companyTreeStore
) as any

const filterText = ref('') // 筛选数据

// 定义emit方法
const emit = defineEmits<{
    getTreeData: [{ treeData: object[]; companyCount: number; itemCount: number }]
    getNodeClickData: [
        {
            curCheckData?: object[]
            alarmCount?: number
            project?: object
            saveData?: object
            wsRefresh?: boolean
        }
    ]
    getNewNodeClickData: [{ curCheckData: object[] }]
    dataLoading: [{ loading: object }]
    getTreeNodeClick: [{ project: object; projectList?: object }]
    getHomeEchartsCount: [{ companyCount: any; itemCount: any }]
}>()

// 获取home echarts需要的数据
const getHomeEchartsCount = () => {
    emit('getHomeEchartsCount', { companyCount, itemCount })
}

getHomeEchartsCount()

// #region  ********** start 点击多选框的方法 **********
// 点击节点后请求到的数据{ id: list }
// const checkData: any = reactive({})
// 整合点击节点后请求到的数据[ ...list ]
const curCheckData: any = ref([])
// 请求过的节点[id]
// const nodeCheckedId: any = ref([])
// 当前勾选的id[id]
// const curNodeCheckedId: any = ref([])

const alarmCount: any = ref(0) // 仪表总数

// 保存勾选的数据event
const saveData: any = ref({})

// 请求数据时图表加载样式
const loading = ref(false)
// const companyTreeNodeCheck = async (project: any, check: any) => {
//     loading.value = true
//     emit('dataLoading', { loading })
//     // 过滤类型为p的节点 [list]
//     const curCompanyChecked = check.checkedNodes.filter((item: any) => item.type === 'p')
//     // console.log('当前点击类型为p的节点', curCompanyChecked)
//     // 当前点击的p节点id [id]
//     curNodeCheckedId.value = curCompanyChecked.map((item: any) => item.id)
//     // console.log('当前点击的p节点id', curNodeCheckedId.value)

//     // 找出未请求过的节点 [id]
//     const noRequestedNode = curNodeCheckedId.value.filter(
//         (item: any) => !nodeCheckedId.value.includes(item)
//     )
//     // console.log('找出未请求过的节点', noRequestedNode)

//     // 未请求的节点去请求
//     const filterCompanyChecked = curCompanyChecked.filter((item: any) =>
//         noRequestedNode.includes(item.id)
//     )
//     // 当前点击的仪表总数
//     saveData.value = {
//         project,
//         check
//     }
//     // console.log('未请求的节点去请求', filterCompanyChecked)
//     for (let item of filterCompanyChecked) {
//         // 请求接口
//         const params = {
//             access_token: userStore.token,
//             project_list: JSON.stringify([item])
//         }
//         const res: any = await getProjectsNodes(params)
//         // 推送到点击过的合集里
//         checkData[item.id] = res.node_list
//     }
//     // console.log('每个节点请求到的数据{ id: list }', checkData.value)
//     // 未请求过的节点id推送到合集中
//     nodeCheckedId.value.push(...noRequestedNode)
//     // console.log('节点id合集', nodeCheckedId.value)
//     // 当前点击的仪表总数
//     alarmCount.value = 0
//     curCheckData.value = []
//     for (let item of curNodeCheckedId.value) {
//         curCheckData.value.push(...checkData[item])
//         alarmCount.value += checkData[item].length
//     }
//     emit('getNodeClickData', { curCheckData, alarmCount, project, saveData })
//     // console.log('当前点击project列表', curCheckData.value)
//     loading.value = false
//     await nextTick()
//     companyTree.value!.setTreeSelectNode(saveData.value.check.checkedNodes)
//     emit('dataLoading', { loading })
// }
// #endregion ********** end 点击多选框的方法 **********

// #region  ********** start 点击多选框的方法 **********
const wsNode: any = ref(null)
const companyTreeNodeCheckWebsocket = async (project: any, check: any) => {
    if (!window.WebSocket) return
    // 创建websocket对象
    const wsUrl = 'wss://app.parsen.com.cn/ParsenHttpApiV030/com/finder/GetProjectsNodes'
    if (wsNode.value) wsNode.value.close()
    wsNode.value = new WebSocket(wsUrl)
    // console.log(wsNode.value)

    loading.value = true
    emit('dataLoading', { loading })
    // 过滤类型为p的节点 [list]
    const curCompanyChecked = check.checkedNodes.filter((item: any) => item.type === 'p')
    // console.log('当前点击类型为p的节点', curCompanyChecked)
    saveData.value = {
        project,
        check
    }
    // 当前表格数据
    curCheckData.value = []
    // 当前点击的仪表总数
    alarmCount.value = 0

    // 没有数据，归零
    if (!curCompanyChecked.length) {
        emit('getNodeClickData', { curCheckData, alarmCount, project, saveData })
        // console.log('当前点击project列表', curCheckData.value)
        loading.value = false
        companyTree.value!.setTreeSelectNode(saveData.value.check.checkedNodes)
        emit('dataLoading', { loading })
        return
    }

    // 请求接口
    const params = {
        access_token: userStore.token,
        project_list: curCompanyChecked,
        page_count: 8
    }
    // 发送数据
    wsNode.value.onopen = () => {
        wsNode.value.send(JSON.stringify(params))
    }
    wsNode.value.onmessage = (event: any) => {
        const res = JSON.parse(event.data)
        curCheckData.value.push(...res.node_list)
        alarmCount.value = curCheckData.value.length

        emit('getNodeClickData', { curCheckData, alarmCount, project, saveData })
        // console.log('当前点击project列表', curCheckData.value)
        loading.value = false
        companyTree.value!.setTreeSelectNode(saveData.value.check.checkedNodes)
        emit('dataLoading', { loading })

        // 向 websocket 服务器发送注册命令, 把目前正在显示的仪表列表告诉服务器
        if (res.command === 'end_node') {
            let nodeIdArr: any = []
            for (let item of curCheckData.value) {
                nodeIdArr.push(item.node_id)
            }
            const params = {
                company_id: userStore.userInfo.company_id,
                access_token: userStore.token,
                node_id_list: nodeIdArr
            }
            if (ws.value) ws.value.send(JSON.stringify(params))
        }
    }
}
// #endregion ********** end 点击多选框的方法 **********

// websocket
const ws: any = ref(null)
const initWebSocket = () => {
    if (window.WebSocket) {
        const wsUrl = 'wss://app.parsen.com.cn/ParsenHttpApiV030/com/finder/ReflashNodeDataListener'
        ws.value = new WebSocket(wsUrl)
        ws.value.onopen = (event: any) => {
            console.log('onopen', event)
        }
        ws.value.onmessage = (event: any) => {
            console.log('onmessage', event)
            let data: any = null
            try {
                data = JSON.parse(event.data)
                // 点击节点后请求到的数据{ id: list }
                for (let i of data.node_update_list) {
                    const index = curCheckData.value.findIndex((k: any) => k.node_id === i.node_id)
                    const updateValue = curCheckData.value[index]
                    if (index > -1) curCheckData.value.splice(index, 1, { ...updateValue, ...i })
                }
                emit('getNodeClickData', {
                    curCheckData,
                    alarmCount,
                    project: saveData.value.project,
                    saveData,
                    wsRefresh: true
                })
            } catch (e) {
                console.error(e)
            }
        }
    }
}

onMounted(() => {
    initWebSocket()
})

onBeforeUnmount(() => {
    ws.value?.close()
})

// 更新checkData列表数据
// const updateCheckData = async (project: any) => {
//     loading.value = true
//     emit('dataLoading', { loading })
//     // 请求接口
//     const params = {
//         access_token: userStore.token,
//         project_list: JSON.stringify([project])
//     }
//     const res: any = await getProjectsNodes(params)
//     // 更新对应的节点数据 {}
//     checkData[project.id] = res.node_list
//     // 更新当前点击数量的总数 []
//     curCheckData.value = []
//     for (let item of curNodeCheckedId.value) {
//         curCheckData.value.push(...checkData[item])
//     }
//     loading.value = false
//     emit('dataLoading', { loading })
//     emit('getNewNodeClickData', { curCheckData })
// }

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
            emit('getTreeNodeClick', { project, projectList: res.project_list })
            emit('dataLoading', { loading })
        })
    }
}

// 树ref
const companyTree: any = ref(null)

// 刷新后将已存储的节点再赋值回去
const setTreeSelectNode = (value: any) => {
    if (
        !localStorage.getItem(value) ||
        localStorage.getItem(value) === 'undefined' ||
        localStorage.getItem(value) === 'null'
    )
        return
    const saveData = JSON.parse(localStorage.getItem(value) as any)
    companyTreeNodeCheckWebsocket(saveData.project, saveData.check)
}

// 向父组件暴露方法
defineExpose({
    companyTreeNodeCheckWebsocket,
    companyTreeNodeClick,
    setTreeSelectNode
})
</script>

<style lang="scss" scoped></style>
