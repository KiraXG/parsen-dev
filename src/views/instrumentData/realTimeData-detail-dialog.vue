<template>
    <ps-dialog
        :width="'80%'"
        :dialogHeader="dialogHeader"
        :openDialog="openDialog"
        :isShowConfirm="false"
        :isEdit="false"
        :open="open"
        :dialogInnerStyle="dialogInnerStyle"
        @close="close"
    >
        <div class="card dialog-container">
            <!-- 基本信息 -->
            <div class="dialog-form">
                <el-row>
                    <el-col :span="8">
                        <div class="card dialog-cell"><span>IMEI: </span>{{ rowData.imei }}</div>
                    </el-col>
                    <el-col :span="8">
                        <div class="card dialog-cell"><span>工位号: </span>{{ rowData.group }}</div>
                    </el-col>
                    <el-col :span="8">
                        <div class="card dialog-cell">
                            <span>SIM卡号: </span>{{ rowData.iccid }}
                        </div>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="8">
                        <div class="card dialog-cell">
                            <span>最后更新时间:</span>
                            {{ rowData.node_data ? formatDate(rowData.node_data.date) : '- -' }}
                        </div>
                    </el-col>
                    <el-col :span="8">
                        <div class="card dialog-cell">
                            <span>连网状态:</span>
                            {{
                                rowData.node_data
                                    ? (+new Date() - +new Date(rowData.node_data.date)) /
                                          1000 /
                                          60 >
                                      rowData.send_gap * 3
                                        ? '离线'
                                        : '在线'
                                    : '- -'
                            }}
                        </div>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col
                        :span="8"
                        v-for="(item, index) in translateUnitDesp(rowData.node_data)"
                        :key="index"
                    >
                        <div class="card dialog-cell">
                            <span :style="{ color: tagType(index) }">{{ item.name }}</span>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <!-- 高德地图 -->
            <div class="dialog-map-echarts">
                <div
                    id="map_container"
                    class="card map-container"
                    v-loading="mapLoading"
                    element-loading-text="正在加载数据，请稍等..."
                ></div>
                <div class="card echarts-container">
                    <div id="dataChart" style="width: 100%; height: 70%"></div>
                    <div class="button-container">
                        <el-radio-group
                            v-for="(item, index) in dataEchartsInfo"
                            :key="index"
                            v-model="curDataEcharts"
                            @change="drawDataCharts(curDataEcharts)"
                        >
                            <el-radio-button
                                :label="item.line_desc"
                                :value="index"
                            ></el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <div class="card" style="margin-top: 5px; padding-top: 0">
                <!-- 中间设置数据区域的控件 -->
                <div class="dialog-control">
                    <div class="control-left">
                        <el-radio-group v-model="selectStartEndTime">
                            <el-radio :value="true" style="margin-right: 15px"
                                >默认最新24小时</el-radio
                            >
                            <el-radio :value="false">自定义时间段</el-radio>
                        </el-radio-group>
                        <el-date-picker
                            v-model="startEndTime"
                            type="datetimerange"
                            placeholder="选择开始日期"
                            :shortcuts="shortcuts"
                            range-separator="至"
                            :disabled="selectStartEndTime"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            start-placeholder="请选择开始日期"
                            end-placeholder="请选择结束日期"
                            style="margin: 3px 10px 0 10px"
                        ></el-date-picker>

                        <el-button
                            style="height: 32px; margin-top: 3px"
                            type="primary"
                            @click="getTableData"
                            >更新</el-button
                        >
                    </div>

                    <!--线图与列表的切换-->
                    <el-radio-group
                        v-model="selectChartsTable"
                        style="padding-left: 40"
                        @change="handleSelectChange"
                    >
                        <el-radio-button value="1">线图</el-radio-button>
                        <el-radio-button value="2">数据记录</el-radio-button>
                    </el-radio-group>
                </div>
                <!-- 线表 -->
                <div v-show="selectChartsTable == '1'">
                    <div
                        v-for="i in props.rowData.node_data.line_datas"
                        :key="i.node_line"
                        :id="`canvas_${i.node_line}`"
                        style="
                            border: 1px solid #000000;
                            margin: 10px;
                            border-radius: 8px;
                            width: 98%;
                            height: 400px;
                        "
                    ></div>
                    <div
                        id="canvas_vol"
                        style="
                            border: 1px solid #000000;
                            margin: 10px;
                            border-radius: 8px;
                            width: 98%;
                            height: 400px;
                        "
                    ></div>
                    <div
                        id="canvas_csq"
                        style="
                            border: 1px solid #000000;
                            margin: 10px;
                            border-radius: 8px;
                            width: 98%;
                            height: 400px;
                        "
                    ></div>
                </div>
                <!-- 表格 -->
                <div v-show="selectChartsTable == '2'" style="height: 670px">
                    <ps-search-table
                        rowKey="node_data_id"
                        :border="true"
                        :hasSelection="true"
                        :hasIndex="true"
                        :hasSearch="false"
                        :fieldLists="fieldLists"
                        :tableData="tableData"
                        @getSelectedData="getSelectedData"
                    >
                        <template #tableHeader>
                            <el-button
                                type="primary"
                                @click="outputSelectedData"
                                style="height: 32px"
                                >导出选中</el-button
                            >
                            <el-button type="success" @click="outputAllData" style="height: 32px"
                                >导出全部</el-button
                            >
                        </template>
                    </ps-search-table>
                </div>
            </div>
        </div>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
    formatDate,
    UNIT_TABLE,
    gdMapXYConvertorEx,
    exportExcel,
    translateUnit,
    translateUnitDesp
} from '@/utils'
import gdMap from '@/utils/gaode-map'
import { getLbsList } from '@/api/realTimeData'
import useUserStore from '@/store/modules/user'
import * as echarts from 'echarts'
import { dataOption, volOption, csqOption, datasOption } from './realTimeData-echarts'
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
        default: '新建'
    },
    // 弹窗类型
    mode: {
        type: String,
        default: 'add'
    },
    // 当前行数据
    rowData: {
        type: Object,
        default: () => {}
    },
    // 当前树节点数据
    curProject: {
        type: Object,
        default: () => {}
    }
})

const userStore = useUserStore()

const dialogInnerStyle: any = reactive({
    height: '80vh'
}) // 弹窗高度
const mapLoading: any = ref(false) // 地图加载样式

const tagTypes: any = ['#409eff', '#67c23a', '#e6a23c']
// tag渲染
const tagType = (index: any) => {
    return tagTypes[index]
}

const dataEchartsInfo: any = ref([]) // echarts 图表信息
const open = () => {
    console.log('rowData', props.rowData)
    // echarts 图表信息 dataEchartsInfo
    for (let item of props.rowData.node_data.line_datas) {
        const lastValue = UNIT_TABLE.find((i: any) => i.type === item.unit)
        dataEchartsInfo.value.push({
            max: 100,
            min: 0,
            last_value: item.line_param.last_value,
            line_desc: lastValue?.desc,
            unit_name: lastValue?.name
        })
    }
    setTableColumn()
    initCharts()
    initVolChartsData()
    initCsqChartsData()
    initDataChartData()
    // 获取高德地图所需要的gps集合
    // 起始时间: 结束时间的前一天
    let start_time = formatDate(props.rowData.node_data.date, 'YYYY-MM-DD HH:mm:ss', 1, 'day')
    // 结束时间
    let end_time = formatDate(props.rowData.node_data.date)
    // 时间日期选择器默认时间
    startEndTime.value = [start_time, end_time]
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id,
        start_time,
        end_time,
        count: -1
    }
    mapLoading.value = true
    getLbsList(params)
        .then((res: any) => {
            // 加载地图
            if (res.result == '1') loadMap(res.lbs_list)
        })
        .finally(() => {
            mapLoading.value = false
        })
    // 加载图表
    getTableData()
}

// #region ********** start 处理高德地图 **********
// 高德地图
const map: any = ref(null) // 高德地图实例
const loadMap = (lbsList: any) => {
    gdMap.then((AMap) => {
        map.value = new AMap.Map('map_container', {
            // 设置地图容器id
            viewMode: '3D', // 是否为3D地图模式
            zoom: 11, // 初始化地图级别
            center: [116.397428, 39.90923] // 初始化地图中心点位置
        })

        // 比例尺
        const scale = new AMap.Scale({
            visible: true
        })

        // 放大缩小
        const toolBar = new AMap.ToolBar({
            visible: true,
            position: {
                top: '110px',
                right: '40px'
            }
        })

        // 指南针
        const controlBar = new AMap.ControlBar({
            visible: true,
            position: {
                top: '10px',
                right: '10px'
            }
        })
        map.value.addControl(scale)
        map.value.addControl(toolBar)
        map.value.addControl(controlBar)

        // 没有就不画点
        if (!map.value || !lbsList || !lbsList.length) {
            return
        }

        // 坐标转换
        gdMapXYConvertorEx(AMap, lbsList, (lists: any, noRepLngLatArrays: any) => {
            function sortFinal(date: any) {
                return function (a: any, b: any) {
                    let f: any = new Date(a[date])
                    let s: any = new Date(b[date])
                    return f - s
                }
            }

            let list = lists.sort(sortFinal('date'))

            // 找出maxLat和lbs.lat两个中的最大值，然后把它赋给maxLat
            let maxLon = noRepLngLatArrays[0][0]
            let minLon = noRepLngLatArrays[0][0]
            let maxLat = noRepLngLatArrays[0][1]
            let minLat = noRepLngLatArrays[0][1]

            for (let i = 0; i < noRepLngLatArrays.length; i++) {
                maxLon = Math.max(maxLon, noRepLngLatArrays[i][0])
                minLon = Math.min(minLon, noRepLngLatArrays[i][0])
                maxLat = Math.max(maxLat, noRepLngLatArrays[i][1])
                minLat = Math.min(minLat, noRepLngLatArrays[i][1])
            }
            // 绘制地图
            let markerList = []
            let pathList = []

            let marker = null
            for (let i = 0; i < list.length; i++) {
                if (i !== list.length - 1) {
                    marker = new AMap.Marker({
                        position: list[i],
                        title: formatDate(list[i].date)
                    })
                } else {
                    let endIcon = new AMap.Icon({
                        // 图标尺寸
                        size: new AMap.Size(500, 500),
                        // 图标的取图地址
                        image: new URL('@/assets/images/truck.png', import.meta.url).href,
                        // 图标所用图片大小
                        imageSize: new AMap.Size(40, 40),
                        // 图标取图偏移量
                        imageOffset: new AMap.Pixel(0, 0)
                    })
                    marker = new AMap.Marker({
                        position: list[i],
                        icon: endIcon,
                        title: formatDate(list[i].date),
                        offset: new AMap.Pixel(-20, -20)
                    })
                }
                markerList.push(marker)
                pathList.push(new AMap.LngLat(list[i].lng, list[i].lat))
            }

            map.value.add(markerList)
            if (pathList.length > 1) {
                let finalPath = [
                    new AMap.LngLat(list[list.length - 1].lng, list[list.length - 1].lat)
                ]
                for (let i = list.length - 1; i >= 0; i--) {
                    if (
                        list[list.length - 1].lng !== list[i].lng ||
                        list[list.length - 1].lat !== list[i].lat
                    ) {
                        finalPath.unshift(new AMap.LngLat(list[i].lng, list[i].lat))
                        break
                    }
                }
                let polyline = new AMap.Polyline({
                    path: pathList,
                    lineJoin: 'round', //折线拐点连接处样式
                    showDir: true,
                    strokeColor: '#3366bb', // 线颜色
                    strokeWeight: 10 // 线宽
                })
                let polyline1 = new AMap.Polyline({
                    path: finalPath, // 设置最后路径的样式
                    lineJoin: 'round', //折线拐点连接处样式
                    showDir: true,
                    dirColor: 'yellow',
                    strokeColor: 'green', // 线颜色
                    strokeWeight: 10 // 线宽
                })
                map.value.add(polyline)
                map.value.add(polyline1)
            }

            const ptSW = new AMap.LngLat(Number(minLon) - 0.001, Number(minLat) - 0.001)
            const ptNE = new AMap.LngLat(Number(maxLon) + 0.001, Number(maxLat) + 0.001)
            const bounds = new AMap.Bounds(ptSW, ptNE) //描叙一个矩形的地理坐标访问
            map.value.setBounds(bounds)
        })
    })
}
// #endregion ********** end 处理高德地图 **********

// #region ********** start 处理echarts图表 **********
const curDataEcharts = ref(0) // 当前echarts下标
const dataEchartsDom: any = ref(null) // echarts dom

// 初始化echarts图表
const initCharts = () => {
    dataEchartsDom.value = echarts.init(document.getElementById('dataChart'))
    window.addEventListener('resize', () => {
        dataEchartsDom.value && dataEchartsDom.value.resize()
    })
    drawDataCharts(0)
}

// 处理echarts图表
const drawDataCharts = (index: any) => {
    dataEchartsDom.value.setOption(dataOption(index, dataEchartsInfo))
}
// #endregion ********** end 处理echarts图表 **********

// #region ********** start 处理控件 **********
const selectStartEndTime: any = ref(true) // 时间段
const startEndTime: any = ref([]) // 查询起止时间
const shortcuts = [
    {
        text: '昨天',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 1)
            return [start, end]
        }
    },
    {
        text: '三天前',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 3)
            return [start, end]
        }
    },
    {
        text: '七天前',
        value: () => {
            const end = new Date()
            const start = new Date()
            start.setDate(start.getDate() - 7)
            return [start, end]
        }
    }
]

// 当前选择的是线表还是表格
const selectChartsTable = ref('1')

const handleSelectChange = () => {
    // getTableData()
}

// #endregion ********** end 处理控件 **********

// #region ********** start 处理表格数据 **********
// 获取表格数据
const ws: any = ref(null) // websocket实例
const tableData: any = ref([]) // 表格数据
const changeLineDatas: any = ref([]) // 表格数据
const fieldLists: any = ref([]) // 当前表格column
const beforeTable = reactive([
    // 表格动态列前column
    {
        label: '时间',
        prop: 'date',
        minWidth: 160
    },
    {
        label: '间隔',
        prop: 'gap',
        minWidth: 80
    }
])

const afterTable = reactive([
    // 表格动态列后column
    {
        label: '信号',
        prop: 'csq',
        minWidth: 80
    },
    {
        label: '电池',
        prop: 'groupU',
        minWidth: 100
    }
])

const columnTableData: any = ref({}) // 动态列
// 添加column
const setTableColumn = () => {
    const column: any = reactive([])
    for (let i of props.rowData.node_data.line_datas) {
        for (let j of UNIT_TABLE) {
            if (i.unit == j.type) {
                column.push({ label: j.desc, prop: i.node_line })
                columnTableData.value[i.node_line] = `${i.value} ${j.name}`
            }
        }
    }
    fieldLists.value = [...beforeTable, ...column, ...afterTable]
}

// 获取表格数据
const getTableData = () => {
    if (window.WebSocket) {
        // 请求表格数据
        const url = 'wss://app.parsen.com.cn/ParsenHttpApiV030/com/finder/GetNodeDatasEX'
        const params = {
            access_token: userStore.token,
            node_id: props.rowData.node_id,
            count: 200, //每次取出数据的数据量
            start_time: startEndTime.value[0],
            end_time: startEndTime.value[1]
        }
        if (ws.value) {
            ws.value.close()
            ws.value = null
        }
        // 创建websocket的连接
        ws.value = new WebSocket(url)
        ws.value.onopen = () => {
            console.log('创建连接成功，发送数据')
            ws.value.send(JSON.stringify(params))
        }
        tableData.value = []
        changeLineDatas.value = []
        // 返回数据
        ws.value.onmessage = (event: any) => {
            let data: any = null
            try {
                data = JSON.parse(event.data)
            } catch (e) {
                console.error('websocket onmessage not json string')
                console.error(event.data)
                console.error(e)
                return
            }
            // 处理数据
            let line = []
            let i: any
            for (i of props.rowData.node_data.line_datas) {
                if (i.line_param.show == '1') continue
                let nowLine = i.line_param.line
                line.push(nowLine)
            }
            if (data) {
                tableData.value.push(...data.node_datas)
                for (let x of tableData.value) {
                    let lineData = []
                    let lineCount: any = []
                    let i: any
                    for (i in x.line_datas) {
                        if (line.includes(x.line_datas[i].node_line)) {
                            continue
                        } else if (lineCount.includes(x.line_datas[i].node_line)) {
                            let index = lineData.findIndex((item) => item.node_line == i.node_line)
                            lineData.splice(index, 1)
                        }
                        lineData.push(x.line_datas[i])
                        lineCount.push(x.line_datas[i].node_line)
                    }
                    x.line_datas = lineData
                }
                // 排序
                function sortFinal(date: any) {
                    return function (a: any, b: any) {
                        const f: any = new Date(a[date])
                        const s: any = new Date(b[date])
                        return s - f
                    }
                }
                tableData.value = tableData.value.sort(sortFinal('date'))
                tableData.value = tableData.value.map((item: any, index: any) => {
                    const gap =
                        index < tableData.value.length - 1
                            ? (
                                  (+new Date(tableData.value[index].date) -
                                      +new Date(tableData.value[index + 1].date)) /
                                  60 /
                                  1000
                              ).toFixed(1)
                            : 0
                    const lineDataObj: any = {}
                    for (let i of item.line_datas) {
                        lineDataObj[`D${i.node_line}`] = Number(i.value)
                        lineDataObj[`D${i.node_line}U`] = i.unit
                        lineDataObj[i.node_line] = `${i.value} ${translateUnit(i.unit)}`
                    }
                    return {
                        ...item,
                        ...columnTableData.value,
                        ...lineDataObj,
                        date: formatDate(item.date),
                        groupU: `${item.vol}${item.vol < 10 ? 'V' : '%'}`,
                        group: item.vol,
                        gap
                    }
                })
                console.log('tableData.value', tableData.value)
                changeLineDatas.value = tableData.value.map((item: any) => {
                    const arr = []
                    for (let i of item.line_datas) {
                        arr.push(Number(i.value), item.date)
                    }
                    return arr
                })
                console.log('changeLineDatas.value', changeLineDatas.value)
                drawVolCsqCharts()
            }
        }
    }
}

// 选中的数据
const selectedData = ref([])
const getSelectedData = (params: any) => {
    selectedData.value = params.selectedData.value
}

// 导出选中
const outputSelectedData = () => {
    if (!selectedData.value.length) {
        ElMessage.error('没有可以导出的数据！')
        return
    }
    const fileName = props.rowData.node_name + '_' + props.rowData.imei + '_' + props.rowData.group
    exportExcel(fileName, selectedData.value, fieldLists)
}

// 导出全部
const outputAllData = () => {
    const fileName = props.rowData.node_name + '_' + props.rowData.imei + '_' + props.rowData.group
    exportExcel(fileName, tableData.value, fieldLists)
}
// #endregion ********** end 处理表格数据 **********

// #region ********** start 处理线表 **********
// 初始化 供电电压/电池电量 图表
const volChartsDom: any = ref(null)
const initVolChartsData = () => {
    volChartsDom.value = echarts.init(document.getElementById('canvas_vol'))
    // 绑定事件
    volChartsDom.value.on('dataZoom', (params: any) => {
        if (params.customFlag == 'zhang') return
        // if (params.start == undefined) {
        //     volChartsDom.value &&
        //         volChartsDom.value.dispatchAction({
        //             type: 'dataZoom',
        //             customFlag: 'zhang',
        //             // 开始位置的百分比，0 - 100
        //             start: params.batch[0].start,
        //             // 结束位置的百分比，0 - 100
        //             end: params.batch[0].end
        //         })
        // } else {
        volChartsDom.value &&
            volChartsDom.value.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.start,
                // 结束位置的百分比，0 - 100
                end: params.end
            })
        // }
    })
    window.addEventListener('resize', () => {
        volChartsDom.value.resize()
    })
}

// 初始化 信号强度 图表
const csqChartsDom: any = ref(null)
const initCsqChartsData = () => {
    csqChartsDom.value = echarts.init(document.getElementById('canvas_csq'))
    // 绑定事件
    csqChartsDom.value.on('dataZoom', (params: any) => {
        if (params.customFlag == 'zhang') return
        // if (params.start == undefined) {
        //     csqChartsDom.value.dispatchAction({
        //         type: 'dataZoom',
        //         customFlag: 'zhang',
        //         // 开始位置的百分比，0 - 100
        //         start: params.batch[0].start,
        //         // 结束位置的百分比，0 - 100
        //         end: params.batch[0].end
        //     })
        // } else {
        csqChartsDom.value.dispatchAction({
            type: 'dataZoom',
            customFlag: 'zhang',
            // 开始位置的百分比，0 - 100
            start: params.start,
            // 结束位置的百分比，0 - 100
            end: params.end
        })
        // }
    })
    window.addEventListener('resize', () => {
        csqChartsDom.value.resize()
    })
}

const dataChartsDom: any = ref([])
const initDataChartData = () => {
    for (let i in props.rowData.node_data.line_datas) {
        const domInstance = echarts.init(
            document.getElementById(`canvas_${props.rowData.node_data.line_datas[i].node_line}`)
        ) //返回dom
        domInstance.on('dataZoom', (params: any) => {
            if (params.customFlag == 'zhang') return
            // if (params.start == undefined) {
            //     domInstance.dispatchAction({
            //         type: 'dataZoom',
            //         customFlag: 'zhang',
            //         // 开始位置的百分比，0 - 100
            //         start: params.batch[0].start,
            //         // 结束位置的百分比，0 - 100
            //         end: params.batch[0].end
            //     })
            // } else {
            domInstance.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.start,
                // 结束位置的百分比，0 - 100
                end: params.end
            })
            // }
        })
        window.addEventListener('resize', () => {
            domInstance.resize()
        })
        dataChartsDom.value.push(domInstance)
    }
}

// 添加数据
const drawVolCsqCharts = () => {
    volChartsDom.value.setOption(volOption(tableData.value, startEndTime.value))
    csqChartsDom.value.setOption(csqOption(tableData.value, startEndTime.value))
    for (let i in props.rowData.node_data.line_datas) {
        dataChartsDom.value[i].setOption(
            datasOption(
                changeLineDatas.value,
                startEndTime.value,
                props.rowData.node_data.line_datas[i],
                i
            )
        )
    }
    console.log('dataChartsDom.value', dataChartsDom.value)
}
// #endregion ********** end 处理线表 **********

const close = () => {
    mapLoading.value = false // 地图加载样式
    dataEchartsInfo.value = [] // echarts 图表信息
    map.value = null // 高德地图实例
    curDataEcharts.value = 0 // 当前echarts下标
    dataEchartsDom.value = null // echarts dom

    selectStartEndTime.value = true // 时间段
    startEndTime.value = [] // 查询起止时间
    selectChartsTable.value = '1' // 当前选择的是线表还是表格

    ws.value = null // websocket实例
    tableData.value = [] // 表格数据
    fieldLists.value = [] // 当前表格column
    columnTableData.value = [] // 动态列

    selectedData.value = [] // 选中的数据
    dataChartsDom.value = []
}
</script>

<style lang="scss" scoped>
.dialog-container {
    width: 100%;
    .dialog-form {
        .dialog-cell {
            padding: 15px;
        }
    }
    .dialog-map-echarts {
        width: 100%;
        height: 500px;
        display: flex;
        align-items: center;
        margin-top: 10px;
        .map-container {
            flex: 1;
            height: 100%;
        }
        .echarts-container {
            flex: 0 0 400px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
    .dialog-control {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0;
        .control-left {
            display: flex;
            justify-content: center;
        }
    }
}
</style>
