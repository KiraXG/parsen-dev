<template>
    <ps-dialog
        :width="'80%'"
        :dialogHeader="dialogHeader"
        :loading="loading"
        :openDialog="openDialog"
        :isShowConfirm="false"
        :isEdit="false"
        :open="open"
        :dialogInnerStyle="dialogInnerStyle"
        @close="close"
    >
        <div class="card dialog-container">
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
                            {{
                                rowData.node_data
                                    ? formatDate(rowData.node_data.date, 'YYYY-MM-DD HH:mm:ss')
                                    : '- -'
                            }}
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
                        v-for="(item, index) in nodeData(rowData.node_data)"
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
                <div id="map_container" class="map-container"></div>
                <div class="card echarts-container">
                    <div id="gagueChart" style="width: 100%; height: 70%"></div>
                    <div class="button-container">
                        <el-radio-group
                            v-for="(item, index) in buttonInfos"
                            v-model="buttonCharts"
                            @change="gudgeChart(buttonCharts)"
                        >
                            <el-radio-button :label="index">{{ item.line_desc }}</el-radio-button>
                        </el-radio-group>
                    </div>
                </div>
            </div>
            <!-- 中间设置数据区域的控件 -->
            <div
                style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 10px;
                "
            >
                <el-switch
                    style="height: 40px; margin-left: 10px"
                    v-model="selectStartEndTime"
                    active-text="自定义时间段"
                    inactive-text="默认最新24小时"
                ></el-switch>

                <el-date-picker
                    v-model="startTime"
                    type="date"
                    placeholder="选择开始日期"
                    :picker-options="startTimePickerOptions"
                    style="margin-left: 10px"
                    :disabled="!selectStartEndTime"
                ></el-date-picker>

                <el-date-picker
                    v-model="endTime"
                    type="date"
                    placeholder="选择结束日期"
                    :picker-options="endTimePickerOptions"
                    style="margin-left: 10px"
                    :disabled="!selectStartEndTime"
                ></el-date-picker>

                <el-button
                    type="primary"
                    @click="reflashStartEndTimeData"
                    style="height: 32px; margin-left: 10px"
                    >更新</el-button
                >

                <!--线图与列表的切换-->
                <el-radio-group
                    v-model="radio1"
                    style="padding-left: 40"
                    @change="showDataRadioButtonChange"
                >
                    <el-radio-button label="1">线图</el-radio-button>
                    <el-radio-button label="2">数据记录</el-radio-button>
                </el-radio-group>

                <el-button
                    v-if="radio1 == '2'"
                    type="success"
                    @click="outPutDataSelected"
                    style="height: 32px"
                    >导出选中</el-button
                >
            </div>
            <div v-if="radio1 == 1">
                <div v-for="(info, i) in rowData.line_datas">
                    <!--             图标个数在html中由lastselectedNode限制 -->
                    <div
                        :id="info.canvas_id"
                        style="
                            border: 1px solid;
                            margin: 10px;
                            border-radius: 8px;
                            width: 98%;
                            height: 400px;
                        "
                    ></div>
                </div>

                <div
                    id="canvas_vol"
                    style="
                        border: 1px solid;
                        margin: 10px;
                        border-radius: 8px;
                        width: 98%;
                        height: 400px;
                    "
                ></div>

                <div
                    id="canvas_csq"
                    style="
                        border: 1px solid;
                        margin: 10px;
                        border-radius: 8px;
                        width: 98%;
                        height: 400px;
                    "
                ></div>
            </div>
        </div>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { formatDate, UNIT_TABLE, ExtUnitCalculate, ExtGraphDrawing } from '@/utils'
import AMap from '@/utils/gaode-map'
import { getLbsList } from '@/api/realTimeData'
import useUserStore from '@/store/modules/user'
import * as echarts from 'echarts'

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
const loading: any = ref(false) // 加载样式

const nodeData = (data: any) => {
    if (!data) return
    const tags: any = []
    for (let i of data.line_datas) {
        for (let j of UNIT_TABLE) {
            if (i.unit == j.type) {
                tags.push({ name: `${j.desc} ${i.value} ${j.name}`, type: i.node_line })
            }
        }
    }
    return tags
}

const tagTypes: any = ['#409eff', '#67c23a', '#e6a23c']
// tag渲染
const tagType = (index: any) => {
    return tagTypes[index]
}

const buttonInfos: any = ref([])
const open = () => {
    loading.value = true
    console.log(props.rowData)
    for (let x of props.rowData.node_data.line_datas) {
        console.log(x)
        const lastValue = UNIT_TABLE.find((i: any) => i.type === x.unit)
        buttonInfos.value.push({
            max: 100,
            min: 0,
            last_value: x.line_param.last_value,
            line_desc: lastValue?.desc,
            unit_name: lastValue?.name
        })
    }
    console.log(buttonInfos.value)

    let last_date = new Date(props.rowData.node_data.date)
    let ms = last_date.getTime()
    ms -= 24 * 60 * 60 * 1000
    let startTime = new Date(ms)
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id,
        start_time: formatDate(startTime, 'YYYY-MM-DD HH:mm:ss'),
        end_time: formatDate(last_date, 'YYYY-MM-DD HH:mm:ss'),
        count: -1
    }
    getLbsList(params)
        .then((res: any) => {
            if (res.result == '1') loadMap(res.lbs_list)
            initCharts()
            reflashStartEndTimeData()
            setupDataToEcharts()
        })
        .finally(() => {
            loading.value = false
        })
}

// #region ********** start 处理高德地图 **********
// 高德地图
let map: any = null
const loadMap = (lbsList: any) => {
    map = new AMap.Map('map_container', {
        // 设置地图容器id
        viewMode: '3D', // 是否为3D地图模式
        zoom: 11, // 初始化地图级别
        center: [116.397428, 39.90923] // 初始化地图中心点位置
    })

    let scale = new AMap.Scale({
            visible: true
        }),
        toolBar = new AMap.ToolBar({
            visible: true,
            position: {
                top: '110px',
                right: '40px'
            }
        }),
        controlBar = new AMap.ControlBar({
            visible: true,
            position: {
                top: '10px',
                right: '10px'
            }
        })
    map.addControl(scale)
    map.addControl(toolBar)
    map.addControl(controlBar)

    console.log(map)

    if (null == map) {
        console.log('new gdMap failed!')
        return
    }

    if (null == lbsList) {
        console.log('lbsList = null')
        return
    }

    if (lbsList.length < 1) {
        console.log('lbsList = 0')
        return
    }
    gdMapXYConvertorEx(lbsList, function (list: any, lngLatArrays: any) {
        console.log('------list', list)
        console.log('------lngLatArrays', lngLatArrays)

        let maxLon = lngLatArrays[0][0]
        let minLon = lngLatArrays[0][0]
        let maxLat = lngLatArrays[0][1]
        let minLat = lngLatArrays[0][1]

        let marker = null
        let markerList = []
        let pathList = []

        for (let i in lngLatArrays) {
            console.log(i)
            console.log(lngLatArrays[i])
            maxLon = Math.max(maxLon, lngLatArrays[i][0])
            minLon = Math.min(minLon, lngLatArrays[i][0])
            maxLat = Math.max(maxLat, lngLatArrays[i][1]) //找出maxLat和lbs.lat两个中的最大值，然后把它赋给maxLat
            minLat = Math.min(minLat, lngLatArrays[i][1])
        }

        let index = 0

        for (let i in list) {
            console.log('1312312312312', list[i])
            if (index !== 0) {
                marker = new AMap.Marker({
                    position: list[i].lngLatArr,
                    title: list[i].date
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
                    position: list[i].lngLatArr,
                    icon: endIcon,
                    title: list[i].date,
                    offset: new AMap.Pixel(-20, -20)
                })
            }
            index++
            markerList.push(marker)
            pathList.push(new AMap.LngLat(list[i].lngLatArr[0], list[i].lngLatArr[1]))
        }

        console.log(markerList)
        map.add(markerList)
        pathList.reverse()
        let polyline = new AMap.Polyline({
            path: pathList,
            strokeWeight: 10, //线条宽度
            lineJoin: 'round', //折线拐点连接处样式
            showDir: true,
            strokeColor: '#3366bb' // 线颜色
        })
        map.add(polyline)

        const ptSW = new AMap.LngLat(Number(minLon) - 0.001, Number(minLat) - 0.001)
        const ptNE = new AMap.LngLat(Number(maxLon) + 0.001, Number(maxLat) + 0.001)
        const bounds = new AMap.Bounds(ptSW, ptNE) //描叙一个矩形的地理坐标访问
        map.setBounds(bounds)
    })
}

//腾讯XY坐标转换的扩展函数，可以实现任意个数的坐标数组进行转换
const gdMapXYConvertorEx = (lbsLists: any, xyHandler: any) => {
    if (null == lbsLists) {
        return
    }
    if (0 == lbsLists.length) {
        return
    }

    let lngLatStrings = []
    let lngLatArrays = []
    // 给原来的数组的对象中加两项
    let lbsList = []
    for (let item of lbsLists) {
        lngLatStrings.push(`${item.lon},${item.lat}`) // 把字符串单独放一个数组
        lngLatArrays.push([item.lon, item.lat]) // 把数组单独放一个数组
        lbsList.push({
            ...item,
            lngLatStr: `${item.lon},${item.lat}`,
            lngLatArr: [item.lon, item.lat]
        })
    }

    // 过滤字符串数组中相同的点

    let a3 = Array.from(new Set(lngLatStrings))
    console.log(a3)

    // 找出最后一次出现的时间节点

    console.log('lbsList------', lbsList)
    let finals: any = {}

    a3.forEach((i) => {
        let arr: any = []
        lbsList.forEach((j) => {
            if (i === j.lngLatStr) {
                arr.push(j)
            }
        })

        function sortFinal(date: any) {
            return function (a: any, b: any) {
                let f: any = new Date(a[date])
                let s: any = new Date(b[date])
                return f - s
            }
        }

        let arrs = arr.sort(sortFinal('date'))

        finals[`${i}`] = arrs[arrs.length - 1]
    })
    console.log('first-----------', finals)
    xyHandler(finals, lngLatArrays)
}
// #endregion ********** end 处理高德地图 **********

// #region ********** start 处理echarts图表**********
const buttonCharts = ref(0)
const gudgeChart = (index: any) => {
    let optionGudge = {
        series: [
            {
                min: buttonInfos.value[index]['min'],
                max: buttonInfos.value[index]['max'],
                type: 'gauge',
                axisLine: {
                    lineStyle: {
                        //仪表线条设置
                        width: 20,
                        color: [
                            //仪表线条颜色
                            [0.3, '#67e0e3'],
                            [0.7, '#37a2da'],
                            [1, '#fd666d']
                        ]
                    }
                },
                pointer: {
                    //指针设置
                    itemStyle: {
                        color: 'inherit'
                    }
                },
                axisTick: {
                    //仪表盘刻度设置
                    distance: -30, //仪表盘刻度+为内，-为外
                    length: 8,
                    lineStyle: {
                        color: '#fff',
                        width: 2
                    }
                },
                splitLine: {
                    //仪表盘数字设置
                    distance: -30,
                    length: 30,
                    lineStyle: {
                        color: '#fff',
                        width: 4
                    }
                },
                axisLabel: {
                    //仪表盘数字标签
                    color: 'inherit',
                    distance: 40,
                    fontSize: autoFont(15)
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}' + buttonInfos.value[index].unit_name,
                    color: 'inherit',
                    fontSize: autoFont(25)
                },
                data: [
                    {
                        value: buttonInfos.value[index]['last_value']
                    }
                ]
            }
        ]
    }
    chartsDom.value.setOption(optionGudge)
}

const autoFont = (res: any) => {
    const clientWidth =
        window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    if (!clientWidth) return
    let fontSize = clientWidth / 1920
    return res * fontSize
}

const chartsDom: any = ref(null)
const initCharts = () => {
    const gudgeDom = document.getElementById('gagueChart')
    chartsDom.value = echarts.init(gudgeDom)
    window.addEventListener('resize', () => {
        chartsDom.value.resize()
    })
    gudgeChart(0)
}
// #endregion ********** end 处理echarts图表 **********

//
const selectStartEndTime: any = ref(false)
const startTime: any = ref(null)
const endTime: any = ref(null)
const startDate: any = ref(null)
const endDate: any = ref(null)
const radio1: any = ref('1')
const startTimePickerOptions = {
    shortcuts: [
        {
            text: '昨天',
            onClick(picker: any) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24)
                picker.$emit('pick', date)
            }
        },
        {
            text: '三天前',
            onClick(picker: any) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 3)
                picker.$emit('pick', date)
            }
        },
        {
            text: '七天前',
            onClick(picker: any) {
                const date = new Date()
                date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
                picker.$emit('pick', date)
            }
        }
    ]
}
const endTimePickerOptions = {
    shortcuts: [
        {
            text: '今天',
            onClick(picker: any) {
                const date = new Date()
                picker.$emit('pick', date)
            }
        }
    ]
}

const showDataRadioButtonChange = () => {
    if (radio1.value == '1' || radio1.value == '2') {
        reflashStartEndTimeData()
    }
}

const yibiaoDatas: any = ref([])
const dataForNodeDatas: any = ref([])
const webSocket: any = ref(null)
const reflashStartEndTimeData = () => {
    yibiaoDatas.value = []
    console.log('执行到了reflashStartEndTimeData')
    //当使用默认最新24小时的时候
    if (!selectStartEndTime.value) {
        //求出 js Date 时间
        //endTime = dateUpToHour(new Date());
        if (props.rowData.node_data.date) {
            endTime.value = dateUpToHour(
                formatDate(props.rowData.node_data.date, 'YYYY-MM-DD HH:mm:ss')
            )
            endDate.value = new Date(props.rowData.node_data.date)
            let ms_ = endDate.value.getTime()
            let ms = endTime.value.getTime()
            ms -= 24 * 60 * 60 * 1000
            ms_ -= 24 * 60 * 60 * 1000
            startDate.value = new Date(ms_)
            startTime.value = new Date(ms)
        } else {
            return //当使用默认时间,但是又没有默认时间时,就返回
        }
    }

    //对开始时间和结束时间进行比较，开始时间早于结束时间时则弹窗并终止数据请求
    if (startTime.value.getTime() > endTime.value.getTime()) {
        // date.getTime()
        alert('开始时间不能晚于结束时间！请重新选择日期')
        return 0
    }

    //2022.8.9----reflashStartEndTimeData()使用websocket-----
    if ('WebSocket' in window) {
        console.log('您的浏览器支持websocket')
        const url = `wss://app.parsen.com.cn/ParsenHttpApiV030/com/finder/GetNodeDatasEX`
        const data = {
            access_token: userStore.token,
            node_id: props.rowData.node_id,
            count: 200, //每次取出数据的数据量
            start_time: formatDate(startDate.value, 'YYYY-MM-DD HH:mm:ss'),
            end_time: formatDate(endDate.value, 'YYYY-MM-DD HH:mm:ss')
        }
        if (null != webSocket.value) {
            webSocket.value.close()
            webSocket.value = null
        }

        webSocket.value = new WebSocket(url) //创建websocket的连接

        if (null == webSocket.value) {
            console.log('创建连接失败')
            return
        }

        //建立连接后发送请求
        webSocket.value.onopen = function (event: any) {
            console.log('创建连接成功，发送数据')
            console.log(JSON.stringify(data))
            webSocket.value.send(JSON.stringify(data))
        }

        webSocket.value.onmessage = function (event: any) {
            console.log('get datas servlet ok')
            let dataS = null
            try {
                dataS = JSON.parse(event.data)
            } catch (e) {
                console.log('websocket onmessage not json string')
                console.log(event.data)
                console.log(e)
                return
            }
            dataForNodeDatas.value = dataS.node_datas

            /*显示处理*/
            let concelLine = []
            let lines = props.rowData.node_data.line_datas
            for (let x of lines) {
                if (x.line_param.show == 1) continue
                let nowLine = x.line_param.line
                concelLine.push(nowLine)
            }

            /*----------------------------------------*/

            if (dataS != null) {
                yibiaoDatas.value.push(...dataS.node_datas)
                // if(concelLine.length>0){
                for (let x of yibiaoDatas.value) {
                    let line_datas: any = []
                    let lineCount: any = []
                    let i: any
                    for (i in x.line_datas) {
                        if (concelLine.includes(x.line_datas[i].node_line)) {
                            continue
                        } else if (lineCount.includes(x.line_datas[i].node_line)) {
                            let index = line_datas.findIndex(
                                (item: any) => item.node_line == i.node_line
                            )
                            line_datas.splice(index, 1)
                        }
                        line_datas.push(x.line_datas[i])
                        lineCount.push(x.line_datas[i].node_line)
                    }
                    x.line_datas = line_datas
                    // }
                }
            }

            //websocket可能会传多次数据，为防止数据覆盖，直接使用that.yibiaoDatas
            yibiaoDatasUnitTransfer(yibiaoDatas.value, props.rowData)

            console.log('transfer datas ok')

            //数据时间排序
            function compare(proprty: any, bol: any) {
                return function (a: any, b: any) {
                    let value1 = Date.parse(a[proprty])
                    let value2 = Date.parse(b[proprty])
                    if (bol) {
                        //升序
                        return value1 - value2
                    } else {
                        //降序
                        return value2 - value1
                    }
                }
            }

            yibiaoDatas.value.sort(compare('date', false))

            //计算间隔时间
            let i: any
            for (i in yibiaoDatas.value) {
                if (i == yibiaoDatas.value.length - 1) {
                    yibiaoDatas.value[i]['gap'] = 0
                } else {
                    let x = i - 1 + 2
                    let timeBefore: any = new Date(yibiaoDatas.value[x].date)
                    let timeAfter: any = new Date(yibiaoDatas.value[i].date)
                    yibiaoDatas.value[i]['gap'] = parseFloat(
                        (timeAfter - timeBefore) / 60 / 1000
                    ).toFixed(1)
                }
            }

            setupDataToEcharts()

            let drawInfo = (ExtGraphDrawing as any)[props.rowData.node_id]
            if (drawInfo) {
                drawInfo.drawFunc(
                    drawInfo.drawData,
                    props.rowData.dataInfos[0].displayValue,
                    props.rowData.dataInfos[1].displayValue,
                    props.rowData.dataInfos[2].displayValue,
                    drawInfo.rou,
                    drawInfo.g
                )
            }
        }
    } else {
        console.log('您的浏览器不支持websocket')
    }
}

const dataCount: any = ref(0)
const linCount: any = ref(0)
const tempLine: any = ref([])
const changeLineDatas: any = ref([])
const lineDatas: any = ref({})
const yibiaoDatasUnitTransfer = (datas: any, node: any) => {
    for (let data of datas) {
        if (null == data.line_datas) {
            dataCount.value++
            continue
        }
        for (let i of data.line_datas) {
            if (tempLine.value.includes(i.node_line)) {
                continue
            }
            tempLine.value.push(i.node_line)
            linCount.value++
        }
        dataCount.value++
    }
    //==========================	新建数组待存放数据值和时间
    for (let i = 0; i < linCount.value; i++) {
        lineDatas.value['lineNode' + tempLine.value[i]] = []
        lineDatas.value['lineTime' + tempLine.value[i]] = []
    }

    //==========================	压入数据
    for (let data of datas) {
        if (null == data.line_datas) {
            continue
        }
        for (let i of data.line_datas) {
            let lineNode = 'lineNode' + i.node_line
            let lineNodeTime = 'lineTime' + i.node_line
            lineDatas.value[lineNode].push(transferToUnit(i.value, i.unit, i.unit))
            lineDatas.value[lineNodeTime].push(data.date)
            //console.log(yibiaoDatas.value[dataCount.value][lineNodeTime]);
        }
    }

    //==========================	计算最大数据长度
    let maxLength = 0
    for (let length in lineDatas.value) {
        if (lineDatas.value[length].length > maxLength) {
            maxLength = lineDatas.value[length].length
        }
    }

    //==========================	新建存放转换数据的数组，为防止刷新累加，先清空
    changeLineDatas.value = []
    for (let a = 0; a < maxLength; a++) {
        changeLineDatas.value.push([])
    }

    //==========================	转换数据
    for (let i in lineDatas.value) {
        for (let a = 0; a < maxLength; a++) {
            if (a >= lineDatas.value[i].length) {
                changeLineDatas.value[a].push('-')
                continue
            }
            changeLineDatas.value[a].push(lineDatas.value[i][a])
        }
    }

    //                yibiaoDatas.value.push(changeLineDatas.value);
    //				dataCount.value++;

    for (let data of datas) {
        if (data.vol > 200) {
            data.vol /= 1000
        }
        if (null == data.line_datas) {
            continue
        }
        for (let i of data.line_datas) {
            let nodeLine = i.node_line
            data['D' + nodeLine] = transferToUnit(i.value, i.unit, i.unit)
            data['D' + nodeLine + 'U'] = i.unit
        }
    }
}

const colors: any = ref([])
const echartsInstanceVol: any = ref(null)
const echartsInstance: any = ref(null)
const echartsInstanceCsq: any = ref(null)
const echartKpaInstance: any = ref(null)
const echartVInstance: any = ref(null)
const setupDataToEcharts = () => {
    const infos = props.rowData.dataInfos

    gudgeChart(0)
    buttonCharts.value = 0

    let lineCount: any = []
    let data: any
    for (data of yibiaoDatas.value) {
        if (null == data.line_datas) {
            continue
        }
        let line_datas = []
        lineCount = []
        let i: any
        for (i of data.line_datas) {
            if (lineCount.includes(i.node_line)) {
                let index = line_datas.findIndex((item) => item.node_line == i.node_line)
                line_datas.splice(index, 1)
            }
            lineCount.push(i.node_line)
            line_datas.push(i)
        }
        data.line_datas = line_datas
    }

    let dnames = []
    lineCount.forEach((value: any, key: any) => {
        dnames[key] = 'D' + value
    }),
        //return回ps_consts_f.js中PsColor的数组，包含16进制的颜色
        (colors.value = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']) //['#409EFF','#67C23A','#E6A23C','#F56C6C'];

    //设置好时间轴datazoom元素，画Chart时直接带入对应变量名
    //单独滑动条
    let dzSlider = {
        // 这个dataZoom组件，默认控制x轴。
        type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
        start: 0, // 左边在 10% 的位置。
        end: 100, // 右边在 60% 的位置。
        showDetail: false
    }
    //内置
    let dzInside = {
        // 这个dataZoom组件，也控制x轴。
        type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
        start: 0, // 左边在 10% 的位置。
        end: 100 // 右边在 60% 的位置。
    }

    const volDomInstance = document.getElementById('canvas_vol')
    echartsInstanceVol.value = echarts.init(volDomInstance)
    echartsInstanceVol.value.on('dataZoom', onDataZoom) //绑定事件
    const volMax = 8
    const volMin = 0
    let volLabel = {
        formatter: function (param: any) {
            //formatter函数格式化显示时间数据
            const dt = new Date(param.value)
            const timeStr =
                dt.getMonth() +
                1 +
                '-' +
                dt.getDate() +
                ' ' +
                formatNumber(dt.getHours()) +
                ':' +
                formatNumber(dt.getMinutes())
            return timeStr
        }
    }

    const csqDomInstance = document.getElementById('canvas_csq')
    echartsInstanceCsq.value = echarts.init(csqDomInstance)
    echartsInstanceCsq.value.on('dataZoom', onDataZoom)
    const csqMax = 33
    const csqMin = -1
    let csqLabel = {
        formatter: function (param: any) {
            //formatter函数格式化显示时间数据
            const dt1 = new Date(param.value)
            //const timeStr = dt.getMonth() + '月' + dt.getDay() + '日' + dt.getHours() + '时' + dt.getMinutes() + '分';
            const timeStr1 =
                dt1.getMonth() +
                1 +
                '-' +
                dt1.getDate() +
                ' ' +
                formatNumber(dt1.getHours()) +
                ':' +
                formatNumber(dt1.getMinutes())
            return timeStr1
        }
    }

    //画出了供电电压表
    let volOption = {
        //Echart设置
        title: {
            text: yibiaoDatas.value[0].vol < 10 ? '供电电压' : '电池电量',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',

            axisPointer: {
                type: 'shadow', //['line','shadow','cross','none'][i],
                animation: false,
                axis: 'x',
                //snap:false,
                label: volLabel //时间
            }
            //formatter:'{a} {b} {c} {a0} {b0} {c0} {a1} {b1} {c1}',
        },
        xAxis: {
            type: 'time',
            max: endDate.value,
            min: startDate.value
        },
        yAxis: {
            type: 'value',
            name: yibiaoDatas.value[0].vol < 10 ? 'V' : '%',
            max: yibiaoDatas.value[0].vol < 10 ? volMax : 100, //'dataMax',
            min: yibiaoDatas.value[0].vol < 10 ? volMin : 50 //'dataMin',
        },
        grid: {
            bottom: 40,
            containLabel: true
        },
        dataZoom: [
            dzSlider,
            dzInside
            /* {filterMode: 'filter'}*/
        ],
        color: '#000000',
        dataset: {
            source: yibiaoDatas.value
        },
        series: [
            {
                name: yibiaoDatas.value[0].vol < 10 ? '电压' : '百分比',
                type: 'line',
                symbolSize: 8,
                encode: {
                    x: 'date',
                    y: 'vol'
                    //y:'displayValue',
                }
            }
        ]
    }

    echartsInstanceVol.value.setOption(volOption)
    chartsDom.value.push(echartsInstanceVol.value)

    //信号强度图表设置
    let csqOption = {
        title: {
            text: '信号强度',
            left: 'center' //水平安放位置
        },
        tooltip: {
            //提示框
            trigger: 'axis', //触发类型:轴触发；axis是鼠标移动到柱状图显示全部数据，item是显示折线图全部数据

            axisPointer: {
                //坐标轴指示器
                type: 'shadow', //默认为line,line直线，cross十字准星，shadow阴影
                animation: false, //设置echart是否开启动画
                axis: 'x',
                label: csqLabel //文字描述
            }
        },
        xAxis: {
            type: 'time',
            max: endDate.value,
            min: startDate.value
        },
        yAxis: {
            type: 'value',
            name: '信号强度',
            max: yibiaoDatas.value[0].vol_type == 0 ? csqMax : 100, //'dataMax',
            min: yibiaoDatas.value[0].vol_type == 0 ? csqMin : 50 //'dataMin',
        },
        grid: {
            bottom: 40, //距离底部容器的距离
            containLabel: true //gird区域是否包含坐标轴的刻度标签
        },
        dataZoom: [
            dzSlider,
            dzInside
            /* {filterMode: 'filter'}*/
        ],
        color: '#A511FE',
        dataset: {
            source: yibiaoDatas.value
        },

        series: [
            {
                name: '信号强度',
                type: 'line',
                symbolSize: 8,
                encode: {
                    x: 'date',
                    y: 'csq'
                    //y:'displayValue',
                }
            }
        ]
    }
    echartsInstanceCsq.value.setOption(csqOption)
    chartsDom.value.push(echartsInstanceCsq.value)
    //循环读取data部署chart
    let i: any
    for (i in infos) {
        //!!!!!!循环只依赖于lastselectedNode
        const domInstance = document.getElementById(infos[i].canvas_id) //返回dom
        //lastselectednode控制dom容器
        if (!domInstance) {
            continue
        }

        echartsInstance.value[i] = echarts.init(domInstance) //图表实例
        if (!echartsInstance.value[i]) {
            continue
        }

        echartsInstance.value[i].on('dataZoom', onDataZoom) //绑定事件

        const yMax =
            infos[i].setMax == '1'
                ? infos[i].max
                : function (value: any) {
                      return Math.ceil((value.max - value.min) * 0.1 + value.max) //向上取整
                  }
        const yMin =
            infos[i].setMin == '1'
                ? infos[i].min
                : function (value: any) {
                      return Math.floor(value.min - (value.max - value.min) * 0.1) //向下取整
                  }

        let labelEx = {}

        const lineNumber = i
        const funcName = props.rowData.node_id + '_' + i

        //特殊指定计算
        if ((ExtUnitCalculate as any)[funcName]) {
            //此处调用ext_unit_calc_f.js文件中的计算函数
            //在detal_data_graph.jsp文件中引用ext_unit_calc_f.js
            labelEx = {
                formatter: function (param: any) {
                    if (!param.seriesData[0]) {
                        console.log('遇到 seriessData[0] 为  null')
                        return ''
                    }
                    if (!param.seriesData[0].data) {
                        console.log('遇到 data 为  null')
                        return ''
                    }

                    const value = param.seriesData[0].data[lineNumber]
                    const dt = new Date(param.value)
                    //const timeStr = dt.getMonth() + '月' + dt.getDay() + '日' + dt.getHours() + '时' + dt.getMinutes() + '分';
                    const timeStr =
                        dt.getMonth() +
                        1 +
                        '-' +
                        dt.getDate() +
                        ' ' +
                        formatNumber(dt.getHours()) +
                        ':' +
                        formatNumber(dt.getMinutes())

                    const du = props.rowData.dataInfos[lineNumber].displayUnit

                    const displayValue = transferToUnit(
                        value,
                        props.rowData.dataInfos[lineNumber].displayUnit,
                        '0'
                    )
                    let vol = (ExtUnitCalculate as any)[funcName](displayValue)

                    return timeStr + '  ' + vol
                }
            }
        } else {
            labelEx = {
                formatter: function (param: any) {
                    const dt = new Date(param.value)
                    //const timeStr = dt.getMonth() + '月' + dt.getDay() + '日' + dt.getHours() + '时' + dt.getMinutes() + '分';
                    const timeStr =
                        dt.getMonth() +
                        1 +
                        '-' +
                        dt.getDate() +
                        ' ' +
                        formatNumber(dt.getHours()) +
                        ':' +
                        formatNumber(dt.getMinutes())
                    return timeStr
                }
            }
        }

        //通用图表格式设定
        let option = {
            title: {
                text: infos[i].line_desc, //！！！！！！lastselectednode控制表头
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',

                axisPointer: {
                    type: 'shadow', //['line','shadow','cross','none'][i],
                    animation: false,
                    axis: 'x',
                    label: labelEx
                }
            },
            xAxis: {
                type: 'time',
                max: endDate.value,
                min: startDate.value
            },
            yAxis: {
                type: 'value',
                name: '单位: ' + infos[i].unit_name, //!!!!!lastselectednode控制单位
                max: yMax, //'dataMax',
                min: yMin //'dataMin',
            },
            grid: {
                bottom: 40,
                containLabel: true
            },
            dataZoom: [dzSlider, dzInside],
            color: colors[i % 4], //!!!!!!一共四个颜色，超过索引需要修改
            dataset: {
                source: changeLineDatas.value
            },
            series: [
                {
                    name: infos[i].unit_desc,
                    type: 'line',
                    symbolSize: 8,
                    encode: {
                        x: i * 2 + 1,
                        y: i * 2
                        //y:'displayValue',
                    }
                }
            ]
        }
        /*  echartsInstance.value[i].clear();*/
        // let d1 = +new Date();
        echartsInstance.value[i].setOption(option)
        chartsDom.value.push(echartsInstance.value[i])
        /* let d2 = +new Date();
                     let dDifferent = d2 - d1;
                     console.log("this is Vgraph time");
                     console.log(dDifferent);*/
    } //for(int i=0 ~ 4)结束

    //======================================特殊图标绘制
    const drawObj = (ExtGraphDrawing as any)[props.rowData.node_id + '']

    if (drawObj) {
        const domKpa = document.getElementById('instrum_kpa')
        if (!domKpa) {
            return
        }

        echartKpaInstance.value = echarts.init(domKpa)
        if (!echartKpaInstance.value) {
            return
        }

        const h = drawObj.maxKpaToMaxHeight(drawObj.maxKpa)
        const deg = (drawObj.maxH * 270) / h
        const endDeg = 225 - deg

        const optionKpa = {
            series: [
                {
                    type: 'gauge', //仪表盘类型
                    min: drawObj.minKpa,
                    max: drawObj.maxKpa,
                    splitNumber: drawObj.splitKpa,
                    radius: '80%',
                    axisLine: {
                        lineStyle: {
                            color: [[1, drawObj.colorKpa]],
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: 0,
                        length: 18,
                        lineStyle: {
                            color: drawObj.colorKpa
                        }
                    },
                    axisTick: {
                        distance: -32,
                        length: 10,
                        lineStyle: {
                            color: drawObj.colorKpa
                        }
                    },
                    axisLabel: {
                        distance: -42,
                        color: drawObj.colorKpa,
                        fontSize: 18
                    },
                    anchor: {
                        show: true,
                        size: 20,
                        itemStyle: {
                            borderColor: '#000',
                            borderWidth: 2
                        }
                    },
                    pointer: {
                        offsetCenter: [0, '5%'],
                        //icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                        length: '80%',
                        itemStyle: {
                            color: '#000'
                        }
                    },
                    detail: {
                        valueAnimation: true,
                        precision: 2,
                        offsetCenter: [0, 90],
                        fontSize: 18,
                        formatter: drawObj.formatterKpa
                    },
                    title: {
                        offsetCenter: [-50, 120],
                        color: drawObj.colorKpa
                    },
                    data: [
                        {
                            value: props.rowData.D1,
                            name: drawObj.titleKpa
                        }
                    ]
                },
                {
                    type: 'gauge',
                    min: drawObj.minH,
                    max: drawObj.maxH,
                    splitNumber: drawObj.splitH,
                    radius: '70%',
                    endAngle: endDeg,
                    axisLine: {
                        lineStyle: {
                            color: [[1, drawObj.colorH]],
                            width: 3
                        }
                    },
                    splitLine: {
                        distance: -3,
                        length: 18,
                        lineStyle: {
                            color: drawObj.colorH
                        }
                    },
                    axisTick: {
                        distance: 0,
                        length: 10,
                        lineStyle: {
                            color: drawObj.colorH
                        }
                    },
                    axisLabel: {
                        distance: 10,
                        fontSize: 19,
                        color: drawObj.colorH
                    },
                    pointer: {
                        show: false
                    },
                    title: {
                        show: true,
                        offsetCenter: [20, 120],
                        color: drawObj.colorH
                    },
                    anchor: {
                        show: true,
                        size: 14,
                        itemStyle: {
                            color: '#000'
                        }
                    },
                    detail: {
                        show: false
                    },
                    data: [{ value: '1', name: drawObj.titleH }]
                }
            ] //series 数组结束
        } //画特殊图表

        echartKpaInstance.value.setOption(optionKpa, true)

        const domV = document.getElementById('instrum_volume')
        if (!domV) {
            return
        }

        echartVInstance.value = echarts.init(domV)
        if (!echartVInstance.value) {
            return
        }

        const volume = drawObj.kPaToVolume(props.rowData.D1)

        const optionV = {
            series: [
                {
                    type: 'gauge', //仪表盘类型
                    min: drawObj.minV,
                    max: drawObj.maxV,
                    splitNumber: drawObj.splitV,
                    radius: '80%',
                    axisLine: {
                        lineStyle: {
                            color: [[1, drawObj.colorV]],
                            width: 2
                        }
                    },
                    splitLine: {
                        distance: 0,
                        length: 18,
                        lineStyle: {
                            color: drawObj.colorV
                        }
                    },
                    axisTick: {
                        distance: -32,
                        length: 10,
                        lineStyle: {
                            color: drawObj.colorV
                        }
                    },
                    axisLabel: {
                        distance: -42,
                        color: drawObj.colorV,
                        fontSize: 18
                    },
                    anchor: {
                        show: true,
                        size: 20,
                        itemStyle: {
                            borderColor: '#000',
                            borderWidth: 2
                        }
                    },
                    pointer: {
                        offsetCenter: [0, '5%'],
                        length: '80%',
                        itemStyle: {
                            color: '#000'
                        }
                    },
                    detail: {
                        valueAnimation: true,
                        precision: 2,
                        offsetCenter: [0, 90],
                        fontSize: 18,
                        formatter: drawObj.formatterV
                    },
                    title: {
                        offsetCenter: [-50, 120],
                        color: drawObj.colorV
                    },
                    data: [
                        {
                            value: volume,
                            name: drawObj.titleV
                        }
                    ]
                },
                {
                    type: 'gauge',
                    min: drawObj.minT,
                    max: 30, //drawObj.maxT(),
                    splitNumber: drawObj.splitT,
                    radius: '70%',
                    axisLine: {
                        lineStyle: {
                            color: [[1, drawObj.colorT]],
                            width: 3
                        }
                    },
                    splitLine: {
                        distance: -3,
                        length: 18,
                        lineStyle: {
                            color: drawObj.colorT
                        }
                    },
                    axisTick: {
                        distance: 0,
                        length: 6,
                        lineStyle: {
                            color: drawObj.colorT
                        }
                    },
                    axisLabel: {
                        distance: 10,
                        fontSize: 19,
                        color: drawObj.colorT
                    },
                    pointer: {
                        show: false
                    },
                    title: {
                        show: true,
                        offsetCenter: [20, 120],
                        color: drawObj.colorT
                    },
                    anchor: {
                        show: true,
                        size: 14,
                        itemStyle: {
                            color: '#000'
                        }
                    },
                    detail: {
                        show: false
                    },
                    data: [{ value: '1', name: drawObj.titleT }]
                }
            ] //series 数组结束
        }

        echartVInstance.value.setOption(optionV, true)
    }

    //this.echartKpaInstance.on('dataZoom',onDataZoom);
    window.addEventListener('resize', autoSize)
}

const multipleSelect: any = ref([])
const outPutDataSelected = () => {
    console.log('outPutDataSelected')
    let selectData: any = []
    let tempSelect: any = {}
    let title = ''
    //选择全部单位desc用于输出
    for (let i of multipleSelect.value[0]['line_datas']) {
        title += unitCodeToDesc(i['unit'])
        title += ','
    }
    //后续循环顺序此三项在后面，所以置后
    title += `时间,信号,电池\n`
    for (let i of multipleSelect.value) {
        tempSelect = {}
        tempSelect['date'] = i['date'].substring(0, 16)
        for (let x in i.line_datas) {
            tempSelect[x] = i['line_datas'][x]['value']
        }
        tempSelect['Csq'] = i['csq']
        tempSelect['vol'] = i['vol']
        selectData.push(tempSelect)
    }
    for (let i = 0; i < selectData.length; i++) {
        for (const key in selectData[i]) {
            title += `${selectData[i][key] + '\t'},`
        }
        title += '\n'
    }
    // encodeURIComponent解决中文乱码
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(title)
    // 通过创建a标签实现
    const link = document.createElement('a')
    link.href = uri
    // 对下载的文件命名
    link.download = '导出数据表.csv'
    link.click()
}

const autoSize = () => {
    for (let x of chartsDom.value) {
        x.resize()
    }
}

//仪表的单位代码转换成单位描述,用于显示
const unitCodeToDesc = (code: any) => {
    for (let elem of UNIT_TABLE) {
        if (elem.type == code) {
            return elem.desc
        }
    }
}

const onDataZoom = (params: any) => {
    console.log('onDataZoom triggered')
    //console.log(params);
    //console.log([params.batch[0].start,params.batch[0].end]);

    //如果是二次触发,不再处理
    if ('zhang' == params.customFlag) {
        return
    }

    //=====================================如果是原始动作,进行处理
    if (undefined == params.start) {
        //inside 的 dataZoom 在动作
        console.log('inside data zoom')

        for (let ei of echartsInstance.value) {
            if (!ei) {
                continue
            }
            ei.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.batch[0].start,
                // 结束位置的百分比，0 - 100
                end: params.batch[0].end
            })
        }

        if (echartsInstanceVol.value) {
            echartsInstanceVol.value.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.batch[0].start,
                // 结束位置的百分比，0 - 100
                end: params.batch[0].end
            })
        }

        if (echartsInstanceCsq.value) {
            echartsInstanceCsq.value.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.batch[0].start,
                // 结束位置的百分比，0 - 100
                end: params.batch[0].end
            })
        }
    } else {
        //slider 的 dataZoom 在动作
        console.log('slider data zoom')
        for (let ei of echartsInstance.value) {
            if (!ei) {
                continue
            }
            ei.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.start,
                // 结束位置的百分比，0 - 100
                end: params.end
            })
        }
        if (echartsInstanceVol.value) {
            echartsInstanceVol.value.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.start,
                // 结束位置的百分比，0 - 100
                end: params.end
            })
        }

        if (echartsInstanceCsq.value) {
            echartsInstanceCsq.value.dispatchAction({
                type: 'dataZoom',
                customFlag: 'zhang',
                // 开始位置的百分比，0 - 100
                start: params.start,
                // 结束位置的百分比，0 - 100
                end: params.end
            })
        }
    }
}

const formatNumber = (n: any) => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const dateUpToHour = (date: any) => {
    let dateUp = new Date(date)
    dateUp.setMinutes(0)
    dateUp.setSeconds(0)
    let ms = dateUp.getTime()
    ms += 1000 * 60 * 60
    return new Date(ms)
}

const transferToUnit = (data: any, unit: any, displayUnit: any) => {
    if (unit > 22) {
        unit = 23
    }
    if (displayUnit > 22) {
        displayUnit = 23
    }
    const coef1 = UNIT_TABLE[unit].coef
    const coef2 = UNIT_TABLE[displayUnit].coef
    if (0 == coef1 || 0 == coef2) {
        return 0
    }
    const value = parseFloat(data)
    return (value / coef1) * coef2
}

const close = () => {
    loading.value = false
    buttonInfos.value = []
    buttonCharts.value = 0
    chartsDom.value = null

    selectStartEndTime.value = false
    startTime.value = null
    endTime.value = null
    startDate.value = null
    endDate.value = null
    radio1.value = '1'

    yibiaoDatas.value = []
    dataForNodeDatas.value = []
    webSocket.value = null

    dataCount.value = 0
    linCount.value = 0
    tempLine.value = []
    changeLineDatas.value = []
    lineDatas.value = []
    colors.value = []
    echartsInstanceVol.value = null
    echartsInstance.value = null
    echartsInstanceCsq.value = null
    echartKpaInstance.value = null
    echartVInstance.value = null
    multipleSelect.value = []
    echartsInstanceCsq.value = null
}
</script>

<style lang="scss" scoped>
.dialog-container {
    // display: flex;
    // flex-direction: column;
    width: 90%;
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
            border-radius: 4px;
        }
        .echarts-container {
            flex: 0 0 400px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            .button-container {
                // margin: 0 auto;
            }
        }
    }
}
</style>
