import { formatDate, fontSize, PsColor, translateUnit } from '@/utils'

const alarmColor = 'rgb(238,121,89)'
const normalColor = 'rgb(176,213,223)'
const tipColor = 'rgb(30,39,50)'
const shadowColor = '#cdcccc'

// 报警预览
export const alarmOption = (alarm: any) => {
    return {
        title: {
            text: '报警预览',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: 14
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: 16,
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: 16
            }
        },
        color: [normalColor, alarmColor],
        series: [
            {
                radius: ['45%', '75%'],
                type: 'pie',
                data: alarm,
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 3,
                    borderColor: '#fff',
                    borderWidth: 1.5,
                    shadowBlur: 5,
                    shadowOffsetX: 5,
                    shadowOffsetY: 5,
                    shadowColor: shadowColor
                },
                label: {
                    formatter: (params: { name: string; value: string }) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    backgroundColor: 'white',
                    rich: {
                        r: {
                            fontSize: 20
                        }
                    }
                },
                labelLine: {
                    show: false
                },
                emphasis: {
                    scale: true,
                    sizeScale: 30
                }
            }
        ]
    }
}

// 数据图表
export const dataOption = (index: any, buttonInfos: any) => {
    return {
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
                    fontSize: fontSize(15)
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}' + buttonInfos.value[index].unit_name,
                    color: 'inherit',
                    fontSize: fontSize(25)
                },
                data: [
                    {
                        value: buttonInfos.value[index]['last_value']
                    }
                ]
            }
        ]
    }
}

//单独滑动条
const dzSlider = {
    // 这个dataZoom组件，默认控制x轴。
    type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
    start: 0, // 左边在 10% 的位置。
    end: 100, // 右边在 60% 的位置。
    showDetail: false
}
//内置
const dzInside = {
    // 这个dataZoom组件，也控制x轴。
    type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
    start: 0, // 左边在 10% 的位置。
    end: 100 // 右边在 60% 的位置。
}

const volLabel = {
    formatter: (param: any) => {
        return formatDate(param.value, 'MM-DD HH:mm')
    }
}

const csqLabel = {
    formatter: (param: any) => {
        return formatDate(param.value, 'MM-DD HH:mm')
    }
}

const volMax = 8
const volMin = 0

// 供电电压 / 电池电量
export const volOption = (tableData: any, startEndTime: any) => {
    return {
        title: {
            text: tableData[0].vol < 10 ? '供电电压' : '电池电量',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',

            axisPointer: {
                type: 'shadow',
                animation: false,
                axis: 'x',
                label: volLabel //时间
            }
        },
        xAxis: {
            type: 'time',
            max: startEndTime[1],
            min: startEndTime[0]
        },
        yAxis: {
            type: 'value',
            name: tableData[0].vol < 10 ? 'V' : '%',
            max: tableData[0].vol < 10 ? volMax : 100,
            min: tableData[0].vol < 10 ? volMin : 50
        },
        grid: {
            bottom: 40,
            containLabel: true
        },
        dataZoom: [dzSlider, dzInside],
        color: '#000000',
        dataset: {
            source: tableData
        },
        series: [
            {
                name: tableData[0].vol < 10 ? '电压' : '百分比',
                type: 'line',
                symbolSize: 8,
                encode: {
                    x: 'date',
                    y: 'vol'
                }
            }
        ]
    }
}

// 信号强度
const csqMax = 33
const csqMin = -1
export const csqOption = (tableData: any, startEndTime: any) => {
    return {
        title: {
            text: '信号强度',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',

            axisPointer: {
                type: 'shadow',
                animation: false,
                axis: 'x',
                label: csqLabel //时间
            }
        },
        xAxis: {
            type: 'time',
            max: startEndTime[1],
            min: startEndTime[0]
        },
        yAxis: {
            type: 'value',
            name: '信号强度',
            max: tableData[0].vol_type == 0 ? csqMax : 100,
            min: tableData[0].vol_type == 0 ? csqMin : 50
        },
        grid: {
            bottom: 40,
            containLabel: true
        },
        dataZoom: [dzSlider, dzInside],
        color: '#A511FE',
        dataset: {
            source: tableData
        },
        series: [
            {
                name: '信号强度',
                type: 'line',
                symbolSize: 8,
                encode: {
                    x: 'date',
                    y: 'csq'
                }
            }
        ]
    }
}

// 通用图表格式设定
const labelEx = {
    formatter: (param: any) => {
        return formatDate(param.value, 'MM-DD HH:mm')
    }
}
export const datasOption = (tableData: any, startEndTime: any, line_datas: any, i: any) => {
    const max =
        line_datas.line_param.set_disp_max == '1'
            ? line_datas.line_param.disp_max
            : function (value: any) {
                  return Math.ceil((value.max - value.min) * 0.1 + value.max) //向上取整
              }
    const min =
        line_datas.line_param.setMin == '1'
            ? line_datas.line_param.disp_min
            : function (value: any) {
                  return Math.floor(value.min - (value.max - value.min) * 0.1) //向下取整
              }
    return {
        title: {
            text: translateUnit(line_datas.line_param.disp_unit, 'desc'),
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',

            axisPointer: {
                type: 'shadow',
                animation: false,
                axis: 'x',
                label: labelEx
            }
        },
        xAxis: {
            type: 'time',
            max: startEndTime[1],
            min: startEndTime[0]
        },
        yAxis: {
            type: 'value',
            name: '单位: ' + translateUnit(line_datas.line_param.disp_unit),
            max,
            min
        },
        grid: {
            bottom: 40,
            containLabel: true
        },
        dataZoom: [dzSlider, dzInside],
        color: PsColor.paramColors()[i % 4],
        dataset: {
            source: tableData
        },
        series: [
            {
                name: line_datas.unit_desc,
                type: 'line',
                symbolSize: 8,
                encode: {
                    x: i * 2 + 1,
                    y: i * 2
                }
            }
        ]
    }
}
