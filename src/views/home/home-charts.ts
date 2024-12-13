import { fontSize } from '@/utils'

const companyColor = 'rgb(102,169,201)'
const itemColor = 'rgb(138,188,209)'
const nodeColor = 'rgb(147,213,220)'
const alarmColor = 'rgb(238,121,89)'
const normalColor = 'rgb(176,213,223)'
const offlineColor = 'rgb(238,121,89)'
const onlineColor = 'rgb(198,230,232)'
const tipColor = 'rgb(30,39,50)'
const shadowColor = '#cdcccc'

// 公司总数
export const companyOption = (company: any) => {
    return {
        title: {
            text: '公司总数',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: fontSize(20),
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        color: [companyColor],
        series: [
            {
                radius: ['45%', '75%'],
                type: 'pie',
                data: company,
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
                    formatter: (params: any) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    rich: {
                        r: {
                            fontSize: fontSize(25)
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

// 项目总数
export const itemOption = (item: any) => {
    return {
        title: {
            text: '项目总数',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: fontSize(20),
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        color: [itemColor],
        series: [
            {
                radius: ['45%', '75%'],
                type: 'pie',
                data: item,
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
                    formatter: (params: any) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    rich: {
                        r: {
                            fontSize: fontSize(25)
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

// 仪表总数
export const nodeOption = (node: any) => {
    return {
        title: {
            text: '仪表总数',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: fontSize(20),
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        color: [nodeColor],
        series: [
            {
                radius: ['45%', '75%'],
                type: 'pie',
                data: node,
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
                    formatter: (params: any) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    rich: {
                        r: {
                            fontSize: fontSize(25)
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

// 仪表详情
export const alarmOption = (alarm: any) => {
    return {
        title: {
            text: '仪表详情',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: fontSize(20),
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: fontSize(20)
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
                    formatter: (params: any) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    backgroundColor: 'white',
                    rich: {
                        r: {
                            fontSize: fontSize(25)
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

// 仪表状态
export const stateOption = (state: any) => {
    return {
        title: {
            text: '仪表状态',
            top: '5%',
            left: '10%',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: `{b}:{c}`,
            backgroundColor: tipColor,
            textStyle: {
                fontSize: fontSize(20),
                color: 'white'
            }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: {
                fontSize: fontSize(20)
            }
        },
        color: [onlineColor, offlineColor],
        series: [
            {
                radius: ['45%', '75%'],
                type: 'pie',
                data: state,
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
                    formatter: (params: any) => {
                        return '{r|' + params.name + '}' + '\n{r|' + params.value + '}'
                    },
                    fontFamily: 'Verdana',
                    show: true,
                    position: 'center',
                    backgroundColor: 'white',
                    rich: {
                        r: {
                            fontSize: fontSize(25)
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
