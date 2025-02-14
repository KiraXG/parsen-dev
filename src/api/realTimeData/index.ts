import ajax from '@/utils/ajax'

// 获取GPS列表
export const getLbsList = (params: any) => ajax.post('/GetLbsList', params)

// 取消选中报警
export const cleanNodeAlarmFlag = (params: any) => ajax.post('/CleanNodeAlarmFlag', params)
