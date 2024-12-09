const alarmColor = 'rgb(238,121,89)'
const normalColor = 'rgb(176,213,223)'
const tipColor = 'rgb(30,39,50)'
const shadowColor = '#cdcccc'

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
