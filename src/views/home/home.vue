<template>
    <div class="tree-table-container home-container">
        <div class="tree-table-left home-left">
            <company-tree
                ref="companyTree"
                :hasFilter="false"
                @dataLoading="dataLoading"
                @getHomeEchartsCount="getHomeEchartsCount"
                @getNodeClickData="getNodeClickData"
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
        <div class="tree-table-right home-right">
            <!-- echarts -->
            <div
                id="chartsContainer"
                class="chartsContainer"
                v-loading="loading"
                element-loading-text="正在加载数据，请稍等..."
            >
                <div v-for="item in chartsName" class="chartContainer" id="chartContainer">
                    <div :id="item" class="chart-items"></div>
                </div>
            </div>
            <!-- 高德地图 -->
            <div id="map_container" class="map_container"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CompanyTree from '@/components/company-tree/index.vue'
import { ref, reactive, onMounted, watch, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import useSettingStore from '@/store/modules/setting'
import * as echarts from 'echarts'
import { companyOption, itemOption, nodeOption, alarmOption, stateOption } from './home-charts'
import gdMap from '@/utils/gaode-map'
import { dragControllerDiv } from '@/utils'
import useCompanyTreeStore from '@/store/modules/company-tree'

// #region ********** start 处理左侧树 **********
const curCheckData: any = ref([]) // 当前点击节点的project总数
const companyCount: any = ref(0) // 仪表总数
const itemCount: any = ref(0) // 仪表总数
const alarmCount: any = ref(0) // 仪表总数

// 第一次进来时需要用
const companyTreeStore = useCompanyTreeStore()
watch(
    companyTreeStore,
    (val) => {
        companyCount.value = val.companyCount
        itemCount.value = val.itemCount
        draw()
    },
    { deep: true }
)

// 刷新页面后需要用
const getHomeEchartsCount = (val: any) => {
    companyCount.value = val.companyCount.value
    itemCount.value = val.itemCount.value
}

// 跳到该页面时要用
onActivated(() => {
    draw()
})

const $router = useRouter() // 路由名称
const routerName: any = $router.currentRoute.value.name
// 点击树的多选框传过来的数据
const getNodeClickData = (params: any) => {
    // 存储已选择的节点
    if (params.saveData) localStorage.setItem(routerName, JSON.stringify(params.saveData.value))
    curCheckData.value = params.curCheckData.value
    alarmCount.value = params.alarmCount.value
    draw()
}

const companyTree: any = ref(null)
onMounted(() => {
    // 刷新后将已存储的节点再赋值回去
    if (localStorage.getItem(routerName)) {
        companyTree.value.setTreeSelectNode(routerName)
    }
})

// 加载样式
const loading = ref(false)
const dataLoading = (params: any) => {
    loading.value = params.loading.value
}
// #endregion ********** end 处理左侧树 **********

// #region ********** start 处理echarts图表 **********
const chartsData: any = ref() // 图表数据arr
const chartsDom: any = reactive([]) // 图表dom arr
const chartsName: any = ['company', 'item', 'node', 'alarm', 'state']

// 初始化图表
const initCharts = () => {
    for (let item of chartsName) {
        chartsDom[item] = echarts.init(document.getElementById(item))
    }
    draw()
    window.addEventListener('resize', chartResize)
}

// echarts图表数据
const handleEchartsData = () => {
    let now = +new Date()
    let company = [{ name: '公司总数', value: companyCount.value }]
    let item = [{ name: '项目总数', value: itemCount.value }]
    let node = [{ name: '仪表总数', value: alarmCount.value }]
    // 仪表详情
    let alarm = [
        { name: '正常', value: alarmCount.value - getAlarmCount() },
        { name: '异常', value: getAlarmCount() }
    ]
    // 仪表状态
    let state = [
        { name: '在线', value: alarmCount.value - getOffline(now) },
        { name: '离线', value: getOffline(now) }
    ]
    chartsData.value = {
        company: companyOption(company),
        item: itemOption(item),
        node: nodeOption(node),
        alarm: alarmOption(alarm),
        state: stateOption(state)
    }
}

// 仪表异常
const getAlarmCount = () => {
    let number = 0
    for (let item of curCheckData.value) {
        if (item.alarm_pop != '0') number++
    }
    return number
}

// 仪表离线
const getOffline = (now: any) => {
    let offlineCount = 0
    let lastTime = null
    for (let item of curCheckData.value) {
        lastTime =
            item['node_data'] == null ? item['last_data_time_delete'] : item['node_data']['date']
        if ((now - +new Date(lastTime)) / 1000 / 60 > item['send_gap'] * 3) {
            offlineCount++
        }
    }
    return offlineCount
}

// 图表自适应大小
const chartResize = () => {
    draw()
    for (let chart of Object.values(chartsDom)) {
        ;(chart as any).resize()
    }
}

// 渲染数据
const draw = () => {
    handleEchartsData()
    for (let item of chartsName) {
        chartsDom[item].setOption(chartsData.value[item])
    }
}
// #endregion ********** end 处理echarts图表 **********

let map = ref(null)
const loadMap = () => {
    gdMap.then((AMap) => {
        map.value = new AMap.Map('map_container', {
            // 设置地图容器id
            viewMode: '3D', // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923] // 初始化地图中心点位置
        })
    })
}

// 拖拽改变容器大小
const settingStore = useSettingStore()
watch(
    settingStore,
    (val) => {
        dragControllerDiv('home-left', 'home-right', 'home-container', val.isCollapse)
    },
    { deep: true }
)

onMounted(() => {
    dragControllerDiv('home-left', 'home-right', 'home-container', settingStore.isCollapse)
    initCharts()
    loadMap()
})
</script>

<style lang="scss" scoped>
.home-container {
    .home-right {
        .chartsContainer {
            width: 100%;
            height: 50%;
            padding-bottom: 5px;
            display: flex;

            .chartContainer {
                margin-right: 5px;
                width: 20%;
                height: 100%;

                .chart-items {
                    margin: 0 auto;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                    width: 100%;
                    height: 100%;
                }
            }
        }

        .map_container {
            width: 100%;
            height: 50%;
            border-radius: 5px;
        }
    }
}
</style>
