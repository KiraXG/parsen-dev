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
