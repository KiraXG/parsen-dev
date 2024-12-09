import { dayjs } from 'element-plus'

// 判定当前时间是何时
export const getTime = () => {
    let message = ''
    let hours = new Date().getHours()
    if (hours <= 6) {
        message = '凌晨好'
    } else if (hours <= 9) {
        message = '早上好'
    } else if (hours <= 11) {
        message = '上午好'
    } else if (hours <= 13) {
        message = '中午好'
    } else if (hours <= 18) {
        message = '下午好'
    } else {
        message = '晚上好'
    }
    return message
}

// 格式化时间
export const formatDate = (date: any, format: any) => {
    return dayjs(date).format(format)
}

// tag 类型
export const tagTypes = ['primary', 'success', 'warning', 'info', 'danger']

// 黄熙使用的数值单位对照表,2022-02-24 确认过
export const UNIT_TABLE = [
    { type: '0', name: 'kPa', desc: '压力', coef: 1.0 },
    { type: '1', name: 'MPa', desc: '压力', coef: 0.001 },
    { type: '2', name: 'mA', desc: '电流', coef: 1.0 },
    { type: '3', name: '%', desc: '百分比', coef: 1.0 },
    { type: '4', name: 'inH2O', desc: '压力', coef: 4.014631 },
    { type: '5', name: 'ftH2O', desc: '压力', coef: 1.0 },
    { type: '6', name: 'mmH2O', desc: '压力', coef: 101.971621 },
    { type: '7', name: 'mmHg', desc: '压力', coef: 7.500615 },
    { type: '8', name: 'psi', desc: '压力', coef: 0.145038 },
    { type: '9', name: 'bar', desc: '压力', coef: 0.01 },
    { type: '10', name: 'mbar', desc: '压力', coef: 10.0 },
    { type: '11', name: 'kg/cm2', desc: '压力', coef: 0.010197 },
    { type: '12', name: 'Pa', desc: '压力', coef: 1000.0 },
    { type: '13', name: 'Torr', desc: '压力', coef: 7.500615 },
    { type: '14', name: 'ATM', desc: '压力', coef: 0.009869 },
    { type: '15', name: '', desc: '没有', coef: 1.0 },
    { type: '16', name: 'm', desc: '长度', coef: 1.0 },
    { type: '17', name: 'cm', desc: '长度', coef: 1.0 },
    { type: '18', name: 'mm', desc: '长度', coef: 1.0 },
    { type: '19', name: 'inHg', desc: '压力', coef: 0.2953 },
    { type: '20', name: 'mHg', desc: '压力', coef: 0.007500615 },
    { type: '21', name: 'mH2O', desc: '压力', coef: 0.101971621 },
    { type: '22', name: '℃', desc: '温度', coef: 1.0 },
    { type: '23', name: 'ppm', desc: '湿度', coef: 1.0 },
    { type: '24', name: 'Nm3/h', desc: '流量', coef: 1.0 },
    { type: '25', name: 'Nm3', desc: '流量', coef: 1.0 },
    { type: '26', name: 'mg/m³', desc: '密度', coef: 1.0 },
    { type: '27', name: 't/h', desc: '流量', coef: 1.0 },
    { type: '28', name: 't', desc: '流量', coef: 1.0 },
    { type: '29', name: 'm³/h', desc: '流量', coef: 1.0 },
    { type: '30', name: 'm³', desc: '流量', coef: 1.0 },
    { type: '31', name: 'L/g', desc: '密度', coef: 1.0 },
    { type: '32', name: 'L', desc: '密度', coef: 1.0 },
    { type: '33', name: '', desc: '', coef: 1.0 },
    { type: '34', name: 'g/m3', desc: '密度', coef: 1.0 },
    { type: '35', name: 'g/kg', desc: '密度', coef: 1.0 },
    { type: '36', name: 'kj/kg', desc: '热量', coef: 1.0 },
    { type: '37', name: 'kg/m³', desc: '密度', coef: 1.0 }
]

//包含了全部的压力单位
export const PRESSURE_UNITS = [
    '0',
    '1',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '19',
    '20',
    '21'
]

/**
 *
 */

//每一个仪表的每一路参量,都可以有一个特别的数据转换算法,用于显示客户的特别内容
export const ExtUnitCalculate = {
    //ID号为30的仪表的第2号参量的特殊内容
    '55_0': function (kPa: any) {
        const rou = 426 //426 kg/m3
        const g = 9.8 //9.8 N/kg
        const hi = 0.325 //罐体椭圆厚度
        const l = 12.48 //罐体圆柱长
        const r = 1.2 //罐体半径
        const v = 60 //罐体总体积 m3
        //以上是罐体常数

        kPa = Math.max(kPa, 0) //负压力先变0,因为高度不可以算出来是负数

        let h = (kPa * 1000) / rou / g //注意pIn 的单位是 kPa,所以要乘 1000
        h = Math.min(h, r * 2)

        const v1 = v / 2 + 2 * hi * Math.PI * (h - r) * (1 - ((h - r) * (h - r)) / (3 * r * r * r))
        const v2 = (h - r) * Math.sqrt(2 * h * r - h * h)
        const v3 = r * r * Math.asin((h - r) / r)
        const vh = v1 + l * (v2 + v3)
        const tonne = (vh * rou) / 1000

        return vh.toFixed(2) + '立方米  ' + tonne.toFixed(2) + '吨'
    },

    //云南氧气厂的计算公式
    '10_0': function (kPa: any) {
        const rou = 1140
        const mmWG = (kPa * 250) / 2.45
        let v = 0
        if (mmWG < 250) {
            v = (4.16 / 1000000) * mmWG * mmWG
        } else if (mmWG < 500) {
            v = (3.2 / 1000000) * mmWG * mmWG + 0.06
        } else if (mmWG < 750) {
            v = (2.18 / 1000000) * mmWG * mmWG + 0.316
        } else if (mmWG < 5500) {
            v = (2.76 / 1000) * mmWG - 0.53
        } else if (mmWG < 5750) {
            v = (2.275 / 10000000) * mmWG * mmWG + 7.747
        } else if (mmWG < 6000) {
            v = (1.26 / 10000000) * mmWG * mmWG + 11.1
        } else {
            v = 15.64
        }
        const tonne = (v * rou) / 1000
        return v.toFixed(2) + ' 立方米' + tonne.toFixed(2) + '吨'
    },

    '324_0': function (kPa: any) {
        const rou = 1101 //液态 CO2 密度
        const g = 9.7913 //成都的g值
        const H = (kPa * 1000) / rou / g //罐内液位高度,以米为单位
        const DOT_POS = 3 //输出小数点位数

        let v = 0
        let hIndex = 0

        //h是圆台下面的总高度，hl是本圆台的高度，r1是圆台下半径（短），r2是圆台上半径（长），v是圆台下面总体积
        const CT = [
            { h: 0.0, hl: 0.008841, r1: 0.0, r2: 0.176817, v: 0.0 },
            { h: 0.008841, hl: 0.028291, r1: 0.176817, r2: 0.353635, v: 0.000289 },
            { h: 0.037132, hl: 0.049509, r1: 0.353635, r2: 0.530452, v: 0.006773 },
            { h: 0.086641, hl: 0.084872, r1: 0.530452, r2: 0.717269, v: 0.037571 },
            { h: 0.171513, hl: 0.060118, r1: 0.717269, r2: 0.789837, v: 0.142121 },
            { h: 0.231631, hl: 0.070727, r1: 0.789837, r2: 0.860491, v: 0.24945 },
            { h: 0.302358, hl: 0.074263, r1: 0.860491, r2: 0.887623, v: 0.400834 },
            { h: 0.376621, hl: 0.0984, r1: 0.887623, r2: 0.9, v: 0.579087 }
        ]

        //看看高度是落在哪个区间
        for (hIndex = 0; hIndex < CT.length; ++hIndex) {
            if (H < CT[hIndex].h + CT[hIndex].hl) {
                break
            }
        }

        //如果高度值没有超出下圆弧，使用上述圆弧计算表出结果
        if (hIndex < CT.length) {
            const T = CT[hIndex] //T 是表格的某个元素
            const r1 = T.r1 //r1 是圆台下面短半径
            const dh = H - T.h //dh 是超出圆台部分的高度
            const r2 = T.r2 //r2 是圆台上面的长半径
            const Rtop = (dh / T.hl) * (r2 - r1) + r1 //Rtop 是实时液位处的半径，通过圆台公式计出
            v = T.v + (Math.PI * (Rtop * Rtop + r1 * r1 + Rtop * r1) * dh) / 3

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //如果高度值没有超出上圆弧，这是大部分的情况，使用下圆弧总值 + 圆柱体积计算公式出结果
        const H_BOTTOM = 0.475021 //底下圆弧的高度
        const V_BOTTOM = 0.826057 //底下圆弧的体积
        if (H < 3.5 + H_BOTTOM) {
            v = V_BOTTOM + Math.PI * 0.9 * 0.9 * (H - H_BOTTOM)

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //顶部封口计算表，注意下面的封口，圆锥是向下的，而上面的封口，圆锥是向上的。
        //h是圆台下面的总高度，hl是本圆台的高度，r1是圆台上半径（短），r2是圆台下半径（长），v是圆台下面总体积
        const CTT = [
            { h: 0.0, hl: 0.0984, r1: 0.887623, r2: 0.9, v: 0.0 },
            { h: 0.0984, hl: 0.074263, r1: 0.860491, r2: 0.887623, v: 0.24697 },
            { h: 0.172663, hl: 0.070727, r1: 0.789837, r2: 0.860491, v: 0.425223 },
            { h: 0.24339, hl: 0.060118, r1: 0.717269, r2: 0.789837, v: 0.576607 },
            { h: 0.303508, hl: 0.084872, r1: 0.530452, r2: 0.717269, v: 0.683936 },
            { h: 0.38838, hl: 0.049509, r1: 0.353635, r2: 0.530452, v: 0.788486 },
            { h: 0.437889, hl: 0.028291, r1: 0.176817, r2: 0.353635, v: 0.819284 },
            { h: 0.46618, hl: 0.008841, r1: 0.0, r2: 0.176817, v: 0.825768 }
        ]

        const V_MIDDLE = Math.PI * 0.9 * 0.9 * 3.5 //中间圆柱部分的体积

        const HT = H - 3.5 - H_BOTTOM //计出顶部超了多少米

        //看看超出的高度是落在哪个区间
        for (hIndex = 0; hIndex < CTT.length; ++hIndex) {
            if (HT < CTT[hIndex].h + CTT[hIndex].hl) {
                break
            }
        }

        //如果是正常情况
        if (hIndex < CTT.length) {
            const T = CTT[hIndex] //T 是表格的某个元素
            const r1 = T.r1 //r1 是圆台下面短半径
            const dh = HT - T.h //dh 是超出圆台部分的高度
            const r2 = T.r2 //r2 是圆台上面的长半径
            const Rtop = r2 - (dh / T.hl) * (r2 - r1) //Rtop 是实时液位处的半径，通过圆台公式计出
            v = V_BOTTOM + V_MIDDLE + T.v + (Math.PI * (Rtop * Rtop + r2 * r2 + Rtop * r2) * dh) / 3

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //到达最后，最极端的情况，压力值超出范围，直接返回最大值。
        v = 10.56
        const tonne = (v * rou) / 1000
        return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
    },

    '325_0': function (kPa: any) {
        const rou = 1410 //液态 CO2 密度
        const g = 9.7913 //成都的g值
        const H = (kPa * 1000) / rou / g //罐内液位高度,以米为单位
        const DOT_POS = 3 //输出小数点位数
        const R = 1.9 / 2
        const H_MIDDLE = 6.75

        let v = 0
        let hIndex = 0

        //h是圆台下面的总高度，hl是本圆台的高度，r1是圆台下半径（短），r2是圆台上半径（长），v是圆台下面总体积
        const CT = [
            { h: 0.0, hl: 0.010468, r1: 0.0, r2: 0.19759, v: 0.0 },
            { h: 0.010468, hl: 0.043182, r1: 0.19759, r2: 0.434435, v: 0.000428 },
            { h: 0.05365, hl: 0.066736, r1: 0.434435, r2: 0.632025, v: 0.01461 },
            { h: 0.120386, hl: 0.075895, r1: 0.632025, r2: 0.769421, v: 0.074904 },
            { h: 0.196281, hl: 0.079821, r1: 0.769421, r2: 0.864945, v: 0.192352 },
            { h: 0.276102, hl: 0.069353, r1: 0.864945, r2: 0.915978, v: 0.360001 },
            { h: 0.345455, hl: 0.073278, r1: 0.915978, r2: 0.946074, v: 0.532808 },
            { h: 0.418733, hl: 0.081129, r1: 0.946074, r2: 0.95, v: 0.732374 }
        ]

        //看看高度是落在哪个区间
        for (hIndex = 0; hIndex < CT.length; ++hIndex) {
            if (H < CT[hIndex].h + CT[hIndex].hl) {
                break
            }
        }

        //如果高度值没有超出下圆弧，使用上述圆弧计算表出结果
        if (hIndex < CT.length) {
            const T = CT[hIndex] //T 是表格的某个元素
            const r1 = T.r1 //r1 是圆台下面短半径
            const dh = H - T.h //dh 是超出圆台部分的高度
            const r2 = T.r2 //r2 是圆台上面的长半径
            const Rtop = (dh / T.hl) * (r2 - r1) + r1 //Rtop 是实时液位处的半径，通过圆台公式计出
            v = T.v + (Math.PI * (Rtop * Rtop + r1 * r1 + Rtop * r1) * dh) / 3

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //如果高度值没有超出上圆弧，这是大部分的情况，使用下圆弧总值 + 圆柱体积计算公式出结果
        const H_BOTTOM = 0.499862 //底下圆弧的高度
        const V_BOTTOM = 0.96145 //底下圆弧的体积
        if (H < H_MIDDLE + H_BOTTOM) {
            v = V_BOTTOM + Math.PI * R * R * (H - H_BOTTOM)

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //顶部封口计算表，注意下面的封口，圆锥是向下的，而上面的封口，圆锥是向上的。
        //h是圆台下面的总高度，hl是本圆台的高度，r1是圆台上半径（短），r2是圆台下半径（长），v是圆台下面总体积
        const CTT = [
            { h: 0.0, hl: 0.081129, r1: 0.946074, r2: 0.95, v: 0.0 },
            { h: 0.081129, hl: 0.073278, r1: 0.915978, r2: 0.946074, v: 0.229076 },
            { h: 0.154408, hl: 0.069353, r1: 0.864945, r2: 0.915978, v: 0.428642 },
            { h: 0.22376, hl: 0.079821, r1: 0.769421, r2: 0.864945, v: 0.601449 },
            { h: 0.303581, hl: 0.075895, r1: 0.632025, r2: 0.769421, v: 0.769098 },
            { h: 0.379477, hl: 0.066736, r1: 0.434435, r2: 0.632025, v: 0.886546 },
            { h: 0.446212, hl: 0.043182, r1: 0.19759, r2: 0.434435, v: 0.946841 },
            { h: 0.489394, hl: 0.010468, r1: 0.0, r2: 0.19759, v: 0.961022 }
        ]

        const V_MIDDLE = Math.PI * R * R * H_MIDDLE //中间圆柱部分的体积

        const HT = H - H_MIDDLE - H_BOTTOM //计出顶部超了多少米

        //看看超出的高度是落在哪个区间
        for (hIndex = 0; hIndex < CTT.length; ++hIndex) {
            if (HT < CTT[hIndex].h + CTT[hIndex].hl) {
                break
            }
        }

        //如果是正常情况
        if (hIndex < CTT.length) {
            const T = CTT[hIndex] //T 是表格的某个元素
            const r1 = T.r1 //r1 是圆台下面短半径
            const dh = HT - T.h //dh 是超出圆台部分的高度
            const r2 = T.r2 //r2 是圆台上面的长半径
            const Rtop = r2 - (dh / T.hl) * (r2 - r1) //Rtop 是实时液位处的半径，通过圆台公式计出
            v = V_BOTTOM + V_MIDDLE + T.v + (Math.PI * (Rtop * Rtop + r2 * r2 + Rtop * r2) * dh) / 3

            const tonne = (v * rou) / 1000
            return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
        }

        //到达最后，最极端的情况，压力值超出范围，直接返回最大值。
        v = 21.055
        const tonne = (v * rou) / 1000
        return v.toFixed(DOT_POS) + ' 立方米 ' + tonne.toFixed(DOT_POS) + '吨'
    }
}

/**
 *
 */
const PsColor = {
    PS_BLUE: '#409EFF', //派晟蓝
    PS_GREEN: '#67C23A',
    PS_YELLOW: '#E6A23C',
    PS_PIN: '#F56C6C',
    PS_GREY: '#DCDFE6',

    PS_GANGHUA_LINE_1: '#4353d2', //港华燃气通道1的颜色
    PS_GANGHUA_LINE_2: '#a7a304', //港华燃气通道2的颜色
    PS_GANGHUA_LINE_3: '#a7a304', //
    PS_GANGHUA_LINE_4: '#3a9404',
    PS_GANGHUA_LINES: function (line: any) {
        //港华燃气通道颜色数组
        line = parseInt(line)
        const colorArr = [this.PS_GANGHUA_LINE_1, this.PS_GANGHUA_LINE_2, this.PS_GANGHUA_LINE_3]
        if (line < 0) {
            line = 0
        }
        if (line >= colorArr.length) {
            line = colorArr.length - 1
        }
        return colorArr[line]
    },

    PS_PROJECT_ICON: 'rgb(20,110,0)', //工程绿,树菜单处工程图标的颜色
    PS_YIBIAO_ICON: 'rgb(0, 125, 255)', //仪表蓝,树菜单处仪表图标的颜色

    PS_LOPOWER_GREY: '#909399', //缺电灰
    PS_SUCCESS_GREEN: '#4daf1c', //成功绿
    PS_WARNING_YELLOW: '#fb9f16', //警告黄
    PS_ALARM_RED: '#f10606', //警告红

    paramColors: function () {
        return [this.PS_BLUE, this.PS_GREEN, this.PS_YELLOW, this.PS_PIN]
    }
}

export const DRAW_DATA_OBJECT = {
    //卧罐
    drawDataWoGuan: {
        imgSrc: 'wo_guan.png',
        rect: {
            l: 105,
            r: 285,
            t: 308,
            b: 442
        }
    },

    //立罐
    drawDataLiGuan: {
        imgSrc: 'li_guan.png',
        rect: {
            l: 44,
            r: 196,
            t: 166,
            b: 353
        }
    }
}

export const DrawFunc = {
    kPaToMeter(kPa: any, rou: any, g: any) {
        return (kPa * 1000) / rou / g
    },

    kPaToMmh2o: function (kPa: any) {
        return kPa * 101.971621 //101.9716 是 kPa 与 mmH2O 的转换系数
    },

    //立方米转吨
    m3ToTonne(vh: any, rou: any) {
        const tonne = (vh * rou) / 1000
        return tonne
    },

    hToVolumeQueShanLNG(h: any) {
        const hi = 0.325 //罐体椭圆厚度
        const l = 12.48 //罐体圆柱长
        const r = 1.2 //罐体半径
        const v = 60 //罐体总体积 m3

        const v1 = v / 2 + 2 * hi * Math.PI * (h - r) * (1 - ((h - r) * (h - r)) / (3 * r * r * r))
        const v2 = (h - r) * Math.sqrt(2 * h * r - h * h)
        const v3 = r * r * Math.asin((h - r) / r)
        const vh = v1 + l * (v2 + v3)

        return vh
    },

    hToVolumeWenShanO2(h: any) {
        const rou = 1140
        const g = 9.8
        const kPa = (rou * g * h) / 1000
        const mmWG = (kPa * 250) / 2.45
        let v = 0
        if (mmWG < 250) {
            v = (4.16 / 1000000) * mmWG * mmWG
        } else if (mmWG < 500) {
            v = (3.2 / 1000000) * mmWG * mmWG + 0.06
        } else if (mmWG < 750) {
            v = (2.18 / 1000000) * mmWG * mmWG + 0.316
        } else if (mmWG < 5500) {
            v = (2.76 / 1000) * mmWG - 0.53
        } else if (mmWG < 5750) {
            v = (2.275 / 10000000) * mmWG * mmWG + 7.747
        } else if (mmWG < 6000) {
            v = (1.26 / 10000000) * mmWG * mmWG + 11.1
        } else {
            v = 15.64
        }
        return v
    },

    drawYunNanLiGuan: function (drawObj: any, kPa: any, MPa: any, tempe: any, rou: any, g: any) {
        //console.log('drawCanvas dataInfos = ...');
        //console.log(dataInfos);
        let domCanvas: any = document.getElementById('cav_guan')
        let ctx = domCanvas.getContext('2d')
        let img = new Image()
        img.src = drawObj.imgSrc //"wo_guan.png";
        const rect = drawObj.rect

        img.onload = function () {
            ctx.drawImage(img, 0, 0, domCanvas.width, domCanvas.height)

            let points = [
                { x: rect.l, y: rect.t },
                { x: rect.r, y: rect.t },
                { x: rect.r, y: rect.b },
                { x: rect.l, y: rect.b }
            ]

            for (let point of points) {
                point.x = (point.x * domCanvas.width) / img.width
                point.y = (point.y * domCanvas.height) / img.height
            }

            let lg = ctx.createLinearGradient(
                (points[0].x + points[1].x) / 2,
                (points[0].y + points[1].y) / 2,
                (points[2].x + points[3].x) / 2,
                (points[2].y + points[3].y) / 2
            )

            lg.addColorStop(0, 'red')
            lg.addColorStop(0.5, PsColor.PS_PIN)
            lg.addColorStop(1, PsColor.PS_GREEN)

            const dY = points[3].y - points[0].y

            //const h = drawObj.getHeight(that.lastSelectedNode.D1);

            //const newY = points[3].y - (dY * h / drawObj.maxH);

            let gaodu = DrawFunc.kPaToMeter(kPa, rou, g)
            gaodu = Math.max(gaodu, 0)
            gaodu = Math.min(gaodu, 5.263)

            const newY = points[3].y - (dY * gaodu) / 5.263

            points[0].y = newY
            points[1].y = newY

            //ctx.fillStyle = 'grey';
            //ctx.fillRect(rect.l,rect.t,rect.r-rect.l,rect.b-rect.t);
            //ctx.stroke();

            ctx.beginPath()
            ctx.moveTo(points[3].x, points[3].y)
            for (let point of points) {
                ctx.lineTo(point.x, point.y)
            }
            ctx.closePath()
            //ctx.fillStyle = '#FF0000';
            ctx.fillStyle = lg
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = 'black'
            ctx.font = '24px Times New Roman'
            // const mmH2O = DrawFunc.kPaToMmh2o(kPa).toFixed(2);
            // ctx.fillText(mmH2O + ' mmH2O',30,30);

            // ctx.fillText(gaodu.toFixed(2) + ' 米',30,100);

            const textX = 230

            ctx.fillText(kPa + 'kPa', textX, 30)

            //const ap = (MPa / 1000).toFixed(2);
            //ctx.fillText(ap + ' MPa',textX,100);
            ctx.fillText(MPa + ' MPa', textX, 100)

            const volume = DrawFunc.hToVolumeWenShanO2(gaodu).toFixed(2)
            ctx.fillText(volume + ' m³', textX, 170)

            ctx.fillText(tempe + ' ℃', textX, 240)
        }
    },

    drawCanvas: function (drawObj: any, kPa: any, MPa: any, tempe: any, rou: any, g: any) {
        //console.log('drawCanvas dataInfos = ...');
        //console.log(dataInfos);
        let domCanvas: any = document.getElementById('cav_guan')
        let ctx = domCanvas.getContext('2d')
        let img = new Image()
        img.src = drawObj.imgSrc //"wo_guan.png";
        const rect = drawObj.rect

        img.onload = function () {
            ctx.drawImage(img, 0, 0, domCanvas.width, domCanvas.height)

            let points = [
                { x: rect.l, y: rect.t },
                { x: rect.r, y: rect.t },
                { x: rect.r, y: rect.b },
                { x: rect.l, y: rect.b }
            ]

            for (let point of points) {
                point.x = (point.x * domCanvas.width) / img.width
                point.y = (point.y * domCanvas.height) / img.height
            }

            let lg = ctx.createLinearGradient(
                (points[0].x + points[1].x) / 2,
                (points[0].y + points[1].y) / 2,
                (points[2].x + points[3].x) / 2,
                (points[2].y + points[3].y) / 2
            )

            lg.addColorStop(0, 'red')
            lg.addColorStop(0.5, PsColor.PS_PIN)
            lg.addColorStop(1, PsColor.PS_GREEN)

            const dY = points[3].y - points[0].y

            //const h = drawObj.getHeight(that.lastSelectedNode.D1);

            //const newY = points[3].y - (dY * h / drawObj.maxH);

            let gaodu = DrawFunc.kPaToMeter(kPa, rou, g)
            gaodu = Math.max(gaodu, 0)
            gaodu = Math.min(gaodu, 2.4)

            const newY = points[3].y - (dY * gaodu) / 2.4

            points[0].y = newY
            points[1].y = newY

            //ctx.fillStyle = 'grey';
            //ctx.fillRect(rect.l,rect.t,rect.r-rect.l,rect.b-rect.t);
            //ctx.stroke();

            ctx.beginPath()
            ctx.moveTo(points[3].x, points[3].y)
            for (let point of points) {
                ctx.lineTo(point.x, point.y)
            }
            ctx.closePath()
            //ctx.fillStyle = '#FF0000';
            ctx.fillStyle = lg
            ctx.fill()
            ctx.stroke()

            ctx.fillStyle = 'black'
            ctx.font = '24px Times New Roman'
            const mmH2O = DrawFunc.kPaToMmh2o(kPa).toFixed(2)
            ctx.fillText(mmH2O + ' mmH2O', 30, 30)

            ctx.fillText(gaodu.toFixed(2) + ' 米', 30, 100)

            const ap = (MPa / 1000).toFixed(2)
            ctx.fillText(ap + ' MPa', 30, 170)

            const volume = DrawFunc.hToVolumeQueShanLNG(gaodu).toFixed(2)
            ctx.fillText(volume + ' m³', 200, 30)

            const weight = DrawFunc.m3ToTonne(volume, rou).toFixed(2)
            ctx.fillText(weight + ' 吨', 200, 100)

            ctx.fillText(tempe + ' ℃', 200, 170)
        }
    } //end of drawCanvas
}

//每个仪表有一个总开关,是否需要画图
export const ExtGraphDrawing = {
    '10': {
        direction: 'v', //立罐
        rou: 1140,
        g: 9.8,
        drawData: DRAW_DATA_OBJECT.drawDataLiGuan,
        drawFunc: DrawFunc.drawYunNanLiGuan
    },

    '55': {
        direction: 'h', //h 是卧罐, v是立罐

        minKpa: 0,
        maxKpa: 15,
        splitKpa: 5, //刻度分隔
        colorKpa: PsColor.PS_BLUE,
        titleKpa: '液位差压',
        formatterKpa: function (value: any) {
            return value.toFixed(2) + ' kPa'
        },

        minH: 0,
        maxH: 2.4, //单位是米
        splitH: 3, //刻度分隔
        colorH: PsColor.PS_YELLOW,
        titleH: '液位高度',

        minV: 0,
        maxV: 60,
        splitV: 6,
        colorV: PsColor.PS_GREEN,
        titleV: '体积',
        formatterV: function (value: any) {
            return value.toFixed(2) + ' 立方米'
        },

        minT: 0,
        maxT: function () {
            return (this.maxV * this.rou) / 1000
        },

        splitT: 6,
        colorT: PsColor.PS_PIN,
        titleT: '重量',
        formatterT: function (value: any) {
            return value.toFixed(2) + ' 吨'
        },

        rou: 426,
        g: 9.8,

        drawData: DRAW_DATA_OBJECT.drawDataWoGuan,
        drawFunc: DrawFunc.drawCanvas,

        maxKpaToMaxHeight: function (kPa: any) {
            return (kPa * 1000) / this.rou / this.g //注意pIn 的单位是 kPa,所以要乘 1000
        },

        kPaToVolume: function (kPa: any) {
            const hi = 0.325 //罐体椭圆厚度
            const l = 12.48 //罐体圆柱长
            const r = 1.2 //罐体半径
            const v = 60 //罐体总体积 m3
            //以上是罐体常数

            kPa = Math.max(kPa, 0) //负压力先变0,因为高度不可以算出来是负数

            let h = (kPa * 1000) / this.rou / this.g //注意pIn 的单位是 kPa,所以要乘 1000
            h = Math.min(h, r * 2)

            const v1 =
                v / 2 + 2 * hi * Math.PI * (h - r) * (1 - ((h - r) * (h - r)) / (3 * r * r * r))
            const v2 = (h - r) * Math.sqrt(2 * h * r - h * h)
            const v3 = r * r * Math.asin((h - r) / r)
            const vh = v1 + l * (v2 + v3)
            return vh
        },

        getHeight: function (kPa: any) {
            kPa = Math.max(kPa, 0) //负压力先变0,因为高度不可以算出来是负数
            let h = (kPa * 1000) / this.rou / this.g //注意pIn 的单位是 kPa,所以要乘 1000
            h = Math.min(h, this.maxH)
            return h
        },

        getVolume: function (h: any) {
            const hi = 0.325 //罐体椭圆厚度
            const l = 12.48 //罐体圆柱长
            const r = 1.2 //罐体半径
            const v = 60 //罐体总体积 m3

            const v1 =
                v / 2 + 2 * hi * Math.PI * (h - r) * (1 - ((h - r) * (h - r)) / (3 * r * r * r))
            const v2 = (h - r) * Math.sqrt(2 * h * r - h * h)
            const v3 = r * r * Math.asin((h - r) / r)
            const vh = v1 + l * (v2 + v3)

            return vh
        },

        getTonne: function (vh: any) {
            const rou = 426
            const tonne = (vh * rou) / 1000
            return tonne
        }
    },

    '56': {
        direction: 'h', //h 是卧罐, v是立罐

        minH: 0,
        maxH: 2.4, //单位是米

        minV: 0,
        maxV: 60,

        radius: 1.2, //罐体半径

        rou: 426, //质量密度
        g: 9.8, //当地重力加速度

        lAside: 0.325, //卧罐的椭圆厚度
        length: 12.48, //卧罐的长度

        drawData: DRAW_DATA_OBJECT.drawDataWoGuan,
        drawFunc: DrawFunc.drawCanvas,

        maxKpaToMaxHeight: function (kPa: any) {
            return (kPa * 1000) / this.rou / this.g //注意pIn 的单位是 kPa,所以要乘 1000
        },

        // kPa 值转体积
        kPaToVolume: function (kPa: any) {
            const r = this.radius
            const l = this.length
            const hi = 0.325 //罐体椭圆厚度
            const v = 60 //罐体总体积 m3

            kPa = Math.max(kPa, 0) //负压力先变0,因为高度不可以算出来是负数

            let h = (kPa * 1000) / this.rou / this.g //注意pIn 的单位是 kPa,所以要乘 1000
            h = Math.min(h, this.maxH) //高度不可以大于最大高度

            const v1 =
                v / 2 + 2 * hi * Math.PI * (h - r) * (1 - ((h - r) * (h - r)) / (3 * r * r * r))
            const v2 = (h - r) * Math.sqrt(2 * h * r - h * h)
            const v3 = r * r * Math.asin((h - r) / r)
            const vh = v1 + l * (v2 + v3)
            return vh
        },

        //立方米转吨
        m3ToTonne: function (vh: any) {
            const tonne = (vh * this.rou) / 1000
            return tonne
        }
    }
}
